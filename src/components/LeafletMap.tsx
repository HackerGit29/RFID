import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, LayerGroup, useMap, CircleMarker } from 'react-leaflet';
import { Icon, LatLngExpression } from 'leaflet';
import { useMapContext, MapItem } from '../contexts/MapContext';
import { useTheme } from '../contexts/ThemeContext';
import 'leaflet/dist/leaflet.css';

// Custom marker icons
const createCustomIcon = (status?: string): Icon => {
  const color = status === 'in_use' ? '#3B82F6' : status === 'maintenance' ? '#F59E0B' : status === 'lost' ? '#EF4444' : '#06C167';
  const svgIcon = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512"><path fill="${color}" d="M384 192c0 87.4-117 243-168.3 307.2c-12.3 15.3-35.1 15.3-47.4 0C117 435 0 279 0 192C0 86 86 0 192 0s192 86 192 192z"/></svg>`;
  
  return new Icon({
    iconUrl: svgIcon,
    iconSize: [25, 40],
    iconAnchor: [12, 40],
    popupAnchor: [1, -34],
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
    case 'available': return '#06C167';
    case 'in_use': return '#ffffff';
    case 'maintenance': return '#06C167';
    case 'lost': return '#ef4444';
    default: return '#06C167';
  }
};

// User location component
function UserLocation() {
  const { userPosition, setUserPosition } = useMapContext();

  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const pos: LatLngExpression = [position.coords.latitude, position.coords.longitude];
        setUserPosition(pos);
      },
      () => {
        // Error handling is managed by MapContext
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [setUserPosition]);

  if (!userPosition) return null;

  return (
    <>
      <Marker position={userPosition} icon={createUserIcon()} zIndexOffset={1000}>
        <Popup>
          <div className="p-3 min-w-[180px]" style={{ background: '#121212', borderRadius: '12px' }}>
            <h3 className="font-bold" style={{ color: '#ffffff', fontFamily: 'UberMove, sans-serif' }}>Votre position</h3>
          </div>
        </Popup>
      </Marker>
      {/* Precision circle */}
      <CircleMarker
        center={userPosition}
        radius={20}
        pathOptions={{ color: '#06C167', fillColor: '#06C167', fillOpacity: 0.1, weight: 1 }}
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
        <div className="p-3 min-w-[200px]" style={{ background: '#121212', borderRadius: '12px' }}>
          <h3 className="font-bold text-lg" style={{ color: '#ffffff', fontFamily: 'UberMove, sans-serif' }}>{item.name}</h3>
          <p className="text-sm capitalize mt-1" style={{ color: '#ffffff99' }}>Type: {item.type}</p>
          {item.status && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`w-2 h-2 rounded-full ${
                item.status === 'available' ? 'bg-[#06C167]' :
                item.status === 'in_use' ? 'bg-[#ffffff]' :
                item.status === 'maintenance' ? 'bg-[#06C167]' : 'bg-[#ef4444]'
              }`} />
              <span className={`text-sm font-bold capitalize`} style={{ color: getStatusColor(item.status) }}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
          )}
          {item.distance && (
            <p className="text-sm mt-2" style={{ color: '#ffffff' }}>
              Distance: <span className="font-bold" style={{ color: '#06C167' }}>{item.distance.toFixed(1)}m</span>
            </p>
          )}
          {item.rssi && (
            <p className="text-sm" style={{ color: '#ffffff99' }}>
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
      color={route.color || '#06C167'}
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
  
  return (
    <div className={`relative ${className}`} style={{ height: '100%', width: '100%', minHeight: '300px' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        className="h-full w-full rounded-lg"
        style={{ background: resolvedTheme === 'dark' ? '#000000' : '#f8f9ff', height: '100%', width: '100%' }}
      >
        {/* User Location */}
        {showUserLocation && (
          <UserLocation />
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
        
        {/* Zoom Controls - Uber Style */}
        {showControls && (
          <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-2">
            <button
              onClick={() => {}}
              className="p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{ background: '#121212', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              title="Zoom +"
              aria-label="Zoom avant"
            >
              <span className="material-symbols-outlined" style={{ color: '#ffffff' }}>add</span>
            </button>
            <button
              onClick={() => {}}
              className="p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
              style={{ background: '#121212', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
              title="Zoom -"
              aria-label="Zoom arrière"
            >
              <span className="material-symbols-outlined" style={{ color: '#ffffff' }}>remove</span>
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
                className="p-3 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                style={{ background: '#06C167', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
                title="Me localiser"
                aria-label="Ma position"
              >
                <span className="material-symbols-outlined" style={{ color: '#000000' }}>my_location</span>
              </button>
            )}
          </div>
        )}
        
        {/* Layer Toggle Controls - Uber Style */}
        {showControls && (
          <div className="absolute top-4 right-4 z-[1000] rounded-xl shadow-lg p-2" style={{ background: '#121212', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
            <div className="flex flex-col gap-1">
              {layers.map(layer => (
                <button
                  key={layer.id}
                  onClick={() => toggleLayer(layer.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm transition-all ${
                    layer.visible
                      ? ''
                      : ''
                  }`}
                  style={{
                    background: layer.visible ? '#06C167' : '#ffffff20',
                    color: layer.visible ? '#000000' : '#ffffff',
                    fontFamily: 'UberMoveText, sans-serif'
                  }}
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
