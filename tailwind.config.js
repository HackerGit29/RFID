/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Surface colors
        surface: 'var(--surface)',
        'surface-container': 'var(--surface-container)',
        'surface-container-high': 'var(--surface-container-high)',
        'surface-container-highest': 'var(--surface-container-highest)',
        'surface-container-low': 'var(--surface-container-low)',
        'surface-container-lowest': 'var(--surface-container-lowest)',
        'surface-bright': 'var(--surface-bright)',
        'surface-dim': 'var(--surface-dim)',
        'surface-variant': 'var(--surface-variant)',
        
        // Primary colors
        primary: 'var(--primary)',
        'primary-container': 'var(--primary-container)',
        'primary-fixed': 'var(--primary-fixed)',
        'primary-fixed-dim': 'var(--primary-fixed-dim)',
        'on-primary': 'var(--on-primary)',
        'on-primary-container': 'var(--on-primary-container)',
        'on-primary-fixed': 'var(--on-primary-fixed)',
        'on-primary-fixed-variant': 'var(--on-primary-fixed-variant)',
        
        // Secondary colors
        secondary: 'var(--secondary)',
        'secondary-container': 'var(--secondary-container)',
        'secondary-fixed': 'var(--secondary-fixed)',
        'secondary-fixed-dim': 'var(--secondary-fixed-dim)',
        'on-secondary': 'var(--on-secondary)',
        'on-secondary-container': 'var(--on-secondary-container)',
        'on-secondary-fixed': 'var(--on-secondary-fixed)',
        'on-secondary-fixed-variant': 'var(--on-secondary-fixed-variant)',
        
        // Tertiary colors
        tertiary: 'var(--tertiary)',
        'tertiary-container': 'var(--tertiary-container)',
        'tertiary-fixed': 'var(--tertiary-fixed)',
        'tertiary-fixed-dim': 'var(--tertiary-fixed-dim)',
        'on-tertiary': 'var(--on-tertiary)',
        'on-tertiary-container': 'var(--on-tertiary-container)',
        'on-tertiary-fixed': 'var(--on-tertiary-fixed)',
        'on-tertiary-fixed-variant': 'var(--on-tertiary-fixed-variant)',
        
        // Other colors
        error: 'var(--error)',
        'error-container': 'var(--error-container)',
        'on-error': 'var(--on-error)',
        'on-error-container': 'var(--on-error-container)',
        outline: 'var(--outline)',
        'outline-variant': 'var(--outline-variant)',
        background: 'var(--background)',
        'on-background': 'var(--on-background)',
        'on-surface': 'var(--on-surface)',
        'on-surface-variant': 'var(--on-surface-variant)',
        'inverse-surface': 'var(--inverse-surface)',
        'inverse-on-surface': 'var(--inverse-on-surface)',
        'inverse-primary': 'var(--inverse-primary)',
      },
      fontFamily: {
        headline: ['Manrope', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        label: ['Inter', 'sans-serif'],
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
        xl: '8px',
        '2xl': '8px',
        full: '9999px',
      },
      boxShadow: {
        'glass': '0px_16px_40px_rgba(6,14,32,0.4)',
      },
    },
  },
  plugins: [],
}
