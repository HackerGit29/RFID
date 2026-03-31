import { useState, useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import LeafletMap from '../components/LeafletMap';
import { MapProvider, useMapContext, MapItem } from '../contexts/MapContext';
import { BLEDevice } from '../types';

const bleDevices: BLEDevice[] = [
  {
    id: '1',
    name: 'Caisse à outils Pro-X',
    distance: 1.2,
    rssi: -52,
    status: 'hot',
    icon: 'handyman',
  },
  {
    id: '2',
    name: 'Perceuse Hilti TE 6',
    distance: 8.4,
    rssi: -78,
    status: 'warm',
    icon: 'precision_manufacturing',
  },
  {
    id: '3',
    name: 'Générateur G-300',
    distance: 22.0,
    rssi: -92,
    status: 'cold',
    icon: 'electric_bolt',
  },
];

function BLERadarContent() {
  const { addItem, clearItems, addRoute, items } = useMapContext();
  const [radarEnabled, setRadarEnabled] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  // Initialize map with lab items
  useEffect(() => {
    // Clear existing items
    clearItems();
    
    // Add lab zones (example positions - à adapter selon votre labo réel)
    const labCenter: [number, number] = [48.8566, 2.3522]; // Paris (à modifier)
    
    // Add tools as map items
    bleDevices.forEach((device, index) => {
      const offsetLat = (index - 1) * 0.0001; // ~10m spacing
      const offsetLng = (index - 1) * 0.0001;
      
      addItem({
        id: device.id,
        name: device.name,
        type: 'tool',
        position: [labCenter[0] + offsetLat, labCenter[1] + offsetLng],
        status: device.status === 'hot' ? 'available' : device.status === 'warm' ? 'in_use' : 'lost',
        rssi: device.rssi,
        distance: device.distance,
        icon: device.icon,
        metadata: {
          status: device.status,
          distance: `${device.distance}m`,
        },
      });
    });
    
    // Add example route (chemin entre les outils)
    if (items.length === 0) {
      addRoute({
        id: 'patrol-route-1',
        name: 'Parcours de ronde',
        path: bleDevices.map((_, index) => [
          labCenter[0] + (index - 1) * 0.0001,
          labCenter[1] + (index - 1) * 0.0001,
        ]),
        color: '#357df1',
        width: 2,
        dashed: true,
      });
    }
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'text-tertiary bg-tertiary/20 border-tertiary/30';
      case 'warm':
        return 'text-secondary bg-secondary/20 border-secondary/30';
      case 'cold':
        return 'text-error bg-error/20 border-error/30';
      default:
        return 'text-outline bg-outline/20 border-outline/30';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'hot':
        return 'Chaud';
      case 'warm':
        return 'Moyen';
      case 'cold':
        return 'Faible';
      default:
        return 'Inconnu';
    }
  };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-surface text-on-surface">
      {/* MAP LAYER - Full Screen */}
      <div className="absolute inset-0">
        <LeafletMap 
          className="h-full w-full"
          showControls={true}
        />
      </div>

      {/* TOP BAR (HUD) - Overlay */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 flex flex-col gap-4 pointer-events-none">
        {/* Status/Nav Header */}
        <div className="flex items-center justify-between glass-header p-2 px-4 rounded-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary-container text-primary">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                bluetooth
              </span>
            </div>
            <div>
              <h1 className="text-sm font-headline font-bold text-white tracking-tight leading-none">
                Radar BLE
              </h1>
              <span className="text-[10px] font-label font-bold text-tertiary uppercase tracking-widest">
                {radarEnabled ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-label font-bold text-on-surface-variant uppercase">
                Radar
              </span>
              <button
                onClick={() => setRadarEnabled(!radarEnabled)}
                className={`w-10 h-5 rounded-full relative transition-colors pointer-events-auto ${
                  radarEnabled ? 'bg-tertiary' : 'bg-surface-container-high'
                }`}
              >
                <div
                  className={`absolute top-0.5 size-4 bg-white rounded-full transition-transform ${
                    radarEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2 pointer-events-auto">
          <SearchBar placeholder="Rechercher un outil..." />
          <button className="bg-surface-container-highest/60 backdrop-blur-md px-4 rounded-xl flex items-center gap-2">
            <span className="text-sm font-medium text-white">Tous</span>
            <span className="material-symbols-outlined text-primary text-sm">filter_list</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET - Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-30 bg-surface-container-high/90 backdrop-blur-3xl rounded-t-[2rem] border-t border-white/5 pb-8 shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-secondary-fixed-dim/20" />
        </div>

        <div className="px-6 space-y-6">
          {/* Header Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-headline font-bold text-white">
                Recherche d'outils...
              </h2>
              <p className="text-xs text-on-surface-variant font-body">
                {items.length} outil(s) détecté(s)
              </p>
            </div>
            <div className="bg-primary-container px-3 py-1.5 rounded-lg">
              <span className="text-xs font-label font-bold text-primary uppercase">
                {items.length} Détectés
              </span>
            </div>
          </div>

          {/* Horizontal Scroll Cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
            {bleDevices.map((device) => (
              <div
                key={device.id}
                onClick={() => setSelectedDevice(device.id)}
                className={`min-w-[200px] bg-surface-container-highest p-4 rounded-2xl flex flex-col gap-3 border cursor-pointer transition-all ${
                  selectedDevice === device.id ? 'border-primary' : 'border-white/5'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-tertiary/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-tertiary"
                      style={{ fontVariationSettings: '"FILL" 1' }}
                    >
                      {device.icon}
                    </span>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full ${getStatusColor(device.status)}`}>
                    <span className="text-[10px] font-bold uppercase">{getStatusLabel(device.status)}</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white leading-tight">{device.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary font-bold">{device.distance}m</span>
                    <span className="text-[10px] text-on-surface-variant">•</span>
                    <span className="text-[10px] text-on-surface-variant font-medium">
                      {device.rssi} dBm
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="radar" />
    </div>
  );
}

export default function BLERadar() {
  return (
    <MapProvider>
      <BLERadarContent />
    </MapProvider>
  );
}
