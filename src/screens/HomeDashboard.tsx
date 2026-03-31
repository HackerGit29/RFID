import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import { StatCard as StatCardType, Movement } from '../types';

const stats: StatCardType[] = [
  { label: 'Outils totaux', value: 127, trend: 12, icon: 'inventory_2', color: 'border-primary' },
  { label: 'En utilisation', value: 23, trend: -5, icon: 'person', color: 'border-on-primary-container' },
  { label: 'À localiser', value: 5, trend: undefined, icon: 'warning', color: 'border-error' },
];

const movements: Movement[] = [
  {
    id: '1',
    toolId: '1',
    toolName: 'Bosch Drill',
    toolIcon: 'handyman',
    type: 'RFID_OUT',
    user: 'Jean D.',
    timestamp: '09:15',
    status: 'active',
  },
  {
    id: '2',
    toolId: '2',
    toolName: 'Oscilloscope',
    toolIcon: 'precision_manufacturing',
    type: 'BLE_DETECTED',
    location: 'Lab 2',
    timestamp: '08:42',
    status: 'stable',
  },
  {
    id: '3',
    toolId: '3',
    toolName: 'Toolbox',
    toolIcon: 'inventory_2',
    type: 'BLE_LOST',
    location: 'Zone Unknown',
    timestamp: 'Hier',
    status: 'lost',
  },
];

export default function HomeDashboard() {
  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      <TopBar
        title=""
        showNotifications
        notificationCount={1}
        showThemeToggle
      />

      <main className="mt-20 px-6 space-y-8">
        {/* Search Bar */}
        <SearchBar showFilter />

        {/* Quick Stats Horizontal Scroll */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Indicateurs Temps Réel
            </h2>
            <span className="text-xs text-primary font-bold tracking-wider uppercase cursor-pointer">
              Voir tout
            </span>
          </div>
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6">
            {stats.map((stat) => (
              <StatCard key={stat.label} stat={stat} />
            ))}
          </div>
        </section>

        {/* Recent Movements */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-lg font-bold text-on-surface">
              Mouvements Récents
            </h2>
            <span className="material-symbols-outlined text-outline cursor-pointer">history</span>
          </div>
          <div className="space-y-3">
            {movements.map((movement) => (
              <div
                key={movement.id}
                className="glass-panel p-4 rounded-xl flex items-center justify-between cursor-pointer active:scale-[0.98] transition-transform"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary">
                      {movement.toolIcon}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-on-surface">{movement.toolName}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-tighter ${
                        movement.type === 'RFID_OUT' ? 'bg-tertiary/20 text-tertiary' :
                        movement.type === 'BLE_DETECTED' ? 'bg-on-primary-container/20 text-on-primary-container' :
                        'bg-error/20 text-error'
                      }`}>
                        {movement.type}
                      </span>
                      <span className="text-[10px] text-outline font-medium">
                        {movement.user || movement.location}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="block font-bold text-xs text-on-surface">{movement.timestamp}</span>
                  <span className={`block text-[10px] font-bold uppercase ${
                    movement.status === 'active' ? 'text-tertiary' :
                    movement.status === 'stable' ? 'text-on-primary-container' :
                    'text-error'
                  }`}>
                    {movement.status === 'active' ? 'Actif' : movement.status === 'stable' ? 'Stable' : 'Perdu'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Map Preview */}
        <section className="h-48 rounded-2xl overflow-hidden relative shadow-2xl">
          <img
            alt="Map location preview"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyih90kcRyhB0XGfAoEL5ISNEfUEAXD6UwcdCL1YJ6sTPdu4SiJa8_7GsYqDOTCmQROYKrZ0EWgdJMTV0RliLgyJbPsnrTONe2XvxoKmU9_1fKXm4BexJRGb7yMKX3FQOrYzX5vdjMaxs2aoc7GNS1p93ThwuNtOU3_b4pyHTx-3ivXulZCsbU9vIqgYVmvZ6F0rHxgLp3h-Ykm8FIqP2ks49C3sZPZlTp07mA11XYALTnpjP2TY4CfR3DVYFw-27K1Q9fi-6VtfNn"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-60"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-surface-container-high/80 backdrop-blur-md px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-on-surface uppercase tracking-widest">
              Radar Actif : 124 Signaux
            </span>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-28 right-6 z-50">
        <button className="w-16 h-16 rounded-full bg-gradient-to-br from-[#adc6ff] to-[#357df1] text-[#002e6a] shadow-[0px_8px_24px_rgba(53,125,241,0.4)] flex items-center justify-center transition-transform duration-200 active:scale-90">
          <span className="material-symbols-outlined text-3xl font-bold">add</span>
        </button>
      </div>

      {/* Draggable Bottom Sheet Handle */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40 px-4 w-full max-w-md">
        <div className="w-10 h-1 bg-secondary-fixed-dim/20 rounded-full mx-auto mb-2"></div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="home" />
    </div>
  );
}
