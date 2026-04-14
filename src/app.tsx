import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import SplashScreen from './screens/SplashScreen';
import HomeDashboard from './screens/HomeDashboard';
import InventoryList from './screens/InventoryList';
import ToolDetail from './screens/ToolDetail';
import BLERadar from './screens/BLERadar';
import RSSICalibration from './screens/RSSICalibration';

// Placeholder screens for routes not yet implemented
function PlaceholderScreen({ name }: { name: string }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-2">{name}</h1>
        <p className="text-outline">Screen in development</p>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Splash Screen - Entry point */}
        <Route path="/" element={<SplashScreen />} />
        
        {/* Main Screens */}
        <Route path="/home" element={<HomeDashboard />} />
        <Route path="/inventory" element={<InventoryList />} />
        <Route path="/inventory/:id" element={<ToolDetail />} />
        <Route path="/tool/:id" element={<ToolDetail />} />
        <Route path="/radar" element={<BLERadar />} />
        <Route path="/radar/calibration" element={<RSSICalibration />} />
        
        {/* Placeholder Screens */}
        <Route path="/alerts" element={<PlaceholderScreen name="Alertes" />} />
        <Route path="/profile" element={<PlaceholderScreen name="Profil" />} />
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
