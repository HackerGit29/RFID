import { useNavigate } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import SwipeGesture from '../components/SwipeGesture';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import FilterChips from '../components/FilterChips';
import ToolCard from '../components/ToolCard';
import { Tool } from '../types';
import { useUIFilters } from '../contexts/UIFiltersContext';

const filters = ['Tous', 'RFID', 'BLE', 'RFID+BLE'];

const sampleTools: Tool[] = [
  {
    id: '1',
    name: 'Perceuse Bosch GSR',
    category: 'Électroportatif',
    serialNumber: 'GSR-2024-001',
    rfidEnabled: true,
    bleEnabled: false,
    status: 'available',
    price: 249.00,
    state: 'authorized',
  },
  {
    id: '2',
    name: 'Meuleuse Makita XAG',
    category: 'Électroportatif',
    serialNumber: 'XAG-992-B8',
    rfidEnabled: true,
    bleEnabled: true,
    status: 'in_use',
    price: 185.50,
    state: 'authorized',
  },
  {
    id: '3',
    name: 'Laser Leica Disto',
    category: 'Mesure & Traçage',
    serialNumber: 'LD-2023-F2',
    rfidEnabled: false,
    bleEnabled: true,
    status: 'maintenance',
    price: 420.00,
    state: 'locked',
  },
];

export default function InventoryList() {
  const { activeFilter, setActiveFilter } = useUIFilters();
  const navigate = useNavigate();

  const handleSwipeBack = () => {
    navigate('/home');
  };

  const filteredTools = activeFilter === 'Tous'
    ? sampleTools
    : sampleTools.filter(tool => {
        if (activeFilter === 'RFID') return tool.rfidEnabled && !tool.bleEnabled;
        if (activeFilter === 'BLE') return tool.bleEnabled && !tool.rfidEnabled;
        if (activeFilter === 'RFID+BLE') return tool.rfidEnabled && tool.bleEnabled;
        return true;
      });

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
          <p className="font-label text-xs font-bold uppercase tracking-widest" style={{ color: '#06C167' }} mt-2>
            127 OUTILS · 3 CATÉGORIES
          </p>
        </section>

        {/* Search & Filter Area */}
        <section className="space-y-6 mb-10">
          <SearchBar showFilter />
          
          <FilterChips
            filters={filters}
            activeFilter={activeFilter}
            onSelectFilter={setActiveFilter}
          />
        </section>

        {/* Grouped List */}
        <section className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <h3 className="font-headline text-lg font-bold" style={{ color: '#FAFAFA' }}>
                Électroportatif
              </h3>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                42 Outils
              </span>
            </div>
            
            {filteredTools.filter(t => t.category === 'Électroportatif').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
              <h3 className="font-headline text-lg font-bold" style={{ color: '#FAFAFA' }}>
                Mesure & Traçage
              </h3>
              <span className="text-[10px] font-bold" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                15 Outils
              </span>
            </div>
            
            {filteredTools.filter(t => t.category === 'Mesure & Traçage').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </main>

      {/* FAB - Glassmorphism */}
      <button 
        className="fixed right-6 bottom-28 w-14 h-14 flex items-center justify-center text-white active:scale-90 transition-transform z-40"
        style={{ 
          background: 'linear-gradient(135deg, #06C167 0%, #05A156 100%)', 
          borderRadius: '999px',
          boxShadow: '0 8px 32px rgba(6, 193, 103, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
        }}
      >
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Bottom Navigation */}
      <BottomNav activeTab="inventory" />
    </div>
    </SwipeGesture>
  );
}
