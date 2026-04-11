import React, { useState } from 'react';
import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import { StatCard as StatCardType, Tool } from '../types';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import ToolStateManager from '../components/Dashboard/ToolStateManager';
import { useRealtimeMovements } from '../hooks/useRealtimeMovements';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const stats: StatCardType[] = [
  { label: 'Outils totaux', value: 127, trend: 12, icon: 'inventory_2', color: 'border-primary' },
  { label: 'En utilisation', value: 23, trend: -5, icon: 'person', color: 'border-on-primary-container' },
  { label: 'Alertes Actives', value: 5, trend: undefined, icon: 'warning', color: 'border-error' },
];

export default function HomeDashboard() {
  const { movements, lastAlert } = useRealtimeMovements();
  const [tools, setTools] = useState<Tool[]>([]);

  // Load initial tools for state manager
  React.useEffect(() => {
    async function loadTools() {
      const { data } = await supabase.from('tools').select('*');
      if (data) setTools(data);
    }
    loadTools();
  }, []);

  async function handleToggleState(id: string, newState: 'authorized' | 'locked') {
    const { error } = await supabase
      .from('tools')
      .update({ state: newState })
      .eq('id', id);

    if (!error) {
      setTools(prev => prev.map(t => t.id === id ? { ...t, state: newState } : t));
    }
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopBar
        title=""
        showNotifications
        notificationCount={movements.filter(m => !m.authorized).length}
        showThemeToggle
      />

      <main className="mt-20 px-6 space-y-8">
        {/* Critical Alert Banner */}
        {lastAlert && (
          <div className="bg-red-500/20 border border-red-500/50 p-4 rounded-xl flex items-center gap-3 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.3)]">
            <span className="material-symbols-outlined text-red-500">warning</span>
            <div className="flex-1">
              <p className="text-red-400 text-xs font-bold uppercase tracking-widest">Alerte de Sécurité</p>
              <p className="text-on-surface text-sm font-medium">
                {lastAlert.toolName} détecté au {lastAlert.checkpointId} sans autorisation !
              </p>
            </div>
            <button
              onClick={() => {
                alert('Alerte acquittée');
              }}
              className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-[10px] font-bold uppercase hover:bg-red-600 transition-colors"
            >
              Acquitter
            </button>
          </div>
        )}

        <SearchBar showFilter />

        {/* KPI Stats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Indicateurs Temps Réel
            </h2>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </section>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Real-time Feed */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Flux d'Activité RFID
              </h2>
              <span className="material-symbols-outlined text-outline cursor-pointer">history</span>
            </div>
            <ActivityFeed movements={movements} />
          </section>

          {/* Admin State Manager */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Gestion des États
              </h2>
              <span className="text-xs text-primary font-bold uppercase cursor-pointer">Actualiser</span>
            </div>
            <ToolStateManager tools={tools} onToggleState={handleToggleState} />
          </section>
        </div>

        {/* Map Preview */}
        <section className="h-48 rounded-2xl overflow-hidden relative shadow-2xl mt-8">
          <img
            alt="Map location preview"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyih90kcRyhB0XGfAoEL5ISNEfUEAXD6UwcdCL1YJ6sTPdu4SiJa8_7GsYqDOTCmQROYKrZ0EWgdJMTV0RliLgyJbPsnrTONe2XvxoKmU9_1fKXm4BexJRGb7yMKX3FQOrYzX5vdjMaxs2aoc7GNS1p93ThwuNtOU3_b4pyHT-3ivXulZCsbU9vIqgYVmvZ6F0rHxgLp3h-Ykm8FIqP2ks49C3sZPZlTp07mA11XYALTnpjP2TY4CfR3DVYFw-27K1Q9fi-6VtfNn"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-surface-container-high/80 backdrop-blur-md px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">
              Radar Actif : {movements.length} Signaux
            </span>
          </div>
        </section>
      </main>

      <BottomNav activeTab="home" />
    </div>
  );
}
