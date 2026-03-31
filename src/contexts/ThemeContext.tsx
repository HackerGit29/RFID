import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Couleurs pour le thème sombre (déjà existantes)
const darkThemeColors = {
  surface: '#0b1326',
  surfaceContainer: '#171f33',
  surfaceContainerHigh: '#222a3d',
  surfaceContainerHighest: '#2d3449',
  surfaceContainerLow: '#131b2e',
  surfaceContainerLowest: '#060e20',
  surfaceBright: '#31394d',
  surfaceVariant: '#2d3449',
  primary: '#adc6ff',
  primaryContainer: '#00163a',
  primaryFixed: '#d8e2ff',
  primaryFixedDim: '#adc6ff',
  onPrimary: '#002e6a',
  onPrimaryContainer: '#357df1',
  onPrimaryFixed: '#001a42',
  onPrimaryFixedVariant: '#004395',
  secondary: '#bec6e0',
  secondaryContainer: '#3f465c',
  secondaryFixed: '#dae2fd',
  secondaryFixedDim: '#bec6e0',
  onSecondary: '#283044',
  onSecondaryContainer: '#adb4ce',
  onSecondaryFixed: '#131b2e',
  onSecondaryFixedVariant: '#3f465c',
  tertiary: '#4edea3',
  tertiaryContainer: '#001c10',
  tertiaryFixed: '#6ffbbe',
  tertiaryFixedDim: '#4edea3',
  onTertiary: '#003824',
  onTertiaryContainer: '#009365',
  onTertiaryFixed: '#002113',
  onTertiaryFixedVariant: '#005236',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',
  onErrorContainer: '#ffdad6',
  outline: '#909097',
  outlineVariant: '#45464d',
  background: '#0b1326',
  onBackground: '#dae2fd',
  onSurface: '#dae2fd',
  onSurfaceVariant: '#c6c6cd',
  inverseSurface: '#dae2fd',
  inverseOnSurface: '#283044',
  inversePrimary: '#005ac2',
};

// Couleurs pour le thème clair
const lightThemeColors = {
  surface: '#f8f9ff',
  surfaceContainer: '#eceeff',
  surfaceContainerHigh: '#e0e2fc',
  surfaceContainerHighest: '#d4e1fc',
  surfaceContainerLow: '#f0f2ff',
  surfaceContainerLowest: '#ffffff',
  surfaceBright: '#ffffff',
  surfaceVariant: '#e1e2ec',
  primary: '#357df1',
  primaryContainer: '#d8e2ff',
  primaryFixed: '#d8e2ff',
  primaryFixedDim: '#adc6ff',
  onPrimary: '#ffffff',
  onPrimaryContainer: '#001a42',
  onPrimaryFixed: '#001a42',
  onPrimaryFixedVariant: '#004395',
  secondary: '#575e71',
  secondaryContainer: '#dbe2f9',
  secondaryFixed: '#dbe2f9',
  secondaryFixedDim: '#bec6e0',
  onSecondary: '#ffffff',
  onSecondaryContainer: '#141b2c',
  onSecondaryFixed: '#131b2e',
  onSecondaryFixedVariant: '#3f465c',
  tertiary: '#006e54',
  tertiaryContainer: '#6ffbbe',
  tertiaryFixed: '#6ffbbe',
  tertiaryFixedDim: '#4edea3',
  onTertiary: '#ffffff',
  onTertiaryContainer: '#002113',
  onTertiaryFixed: '#002113',
  onTertiaryFixedVariant: '#005236',
  error: '#ba1a1a',
  errorContainer: '#ffdad6',
  onError: '#ffffff',
  onErrorContainer: '#410002',
  outline: '#74777f',
  outlineVariant: '#c3c7cf',
  background: '#f8f9ff',
  onBackground: '#191c20',
  onSurface: '#191c20',
  onSurfaceVariant: '#44474f',
  inverseSurface: '#2e3036',
  inverseOnSurface: '#f0f1f8',
  inversePrimary: '#adc6ff',
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as ThemeMode) || 'dark';
  });

  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Déterminer le thème résolu
    let effectiveTheme: 'light' | 'dark' = 'dark';
    
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      effectiveTheme = systemPrefersDark ? 'dark' : 'light';
    } else {
      effectiveTheme = theme;
    }

    setResolvedTheme(effectiveTheme);

    // Appliquer la classe dark
    if (effectiveTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Appliquer les variables CSS
    const colors = effectiveTheme === 'dark' ? darkThemeColors : lightThemeColors;

    // Surface colors
    root.style.setProperty('--surface', colors.surface);
    root.style.setProperty('--surface-container', colors.surfaceContainer);
    root.style.setProperty('--surface-container-high', colors.surfaceContainerHigh);
    root.style.setProperty('--surface-container-highest', colors.surfaceContainerHighest);
    root.style.setProperty('--surface-container-low', colors.surfaceContainerLow);
    root.style.setProperty('--surface-container-lowest', colors.surfaceContainerLowest);
    root.style.setProperty('--surface-bright', colors.surfaceBright);
    root.style.setProperty('--surface-dim', colors.surfaceDim || colors.surface);
    root.style.setProperty('--surface-variant', colors.surfaceVariant);

    // Primary colors
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-container', colors.primaryContainer);
    root.style.setProperty('--primary-fixed', colors.primaryFixed);
    root.style.setProperty('--primary-fixed-dim', colors.primaryFixedDim);
    root.style.setProperty('--on-primary', colors.onPrimary);
    root.style.setProperty('--on-primary-container', colors.onPrimaryContainer);
    root.style.setProperty('--on-primary-fixed', colors.onPrimaryFixed);
    root.style.setProperty('--on-primary-fixed-variant', colors.onPrimaryFixedVariant);

    // Secondary colors
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-container', colors.secondaryContainer);
    root.style.setProperty('--secondary-fixed', colors.secondaryFixed);
    root.style.setProperty('--secondary-fixed-dim', colors.secondaryFixedDim);
    root.style.setProperty('--on-secondary', colors.onSecondary);
    root.style.setProperty('--on-secondary-container', colors.onSecondaryContainer);
    root.style.setProperty('--on-secondary-fixed', colors.onSecondaryFixed);
    root.style.setProperty('--on-secondary-fixed-variant', colors.onSecondaryFixedVariant);

    // Tertiary colors
    root.style.setProperty('--tertiary', colors.tertiary);
    root.style.setProperty('--tertiary-container', colors.tertiaryContainer);
    root.style.setProperty('--tertiary-fixed', colors.tertiaryFixed);
    root.style.setProperty('--tertiary-fixed-dim', colors.tertiaryFixedDim);
    root.style.setProperty('--on-tertiary', colors.onTertiary);
    root.style.setProperty('--on-tertiary-container', colors.onTertiaryContainer);
    root.style.setProperty('--on-tertiary-fixed', colors.onTertiaryFixed);
    root.style.setProperty('--on-tertiary-fixed-variant', colors.onTertiaryFixedVariant);

    // Other colors
    root.style.setProperty('--error', colors.error);
    root.style.setProperty('--error-container', colors.errorContainer);
    root.style.setProperty('--on-error', colors.onError);
    root.style.setProperty('--on-error-container', colors.onErrorContainer);
    root.style.setProperty('--outline', colors.outline);
    root.style.setProperty('--outline-variant', colors.outlineVariant);
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--on-background', colors.onBackground);
    root.style.setProperty('--on-surface', colors.onSurface);
    root.style.setProperty('--on-surface-variant', colors.onSurfaceVariant);
    root.style.setProperty('--inverse-surface', colors.inverseSurface);
    root.style.setProperty('--inverse-on-surface', colors.inverseOnSurface);
    root.style.setProperty('--inverse-primary', colors.inversePrimary);

    // Sauvegarder dans localStorage
    localStorage.setItem('app_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => {
      if (prev === 'dark') return 'light';
      if (prev === 'light') return 'system';
      return 'dark';
    });
  };

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
