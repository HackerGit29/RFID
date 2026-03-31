import { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup, useMap, CircleMarker } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { useMapContext, MapItem } from '../contexts/MapContext';
import { useTheme } from '../contexts/ThemeContext';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom marker icons
const createCustomIcon = (status?: string): Icon => {
  return new Icon({
    iconUrl: markerIcon,
    iconRetinaUrl: markerIcon2x,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });
};

// User location marker
const createUserIcon = (): Icon => {
  return new Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI4IiBmaWxsPSIjMzU3ZGYxIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMyIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjIwIiBmaWxsPSIjMzU3ZGYxIiBvcGFjaXR5PSIwLjIiLz48L3N2Zz4=',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

const getStatusColor = (status?: string): string => {
  switch (status) {
    case 'available': return 'text-tertiary';
    case 'in_use': return 'text-primary';
    case 'maintenance': return 'text-secondary';
    case 'lost': return 'text-error';
    default: return 'text-outline';
  }
};

// User location component
function UserLocation({ onLocationFound }: { onLocationFound: (pos: LatLngExpression) => void }) {
  const [userPosition, setUserPosition] = useState<LatLngExpression | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Géolocalisation non supportée');
      return;
    }
    
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos: LatLngExpression = [position.coords.latitude, position.coords.longitude];
        setUserPosition(pos);
        onLocationFound(pos);
        setError(null);
      },
      (err) => {
        console.error('Erreur géolocalisation:', err);
        setError('Position non disponible');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );
    
    return () => navigator.geolocation.clearWatch(watchId);
  }, [onLocationFound]);
  
  if (!userPosition) return null;
  
  return (
    <>
      <Marker position={userPosition} icon={createUserIcon()} zIndexOffset={1000}>
        <Popup>
          <div className="p-2">
            <h3 className="font-bold">Votre position</h3>
            {error && <p className="text-error text-sm mt-1">{error}</p>}
          </div>
        </Popup>
      </Marker>
      {/* Precision circle */}
      <CircleMarker
        center={userPosition}
        radius={20}
        pathOptions={{ color: '#357df1', fillColor: '#357df1', fillOpacity: 0.1, weight: 1 }}
      />
    </>
  );
}

// Item marker component
function ItemMarker({ item, isSelected }: { item: MapItem; isSelected: boolean }) {
  const { selectItem, focusOnItem } = useMapContext();
  
  return (
    <Marker
      position={item.position}
      icon={createCustomIcon(item.status)}
      eventHandlers={{
        click: () => {
          selectItem(item.id);
          focusOnItem(item.id);
        },
      }}
    >
      <Popup>
        <div className="p-2 min-w-[200px]">
          <h3 className="font-bold text-lg text-on-surface">{item.name}</h3>
          <p className="text-sm text-on-surface-variant capitalize mt-1">Type: {item.type}</p>
          {item.status && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${
                item.status === 'available' ? 'bg-tertiary' :
                item.status === 'in_use' ? 'bg-primary' :
                item.status === 'maintenance' ? 'bg-secondary' : 'bg-error'
              }`} />
              <span className={`text-sm font-bold capitalize ${getStatusColor(item.status)}`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
          )}
          {item.distance && (
            <p className="text-sm text-on-surface mt-2">
              Distance: <span className="font-bold text-primary">{item.distance.toFixed(1)}m</span>
            </p>
          )}
          {item.rssi && (
            <p className="text-sm text-on-surface-variant">
              RSSI: <span className="font-mono">{item.rssi} dBm</span>
            </p>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

// Route polyline component
function RouteLine({ route }: { route: { id: string; name: string; path: LatLngExpression[]; color?: string; width?: number; dashed?: boolean } }) {
  return (
    <Polyline
      positions={route.path}
      color={route.color || '#357df1'}
      weight={route.width || 3}
      dashArray={route.dashed ? '5, 10' : undefined}
      opacity={0.7}
    />
  );
}

interface LeafletMapProps {
  className?: string;
  showControls?: boolean;
  showUserLocation?: boolean;
}

export default function LeafletMap({ 
  className = 'h-full w-full', 
  showControls = true,
  showUserLocation = true 
}: LeafletMapProps) {
  const { resolvedTheme } = useTheme();
  const { 
    center, 
    zoom, 
    items, 
    routes, 
    layers, 
    selectedItemId,
    toggleLayer,
    setView
  } = useMapContext();
  
  const handleLocationFound = useCallback((pos: LatLngExpression) => {
    // Optionnel: centrer la carte sur la position utilisateur
    // setView(pos, 19);
  }, [setView]);
  
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full rounded-lg"
        style={{ background: resolvedTheme === 'dark' ? '#0b1326' : '#f8f9ff' }}
      >
        {/* User Location */}
        {showUserLocation && (
          <UserLocation onLocationFound={handleLocationFound} />
        )}
        
        {/* Tile Layer (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url={resolvedTheme === 'dark' 
            ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          }
        />
        
        {/* Items Layer */}
        {layers.find(l => l.id === 'items')?.visible && (
          <LayerGroup>
            {items.map(item => (
              <ItemMarker
                key={item.id}
                item={item}
                isSelected={item.id === selectedItemId}
              />
            ))}
          </LayerGroup>
        )}
        
        {/* Routes Layer */}
        {layers.find(l => l.id === 'routes')?.visible && (
          <LayerGroup>
            {routes.map(route => (
              <RouteLine key={route.id} route={route} />
            ))}
          </LayerGroup>
        )}
        
        {/* Zoom Controls */}
        {showControls && (
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => {}}
              className="bg-surface-container-highest text-on-surface p-2 rounded-lg shadow-lg hover:bg-surface-bright transition-colors active:scale-95"
              title="Zoom +"
              aria-label="Zoom avant"
            >
              <span className="material-symbols-outlined">add</span>
            </button>
            <button
              onClick={() => {}}
              className="bg-surface-container-highest text-on-surface p-2 rounded-lg shadow-lg hover:bg-surface-bright transition-colors active:scale-95"
              title="Zoom -"
              aria-label="Zoom arrière"
            >
              <span className="material-symbols-outlined">remove</span>
            </button>
            {showUserLocation && (
              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      setView([pos.coords.latitude, pos.coords.longitude], 19);
                    });
                  }
                }}
                className="bg-surface-container-highest text-on-surface p-2 rounded-lg shadow-lg hover:bg-surface-bright transition-colors active:scale-95"
                title="Me localiser"
                aria-label="Ma position"
              >
                <span className="material-symbols-outlined">my_location</span>
              </button>
            )}
          </div>
        )}
        
        {/* Layer Toggle Controls */}
        {showControls && (
          <div className="absolute top-4 right-4 z-[1000] bg-surface-container-highest rounded-lg shadow-lg p-2">
            <div className="flex flex-col gap-1">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
                    layer.visible
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container text-on-surface-variant'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {layer.visible ? 'visibility' : 'visibility_off'}
                  </span>
                  <span>{layer.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </MapContainer>
    </div>
  );
}
