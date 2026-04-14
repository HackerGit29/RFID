import { useEffect } from 'react';
import BottomNav from '../components/BottomNav';
import SearchBar from '../components/SearchBar';
import LeafletMap from '../components/LeafletMap';
import { MapProvider, useMapContext, MapItem } from '../contexts/MapContext';
import { useUIFilters } from '../contexts/UIFiltersContext';
import { BLEDevice } from '../types';

const bleDevices: BLEDevice[] = [
  {
    id: '1',
    name: 'Caisse à outils Pro-X',
    distance: 1.2,
    rssi: -52,
    smoothedRssi: -55,
    status: 'hot',
    icon: 'handyman',
    lastPing: Date.now(),
  },
  {
    id: '2',
    name: 'Perceuse Hilti TE 6',
    distance: 8.4,
    rssi: -78,
    smoothedRssi: -76,
    status: 'warm',
    icon: 'precision_manufacturing',
    lastPing: Date.now() - 5000,
  },
  {
    id: '3',
    name: 'Générateur G-300',
    distance: 22.0,
    rssi: -92,
    smoothedRssi: -90,
    status: 'cold',
    icon: 'electric_bolt',
    lastPing: Date.now() - 15000,
  },
];

function BLERadarContent() {
  const { addItem, clearItems, addRoute, items } = useMapContext();
  const { activeFilter, setActiveFilter } = useUIFilters();

  const radarEnabled = true; // Always enabled for now; can be moved to context later

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
        return 'text-primary bg-primary/20 border-primary/30';
      case 'warm':
        return 'text-tertiary bg-tertiary/20 border-tertiary/30';
      case 'cold':
        return 'text-error bg-error/20 border-error/30';
      default:
        return 'text-[#FAFAFA]/60 bg-[#FAFAFA]/10 border-[#FAFAFA]/20';
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
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-gradient-to-b from-[#0A0A0A] via-[#0F0F0F] to-[#050505] text-[#FAFAFA]">
      {/* MAP LAYER - Full Screen */}
      <div className="absolute inset-0 opacity-80">
        <LeafletMap
          className="h-full w-full"
          showControls={true}
        />
      </div>

      {/* TOP BAR (HUD) - Overlay */}
      <div className="fixed top-0 left-0 right-0 z-20 p-4 flex flex-col gap-4 pointer-events-none">
        {/* Status/Nav Header */}
        <div className="flex items-center justify-between glass-panel p-2 px-4 rounded-xl pointer-events-auto">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-lg bg-primary text-black">
              <span className="material-symbols-outlined" style={{ fontVariationSettings: '"FILL" 1' }}>
                bluetooth
              </span>
            </div>
            <div>
              <h1 className="text-sm font-headline font-bold text-[#FAFAFA] tracking-tight leading-none">
                Radar BLE
              </h1>
              <span className="text-[10px] font-label font-bold text-primary uppercase tracking-widest">
                {radarEnabled ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-label font-bold text-[#FAFAFA]/70 uppercase">
                Radar
              </span>
              <div
                className={`w-10 h-5 rounded-full relative ${
                  radarEnabled ? 'bg-primary' : 'bg-white/20'
                }`}
              >
                <div
                  className={`absolute top-0.5 size-4 bg-white rounded-full transition-transform ${
                    radarEnabled ? 'right-0.5' : 'left-0.5'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2 pointer-events-auto">
          <SearchBar placeholder="Rechercher un outil..." />
          <button className="glass-panel px-4 rounded-xl flex items-center gap-2">
            <span className="text-sm font-medium text-[#FAFAFA]">Tous</span>
            <span className="material-symbols-outlined text-primary text-sm">filter_list</span>
          </button>
        </div>
      </div>

      {/* BOTTOM SHEET - Overlay */}
      <div className="absolute bottom-0 left-0 right-0 z-30 glass-panel-tall rounded-t-[2rem] pb-8 shadow-glass">
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-4">
          <div className="w-10 h-1 rounded-full bg-[#FAFAFA]/20" />
        </div>

        <div className="px-6 space-y-6">
          {/* Header Stats */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-headline font-bold text-[#FAFAFA]">
                Recherche d'outils...
              </h2>
              <p className="text-xs text-[#FAFAFA]/70 font-body">
                {items.length} outil(s) détecté(s)
              </p>
            </div>
            <div className="bg-primary px-3 py-1.5 rounded-lg">
              <span className="text-xs font-label font-bold text-black uppercase">
                {items.length} Détectés
              </span>
            </div>
          </div>

          {/* Horizontal Scroll Cards */}
          <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 no-scrollbar">
            {bleDevices.map((device) => (
              <div
                key={device.id}
                className="min-w-[200px] glass-card p-4 rounded-2xl flex flex-col gap-3"
              >
                <div className="flex items-start justify-between">
                  <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <span
                      className="material-symbols-outlined text-primary"
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
                  <h3 className="text-sm font-bold text-[#FAFAFA] leading-tight">{device.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-primary font-bold">{device.distance}m</span>
                    <span className="text-[10px] text-[#FAFAFA]/50">•</span>
                    <span className="text-[10px] text-[#FAFAFA]/50 font-medium">
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
  return <BLERadarContent />;
}
