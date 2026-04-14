import BottomNav from '../components/BottomNav';
import TopBar from '../components/TopBar';
import SearchBar from '../components/SearchBar';
import StatCard from '../components/StatCard';
import { StatCard as StatCardType } from '../types';
import ActivityFeed from '../components/Dashboard/ActivityFeed';
import { useMovements } from '../contexts/MovementsContext';

const stats: StatCardType[] = [
  { label: 'Outils totaux', value: 127, trend: 12, icon: 'inventory_2', color: 'border-[#06C167]' },
  { label: 'En utilisation', value: 23, trend: -5, icon: 'person', color: 'border-[#ffffff]' },
  { label: 'Alertes Actives', value: 5, trend: undefined, icon: 'warning', color: 'border-[#ef4444]' },
];

export default function HomeDashboard() {
  const { movements, lastAlert } = useMovements();

  return (
    <div className="min-h-screen pb-32" style={{ background: 'linear-gradient(180deg, #121212 0%, #0a0a0a 100%)' }}>
      <div className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(18, 18, 18, 0.85)', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <TopBar
          title=""
          showNotifications
          notificationCount={movements.filter(m => !m.authorized).length}
          showThemeToggle
        />
      </div>

      <main className="mt-32 px-6 space-y-8">
        {/* Critical Alert Banner - Glassmorphism */}
        {lastAlert && (
          <div className="p-4 rounded-2xl flex items-center gap-3 animate-pulse" style={{ 
            background: 'rgba(239, 68, 68, 0.15)', 
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            boxShadow: '0 8px 32px rgba(239, 68, 68, 0.15)'
          }}>
            <span className="material-symbols-outlined" style={{ color: '#EF4444' }}>warning</span>
            <div className="flex-1">
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ef4444' }}>Alerte de Sécurité</p>
              <p className="text-sm font-medium" style={{ color: '#ffffff' }}>
                {lastAlert.toolName} détecté au {lastAlert.checkpointId} sans autorisation !
              </p>
            </div>
            <button
              onClick={() => {
                alert('Alerte acquittée');
              }}
              className="px-4 py-2 font-bold uppercase text-xs transition-all hover:scale-105"
              style={{ background: '#ef4444', color: '#ffffff', borderRadius: '999px' }}
            >
              Acquitter
            </button>
          </div>
        )}

        <SearchBar showFilter />

        {/* KPI Stats */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ color: '#FAFAFA', fontFamily: 'UberMove, sans-serif' }}>
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
        <div className="grid grid-cols-1 gap-8">
          {/* Real-time Feed */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: '#FAFAFA', fontFamily: 'UberMove, sans-serif' }}>
                Flux d'Activité RFID
              </h2>
              <span className="material-symbols-outlined cursor-pointer" style={{ color: '#ffffff60' }}>history</span>
            </div>
            <ActivityFeed movements={movements} />
          </section>
        </div>

        {/* Map Preview - Uber Style */}
        <section className="h-48 rounded-2xl overflow-hidden relative mt-8" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
          <img
            alt="Map location preview"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAyih90kcRyhB0XGfAoEL5ISNEfUEAXD6UwcdCL1YJ6sTPdu4SiJa8_7GsYqDOTCmQROYKrZ0EWgdJMTV0RliLgyJbPsnrTONe2XvxoKmU9_1fKXm4BexJRGb7yMKX3FQOrYzX5vdjMaxs2aoc7GNS1p93ThwuNtOU3_b4pyHT-3ivXulZCsbU9vIqgYVmvZ6F0rHxgLp3h-Ykm8FIqP2ks49C3sZPZlTp07mA11XYALTnpjP2TY4CfR3DVYFw-27K1Q9fi-6VtfNn"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: '#121212', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#06C167' }}></span>
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#ffffff' }}>
              Radar Actif : {movements.length} Signaux
            </span>
          </div>
        </section>
      </main>

      <BottomNav activeTab="home" />
    </div>
  );
}
