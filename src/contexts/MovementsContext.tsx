import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Movement } from '../types';
import { supabase } from '../utils/supabase';

interface MovementsContextType {
  movements: Movement[];
  lastAlert: Movement | null;
}

const MovementsContext = createContext<MovementsContextType | undefined>(undefined);

export function MovementsProvider({ children }: { children: ReactNode }) {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [lastAlert, setLastAlert] = useState<Movement | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const db = supabase;

    const fetchInitialMovements = async () => {
      const { data, error } = await db
        .from('tool_logs')
        .select('*, tools(name, icon)')
        .order('timestamp', { ascending: false })
        .limit(20);

      if (data) {
        const mapped = data.map(log => ({
          id: log.id,
          toolId: log.tool_id,
          toolName: log.tools?.name || 'Unknown Tool',
          toolIcon: log.tools?.icon || 'handyman',
          type: log.type || 'RFID_OUT',
          authorized: log.authorized,
          timestamp: new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: log.status || (log.authorized ? 'active' : 'lost'),
          checkpointId: log.checkpoint_id,
        }));
        setMovements(mapped);
      }
    };

    fetchInitialMovements();

    const channel = db
      .channel('tool_movements')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'tool_logs' },
        async (payload) => {
          const newLog = payload.new;

          const { data: tool } = await db
            .from('tools')
            .select('name, icon')
            .eq('id', newLog.tool_id)
            .single();

          const movement: Movement = {
            id: newLog.id,
            toolId: newLog.tool_id,
            toolName: tool?.name || 'Unknown Tool',
            toolIcon: tool?.icon || 'handyman',
            type: newLog.type || 'RFID_OUT',
            authorized: newLog.authorized,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            status: newLog.status || (newLog.authorized ? 'active' : 'lost'),
            checkpointId: newLog.checkpoint_id,
          };

          setMovements(prev => [movement, ...prev].slice(0, 20));
          if (!movement.authorized) {
            setLastAlert(movement);
            setTimeout(() => setLastAlert(null), 10000);
          }
        }
      )
      .subscribe();

    return () => {
      db.removeChannel(channel);
    };
  }, []);

  const value: MovementsContextType = { movements, lastAlert };

  return (
    <MovementsContext.Provider value={value}>
      {children}
    </MovementsContext.Provider>
  );
}

export function useMovements() {
  const context = useContext(MovementsContext);
  if (context === undefined) {
    throw new Error('useMovements must be used within a MovementsProvider');
  }
  return context;
}
