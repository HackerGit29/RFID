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
      <div className="bg-[#000000] text-white min-h-screen pb-32">
      <TopBar
        title="Inventaire"
        showSettings
        showThemeToggle
      />

      <main className="pt-24 pb-32 px-6 max-w-2xl mx-auto">
        {/* Header */}
        <section className="mb-8">
          <h2 className="font-headline text-4xl font-extrabold tracking-tight text-white">
            Inventaire
          </h2>
          <p className="font-label text-xs font-bold uppercase tracking-widest text-[#06C167] mt-2">
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
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-headline text-lg font-bold text-white">
                Électroportatif
              </h3>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                42 Outils
              </span>
            </div>
            
            {filteredTools.filter(t => t.category === 'Électroportatif').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="font-headline text-lg font-bold text-white">
                Mesure & Traçage
              </h3>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
                15 Outils
              </span>
            </div>
            
            {filteredTools.filter(t => t.category === 'Mesure & Traçage').map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </section>
      </main>

      {/* FAB - Uber style */}
      <button className="fixed right-6 bottom-28 w-14 h-14 bg-[#06C167] rounded-full shadow-uber-lg flex items-center justify-center text-white active:scale-90 transition-transform z-40">
        <span className="material-symbols-outlined text-3xl">add</span>
      </button>

      {/* Bottom Navigation */}
      <BottomNav activeTab="inventory" />
    </div>
    </SwipeGesture>
  );
}
