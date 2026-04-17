import { useNavigate } from 'react-router-dom';
import { useEffect, useState, useCallback } from 'react';
import BottomNav from '../components/BottomNav';
import SwipeGesture from '../components/SwipeGesture';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import ToolCard from '../components/ToolCard';
import { Tool } from '../types';
import { useUIFilters } from '../contexts/UIFiltersContext';
import { getAllTools, initDatabase, generateId, Tool as DBTool } from '../utils/db';

const filters = ['Tous', 'RFID', 'BLE', 'RFID+BLE'];

const categoryLabels: Record<string, string> = {
  'Électroportatif': 'Électroportatif',
  'Mesure & Traçage': 'Mesure & Traçage',
  'Maintenance': 'Maintenance',
};

export default function InventoryList() {
  const { activeFilter, setActiveFilter } = useUIFilters();
  const navigate = useNavigate();
  
  const [tools, setTools] = useState<DBTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load data from SQLite
  useEffect(() => {
    async function loadTools() {
      try {
        await initDatabase();
        const data = await getAllTools();
        setTools(data);
      } catch (err) {
        console.error('[InventoryList] Load failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    loadTools();
  }, []);

  const handleSwipeBack = useCallback(() => {
    navigate('/home');
  }, [navigate]);

  // Convert DB tool to UI tool
  const toTool = (dbTool: DBTool): Tool => ({
    id: dbTool.id,
    name: dbTool.name,
    category: dbTool.category || 'Électroportatif',
    serialNumber: dbTool.serial_number || '',
    rfidEnabled: Boolean(dbTool.rfid_enabled),
    bleEnabled: Boolean(dbTool.ble_enabled),
    status: dbTool.status || 'available',
    price: dbTool.price || 0,
    state: 'authorized',
  });

  // Apply filter
  const filteredTools = tools.filter(tool => {
    if (activeFilter === 'Tous') return true;
    if (activeFilter === 'RFID') return tool.rfid_enabled && !tool.ble_enabled;
    if (activeFilter === 'BLE') return tool.ble_enabled && !tool.rfid_enabled;
    if (activeFilter === 'RFID+BLE') return tool.rfid_enabled && tool.ble_enabled;
    return true;
  }).map(toTool);

  // Group by category
  const groupedTools = filteredTools.reduce<Record<string, Tool[]>>((acc, tool) => {
    const cat = tool.category || 'Électroportatif';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(tool);
    return acc;
  }, {});

  // Stats
  const totalTools = tools.length;
  const categoriesCount = Object.keys(groupedTools).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center">
          <span className="material-symbols-outlined text-4xl animate-spin" style={{ color: '#06C167' }}>
            sync
          </span>
          <p className="mt-4 text-sm" style={{ color: '#666' }}>Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <SwipeGesture onSwipeLeft={handleSwipeBack}>
      <div className="min-h-screen pb-32" style={{ background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)' }}>
        <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(18, 18, 18, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <TopBar
            title="Inventaire"
            showSettings
            showThemeToggle
          />
        </div>

        <main className="pt-32 pb-32 px-6 max-w-2xl mx-auto">
          {/* Header */}
          <section className="mb-8">
            <h2 className="font-headline text-4xl font-extrabold tracking-tight" style={{ color: '#FAFAFA' }}>
              Inventaire
            </h2>
            <p className="font-label text-xs font-bold uppercase tracking-widest mt-2" style={{ color: '#06C167' }}>
              {totalTools} OUTILS · {categoriesCount} CATÉGORIES
            </p>
          </section>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
              <p className="text-sm" style={{ color: '#EF4444' }}>{error}</p>
            </div>
          )}

          {/* Search & Filter Area */}
          <section className="space-y-6 mb-10">
            <SearchBar showFilter />
            
            <FilterChips
              filters={filters}
              activeFilter={activeFilter}
              onSelectFilter={setActiveFilter}
            />
          </section>

          {/* Empty state */}
          {filteredTools.length === 0 && (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-6xl" style={{ color: '#333' }}>
                construction
              </span>
              <p className="mt-4 text-lg" style={{ color: '#666' }}>
                Aucun outil trouvé
              </p>
              <p className="text-sm mt-2" style={{ color: '#444' }}>
                Appuyez sur + pour ajouter un outil
              </p>
            </div>
          )}

          {/* Grouped List */}
          <section className="space-y-8">
            {Object.entries(groupedTools).map(([category, categoryTools]) => (
              <div key={category} className="space-y-4">
                <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <h3 className="font-headline text-lg font-bold" style={{ color: '#FAFAFA' }}>
                    {categoryLabels[category] || category}
                  </h3>
                  <span className="text-[10px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                    {categoryTools.length} Outils
                  </span>
                </div>
                
                {categoryTools.map((tool) => (
                  <ToolCard key={tool.id} tool={tool} />
                ))}
              </div>
            ))}
          </section>
        </main>

        {/* FAB - Minimal design (no glow) */}
        <button 
          className="fixed right-6 bottom-28 w-14 h-14 flex items-center justify-center text-white active:scale-90 transition-transform z-40"
          style={{ 
            background: '#1E1E1E',
            borderRadius: '999px',
            border: '1px solid #333',
          }}
          aria-label="Ajouter un outil"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>

        {/* Bottom Navigation */}
        <BottomNav activeTab="inventory" />
      </div>
    </SwipeGesture>
  );
}