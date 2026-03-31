import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { LatLngExpression, LatLngBoundsExpression } from 'leaflet';

export interface MapItem {
  id: string;
  name: string;
  type: 'tool' | 'equipment' | 'zone' | 'checkpoint';
  position: LatLngExpression;
  status?: 'available' | 'in_use' | 'maintenance' | 'lost';
  rssi?: number;
  distance?: number;
  icon?: string;
  metadata?: Record<string, any>;
}

export interface MapRoute {
  id: string;
  name: string;
  path: LatLngExpression[];
  color?: string;
  width?: number;
  dashed?: boolean;
}

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  type: 'items' | 'routes' | 'heatmap' | 'zones';
}

interface MapContextType {
  // Map state
  center: LatLngExpression;
  zoom: number;
  bounds?: LatLngBoundsExpression;
  
  // Items
  items: MapItem[];
  addItem: (item: MapItem) => void;
  updateItem: (id: string, updates: Partial<MapItem>) => void;
  removeItem: (id: string) => void;
  clearItems: () => void;
  
  // Routes
  routes: MapRoute[];
  addRoute: (route: MapRoute) => void;
  removeRoute: (id: string) => void;
  clearRoutes: () => void;
  
  // Layers
  layers: MapLayer[];
  toggleLayer: (layerId: string) => void;
  
  // View controls
  setView: (center: LatLngExpression, zoom: number) => void;
  fitBounds: (bounds: LatLngBoundsExpression) => void;
  focusOnItem: (itemId: string) => void;
  
  // Interaction
  selectedItemId?: string;
  selectItem: (id: string | undefined) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

// Default lab position (can be customized)
const DEFAULT_LAB_CENTER: LatLngExpression = [48.8566, 2.3522]; // Paris par défaut

export function MapProvider({ children }: { children: ReactNode }) {
  // Map state
  const [center, setCenter] = useState<LatLngExpression>(DEFAULT_LAB_CENTER);
  const [zoom, setZoom] = useState(18);
  const [bounds, setBounds] = useState<LatLngBoundsExpression | undefined>();
  
  // Items state
  const [items, setItems] = useState<MapItem[]>([]);
  
  // Routes state
  const [routes, setRoutes] = useState<MapRoute[]>([]);
  
  // Layers state
  const [layers, setLayers] = useState<MapLayer[]>([
    { id: 'items', name: 'Outils', visible: true, type: 'items' },
    { id: 'routes', name: 'Itinéraires', visible: true, type: 'routes' },
    { id: 'heatmap', name: 'Heatmap', visible: false, type: 'heatmap' },
    { id: 'zones', name: 'Zones', visible: true, type: 'zones' },
  ]);
  
  // Selected item
  const [selectedItemId, setSelectedItemId] = useState<string | undefined>();
  
  // Item management
  const addItem = useCallback((item: MapItem) => {
    setItems(prev => [...prev, item]);
  }, []);
  
  const updateItem = useCallback((id: string, updates: Partial<MapItem>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ));
  }, []);
  
  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId(undefined);
    }
  }, [selectedItemId]);
  
  const clearItems = useCallback(() => {
    setItems([]);
    setSelectedItemId(undefined);
  }, []);
  
  // Route management
  const addRoute = useCallback((route: MapRoute) => {
    setRoutes(prev => [...prev, route]);
  }, []);
  
  const removeRoute = useCallback((id: string) => {
    setRoutes(prev => prev.filter(route => route.id !== id));
  }, []);
  
  const clearRoutes = useCallback(() => {
    setRoutes([]);
  }, []);
  
  // Layer management
  const toggleLayer = useCallback((layerId: string) => {
    setLayers(prev => prev.map(layer =>
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  }, []);
  
  // View controls
  const setView = useCallback((newCenter: LatLngExpression, newZoom: number) => {
    setCenter(newCenter);
    setZoom(newZoom);
  }, []);
  
  const fitBounds = useCallback((newBounds: LatLngBoundsExpression) => {
    setBounds(newBounds);
  }, []);
  
  const focusOnItem = useCallback((itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (item) {
      setCenter(item.position);
      setZoom(20);
      setSelectedItemId(itemId);
    }
  }, [items]);
  
  // Selection
  const selectItem = useCallback((id: string | undefined) => {
    setSelectedItemId(id);
  }, []);
  
  const value: MapContextType = {
    // Map state
    center,
    zoom,
    bounds,
    
    // Items
    items,
    addItem,
    updateItem,
    removeItem,
    clearItems,
    
    // Routes
    routes,
    addRoute,
    removeRoute,
    clearRoutes,
    
    // Layers
    layers,
    toggleLayer,
    
    // View controls
    setView,
    fitBounds,
    focusOnItem,
    
    // Interaction
    selectedItemId,
    selectItem,
  };
  
  return (
    <MapContext.Provider value={value}>
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}
