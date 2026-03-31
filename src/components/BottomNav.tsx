import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

interface BottomNavProps {
  activeTab: 'home' | 'inventory' | 'radar' | 'alerts' | 'profile';
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const location = useLocation();

  const handleNavigation = async (path: string) => {
    // Haptic feedback on mobile
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: Haptics.ImpactStyle.Light });
    }
  };

  const navItems = [
    { id: 'home' as const, icon: 'home', label: 'Accueil', path: '/' },
    { id: 'inventory' as const, icon: 'inventory_2', label: 'Inventaire', path: '/inventory' },
    { id: 'radar' as const, icon: 'radar', label: 'Radar', path: '/radar' },
    { id: 'alerts' as const, icon: 'notifications_active', label: 'Alertes', path: '/alerts' },
    { id: 'profile' as const, icon: 'person', label: 'Profil', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-slate-900/60 backdrop-blur-xl border-t border-slate-700/20 shadow-2xl shadow-slate-950 rounded-t-2xl">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => handleNavigation(item.path)}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-150 active:scale-90 ${
              isActive
                ? 'bg-blue-500/20 text-blue-300 rounded-xl'
                : 'text-slate-500 hover:text-blue-200'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              data-icon={item.icon}
              style={{ fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0' }}
            >
              {item.icon}
            </span>
            <span className="font-inter text-[10px] font-bold uppercase tracking-wider">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
