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
      className="flex items-center gap-2 px-4 py-2 rounded-[999px] bg-[#121212] hover:bg-[#1a1a1a] transition-all active:scale-95 border border-white/10"
      title={`Thème: ${getThemeLabel()}`}
    >
      <span className="material-symbols-outlined text-[#06C167]">
        {getThemeIcon()}
      </span>
      <span className="text-sm font-bold text-white hidden sm:inline">
        {getThemeLabel()}
      </span>
    </button>
  );
}
