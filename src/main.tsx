import './global.css';
import ReactDOM from 'react-dom/client';
import { ThemeProvider } from './contexts/ThemeContext';
import { MapProvider } from './contexts/MapContext';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <ThemeProvider>
    <MapProvider>
      <App />
    </MapProvider>
  </ThemeProvider>
);
