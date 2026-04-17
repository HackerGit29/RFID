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
import { getAllTools, initDatabase, generateId, addTool, Tool as DBTool } from '../utils/db';

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
  const [showAddModal, setShowAddModal] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolCategory, setNewToolCategory] = useState('Électroportatif');
  const [newToolSerial, setNewToolSerial] = useState('');
  const [newToolBLE, setNewToolBLE] = useState(false);

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
        <div className="h-2"></div>

        <main className="pb-32 px-6 max-w-2xl mx-auto">
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

        {/* FAB - Minimal design - Ouvre Add Modal */}
        <button 
          className="fixed right-6 bottom-28 w-14 h-14 flex items-center justify-center text-white active:scale-90 transition-transform z-40"
          style={{ 
            background: '#1E1E1E',
            borderRadius: '999px',
            border: '1px solid #333',
          }}
          aria-label="Ajouter un outil"
          onClick={() => setShowAddModal(true)}
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>

        {/* Add Tool Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddModal(false)}></div>
            <div className="relative w-full max-w-md p-6 rounded-2xl" style={{ background: '#1a1a1a', border: '1px solid #333' }}>
              <h2 className="text-xl font-bold text-white mb-4">Ajouter un outil</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-white/60 mb-1">Nom</label>
                  <input
                    type="text"
                    value={newToolName}
                    onChange={(e) => setNewToolName(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#121212] border border-white/10 text-white"
                    placeholder="Nom de l'outil..."
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-white/60 mb-1">Catégorie</label>
                  <select
                    value={newToolCategory}
                    onChange={(e) => setNewToolCategory(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#121212] border border-white/10 text-white"
                  >
                    <option value="Électroportatif">Électroportatif</option>
                    <option value="Mesure & Traçage">Mesure & Traçage</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-xs text-white/60 mb-1">Numéro de série</label>
                  <input
                    type="text"
                    value={newToolSerial}
                    onChange={(e) => setNewToolSerial(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#121212] border border-white/10 text-white"
                    placeholder="SN-XXXXX"
                  />
                </div>

                {/* BLE Toggle */}
                <div className="flex items-center justify-between mt-4 p-3 rounded-lg" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-white/70">bluetooth</span>
                    <span className="text-sm text-white">Activer BLE</span>
                  </div>
                  <button
                    onClick={() => setNewToolBLE(!newToolBLE)}
                    className={`w-12 h-6 rounded-full relative transition-colors ${newToolBLE ? 'bg-[#06C167]' : 'bg-white/20'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${newToolBLE ? 'right-1' : 'left-1'}`} />
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-3 rounded-lg bg-[#121212] text-white border border-white/10"
                >
                  Annuler
                </button>
                <button
                  onClick={async () => {
                    if (!newToolName.trim()) return;
                    try {
                      await addTool({
                        id: generateId(),
                        name: newToolName,
                        category: newToolCategory,
                        serial_number: newToolSerial,
                        rfid_enabled: 0,
                        ble_enabled: newToolBLE ? 1 : 0,
                        status: 'available',
                        price: 0,
                      });
                      const data = await getAllTools();
                      setTools(data);
                      setShowAddModal(false);
                      setNewToolName('');
                      setNewToolSerial('');
                      setNewToolBLE(false);
                    } catch (err) {
                      console.error('Add failed:', err);
                    }
                  }}
                  className="flex-1 py-3 rounded-lg bg-[#06C167] text-white font-bold"
                >
                  Ajouter
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav activeTab="inventory" />
      </div>
    </SwipeGesture>
  );
}