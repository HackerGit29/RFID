import './global.css';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import { MapProvider } from './contexts/MapContext';
import { UIFiltersProvider } from './contexts/UIFiltersContext';
import { BLEScannerProvider } from './contexts/BLEScannerContext';
import { MovementsProvider } from './contexts/MovementsContext';
import App from './app';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <MapProvider>
      <UIFiltersProvider>
        <BLEScannerProvider>
          <MovementsProvider>
            <App />
          </MovementsProvider>
        </BLEScannerProvider>
      </UIFiltersProvider>
    </MapProvider>
  </ThemeProvider>
);
