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
      await Haptics.impact({ style: Haptics.ImpactStyle.Light });
    }
    navigate(-1);
  };

  const handleNotification = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: Haptics.ImpactStyle.Light });
    }
    navigate('/alerts');
  };

  const handleSettings = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: Haptics.ImpactStyle.Light });
    }
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 py-4 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/20">
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={handleBack}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors duration-200 cursor-pointer active:scale-95"
            aria-label="Retour"
          >
            <span className="material-symbols-outlined text-primary">arrow_back_ios_new</span>
          </button>
        )}

        {showSettings && (
          <button
            onClick={handleSettings}
            className="p-2 rounded-full hover:bg-surface-container-high transition-colors duration-200 cursor-pointer active:scale-95"
            aria-label="Paramètres"
          >
            <span className="material-symbols-outlined text-primary">settings</span>
          </button>
        )}

        <h1 className="font-headline text-xl font-bold tracking-tight text-on-surface">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {showThemeToggle && <ThemeToggle />}

        {showNotifications && (
          <button
            onClick={handleNotification}
            className="relative p-2 rounded-full hover:bg-surface-container-high transition-colors duration-200 cursor-pointer active:scale-95"
            aria-label="Notifications"
          >
            <span className="material-symbols-outlined text-primary">notifications</span>
            {notificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface"></span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
