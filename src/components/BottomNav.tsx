import { Link, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

interface BottomNavProps {
  activeTab: 'home' | 'inventory' | 'radar' | 'alerts';
}

export default function BottomNav({ activeTab }: BottomNavProps) {
  const location = useLocation();

  const handleNavigation = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: 'light' as any });
    }
  };

  const navItems = [
    { id: 'home' as const, icon: 'home', label: 'Accueil', path: '/' },
    { id: 'inventory' as const, icon: 'inventory_2', label: 'Inventaire', path: '/inventory' },
    { id: 'radar' as const, icon: 'radar', label: 'Radar', path: '/radar' },
    { id: 'alerts' as const, icon: 'notifications_active', label: 'Alertes', path: '/alerts' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex justify-around items-center px-2 pb-6 pt-3 bg-black/95 backdrop-blur-xl border-t border-white/10 shadow-uber-lg">
      {navItems.map((item) => {
        const isActive = activeTab === item.id;
        
        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={handleNavigation}
            className={`flex flex-col items-center justify-center px-4 py-2 rounded-full transition-all duration-150 active:scale-90 ${
              isActive
                ? 'bg-[#06C167] text-black'
                : 'text-white/50 hover:text-white'
            }`}
          >
            <span
              className="material-symbols-outlined mb-1"
              data-icon={item.icon}
              style={{ 
                fontSize: '22px',
                fontVariationSettings: isActive ? '"FILL" 1' : '"FILL" 0'
              }}
            >
              {item.icon}
            </span>
            <span className="font-uberText text-[10px] font-bold uppercase tracking-wider" style={{ fontSize: '9px' }}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
