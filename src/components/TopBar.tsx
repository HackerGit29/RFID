import { useNavigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';
import ThemeToggle from './ThemeToggle';

interface TopBarProps {
  title: string;
  showBack?: boolean;
  showSettings?: boolean;
  showNotifications?: boolean;
  showThemeToggle?: boolean;
  notificationCount?: number;
}

export default function TopBar({
  title,
  showBack = false,
  showSettings = false,
  showNotifications = false,
  showThemeToggle = false,
  notificationCount = 0,
}: TopBarProps) {
  const navigate = useNavigate();

  const handleBack = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: 'light' as any });
    }
    navigate(-1);
  };

  const handleNotification = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: 'light' as any });
    }
    navigate('/alerts');
  };

  const handleSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: 'light' as any });
    }
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-5 bg-black/90 backdrop-blur-xl border-b border-white/10">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Retour"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>arrow_back_ios_new</span>
          </button>
        )}

        {showSettings && (
          <button
            onClick={handleSettings}
            className="p-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Paramètres"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>settings</span>
          </button>
        )}

        <h1 className="font-headline text-2xl font-bold tracking-tight text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2">
        {showThemeToggle && <ThemeToggle />}

        {showNotifications && (
          <button
            onClick={handleNotification}
            className="relative p-3 rounded-full hover:bg-white/10 transition-all duration-200 cursor-pointer active:scale-95"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '20px' }}>notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-[#06C167] rounded-full border-2 border-black"></span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
