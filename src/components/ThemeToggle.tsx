import { useTheme } from '../contexts/ThemeContext';
import { Capacitor } from '@capacitor/core';
import { Haptics } from '@capacitor/haptics';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleThemeChange = async () => {
    if (Capacitor.isNativePlatform()) {
      await Haptics.impact({ style: Haptics.ImpactStyle.Light });
    }

    // Cycle: dark → light → system → dark
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getThemeIcon = () => {
    if (theme === 'system') {
      return 'brightness_auto';
    }
    return resolvedTheme === 'dark' ? 'brightness_2' : 'brightness_high';
  };

  const getThemeLabel = () => {
    if (theme === 'system') {
      return 'Système';
    }
    return theme === 'dark' ? 'Sombre' : 'Clair';
  };

  return (
    <button
      onClick={handleThemeChange}
      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container-highest hover:bg-surface-bright transition-colors active:scale-95"
      title={`Thème: ${getThemeLabel()}`}
    >
      <span className="material-symbols-outlined text-primary">
        {getThemeIcon()}
      </span>
      <span className="text-sm font-bold text-on-surface hidden sm:inline">
        {getThemeLabel()}
      </span>
    </button>
  );
}
