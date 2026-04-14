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
        // Uber Design System
        black: '#000000',
        white: '#ffffff',
        
        // Surface - Uber style (dark primary)
        surface: '#000000',
        'surface-container': '#121212',
        'surface-container-high': '#1E1E1E',
        'surface-container-highest': '#2A2A2A',
        'surface-container-low': '#0A0A0A',
        'surface-container-lowest': '#050505',
        'surface-bright': '#333333',
        'surface-dim': '#000000',
        'surface-variant': '#1A1A1A',
        
        // Primary - Uber green
        primary: '#06C167',
        'primary-container': '#06C167',
        'primary-fixed': '#06C167',
        'primary-fixed-dim': '#06C167',
        'on-primary': '#000000',
        'on-primary-container': '#000000',
        'on-primary-fixed': '#000000',
        'on-primary-fixed-variant': '#000000',
        
        // Secondary
        secondary: '#06C167',
        'secondary-container': '#06C167',
        'secondary-fixed': '#06C167',
        'secondary-fixed-dim': '#06C167',
        'on-secondary': '#000000',
        'on-secondary-container': '#000000',
        'on-secondary-fixed': '#000000',
        'on-secondary-fixed-variant': '#000000',
        
        // Tertiary
        tertiary: '#06C167',
        'tertiary-container': '#06C167',
        'tertiary-fixed': '#06C167',
        'tertiary-fixed-dim': '#06C167',
        'on-tertiary': '#000000',
        'on-tertiary-container': '#000000',
        'on-tertiary-fixed': '#000000',
        'on-tertiary-fixed-variant': '#000000',
        
        // Error
        error: '#FF3B30',
        'error-container': '#FF3B30',
        'on-error': '#FFFFFF',
        'on-error-container': '#FFFFFF',
        
        // On Surface
        'on-surface': '#FFFFFF',
        'on-surface-variant': '#A0A0A0',
        
        // Outline
        outline: '#333333',
        'outline-variant': '#2A2A2A',
        
        // Background
        background: '#000000',
        'on-background': '#FFFFFF',
        
        // Inverse
        'inverse-surface': '#FFFFFF',
        'inverse-on-surface': '#000000',
        'inverse-primary': '#000000',
        
        // Legacy support
        'surface/60': 'rgba(0, 0, 0, 0.6)',
      },
      fontFamily: {
        // Uber Move (headings)
        headline: ['Uber Move', 'Manrope', 'sans-serif'],
        'font-headline': ['Uber Move', 'Manrope', 'sans-serif'],
        // Uber Move Text (body)
        body: ['Uber Move Text', 'Inter', 'sans-serif'],
        'font-body': ['Uber Move Text', 'Inter', 'sans-serif'],
        // Fallbacks
        manrope: ['Manrope', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        uber: ['Uber Move', 'sans-serif'],
        uberText: ['Uber Move Text', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        // Uber pill buttons
        '999px': '999px',
        pill: '999px',
        full: '999px',
      },
      boxShadow: {
        // Uber whisper-soft shadows (0.12-0.16 opacity)
        'uber-sm': '0 2px 4px rgba(0, 0, 0, 0.12)',
        'uber-md': '0 4px 12px rgba(0, 0, 0, 0.14)',
        'uber-lg': '0 8px 24px rgba(0, 0, 0, 0.16)',
        'uber-xl': '0 16px 48px rgba(0, 0, 0, 0.18)',
        // Legacy glass
        'glass': '0 16px 40px rgba(6, 14, 32, 0.4)',
      },
      spacing: {
        'uber-safe': 'env(safe-area-inset-top)',
        'uber-safe-bottom': 'env(safe-area-inset-bottom)',
      },
    },
  },
  plugins: [],
}
