/**
 * ToolDetailMap - Composant Map MUI + Leaflet avec clustering
 * Affiche l'historique de position d'un outil avec markers, polyline et clustering
 */

import { useEffect, useState, useMemo } from 'react';
import { Paper, Box, Typography, Divider, Button, Stack } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

import { Detection, getDetections } from '../utils/db';

// Import types for Detection from db.ts
interface DetectionPoint {
  id: number;
  tool_id: string;
  lat: number;
  lng: number;
  rssi: number;
  detected_at: string;
}

interface ToolDetailMapProps {
  toolId: string;
  toolName: string;
  address?: string;
  manufacturer?: string;
  detectCount?: number;
  firstDetection?: string;
  lastDetection?: string;
}

// Custom green marker icon (SVG data URL)
const greenIcon = L.icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0Ij48cGF0aCBkPSJNMTIgMkM2LjIgMiAyIDYuMiAyIDEyUzYuMiAxNiAxMiAxNmM1LjggMCAxMC00LjIgMTAtMTBTMTcuOCAyIDEyIDJ6bTAgMTJjLTQuNCAwLTgtMy42LTgtOHMzLjYtOCA4LTh4OCAzLjYgOCA4LTMuNiA4LTggOHptLTEtOWw1IDVoLTl2OWgtMnYtOUw3IDNINXYtM3Y5em0wIDBIMFYzaC0xdjJ6bTAgMEgxdi0ydjJ6bTAgMCAxdi0ydjJ6IiBmaWxsPSIjMDZDMTY3IiBzdHJva2U9IiMwNjAxNjciIHN0cm9rZS13aWR0aD0iMiIvPjwvc3ZnPg==',
  iconSize: [24, 24],
  iconAnchor: [12, 24],
  popupAnchor: [0, -24],
});

const defaultCenter: [number, number] = [48.8566, 2.3522]; // Paris
const defaultZoom = 15;

/**
 * MapEvents - Gère les événements de la carte (lazy load)
 */
function MapEvents({ center }: { center: [number, number] }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, defaultZoom);
  }, [map, center]);
  
  return null;
}

/**
 * ToolDetailMap - Main composant
 */
export default function ToolDetailMap({
  toolId,
  toolName,
  address = 'N/A',
  manufacturer = 'N/A',
  detectCount = 0,
  firstDetection = 'N/A',
  lastDetection = 'N/A',
}: ToolDetailMapProps) {
  const [detections, setDetections] = useState<DetectionPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Charger les detections
  useEffect(() => {
    async function loadDetections() {
      try {
        const data = await getDetections(toolId, 200);
        setDetections(data as unknown as DetectionPoint[]);
      } catch (err) {
        console.error('[ToolDetailMap] Load failed:', err);
        setError(err instanceof Error ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    }
    
    if (toolId) {
      loadDetections();
    }
  }, [toolId]);

  // Calculer le centre de la carte
  const mapCenter = useMemo((): [number, number] => {
    if (detections.length === 0) return defaultCenter;
    
    const sumLat = detections.reduce((sum, d) => sum + d.lat, 0);
    const sumLng = detections.reduce((sum, d) => sum + d.lng, 0);
    return [sumLat / detections.length, sumLng / detections.length];
  }, [detections]);

  // Formater les dates
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr || dateStr === 'N/A') return 'N/A';
    try {
      return new Date(dateStr).toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <Paper sx={{ bgcolor: '#121212', borderRadius: 3, overflow: 'hidden' }}>
      {/* Header */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="h6" sx={{ color: '#fff', fontWeight: 600, fontFamily: 'UberMove, sans-serif' }}>
          Device details
        </Typography>
      </Box>

      {/* Map */}
      <Paper sx={{ height: 340, bgcolor: '#000', mx: 2, mt: 2, borderRadius: 2, overflow: 'hidden' }}>
        {loading ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#666' }}>Chargement...</Typography>
          </Box>
        ) : error ? (
          <Box sx={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ color: '#EF4444' }}>{error}</Typography>
          </Box>
        ) : (
          <MapContainer
            center={mapCenter}
            zoom={defaultZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={true}
          >
            <MapEvents center={mapCenter} />
            
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Markers with clustering */}
            {detections.map((det, idx) => (
              <Marker
                key={`${det.tool_id}-${idx}`}
                position={[det.lat, det.lng]}
                icon={greenIcon}
              >
                <Popup>
                  <div style={{ minWidth: 150 }}>
                    <strong>{toolName}</strong>
                    <br />
                    <small>{formatDate(det.detected_at)}</small>
                    <br />
                    <small>RSSI: {det.rssi} dBm</small>
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* Polyline - trace l'itinéraire */}
            {detections.length > 1 && (
              <Polyline
                positions={detections.map(d => [d.lat, d.lng] as [number, number])}
                pathOptions={{
                  color: '#06C167',
                  weight: 3,
                  opacity: 0.8,
                }}
              />
            )}
          </MapContainer>
        )}
      </Paper>

      {/* Warning if many points */}
      {detectCount > 100 && (
        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="caption" sx={{ color: '#F59E0B', fontSize: '10px' }}>
            ⚠️ L'historique étendu peut affecter les performances de la carte
          </Typography>
        </Box>
      )}

      {/* Metadata Section */}
      <Box sx={{ p: 2 }}>
        {/* History period */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#888' }}>
            History period: Day
          </Typography>
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="contained"
              color="warning"
              sx={{ 
                textTransform: 'none',
                fontSize: '12px',
                bgcolor: '#F59E0B',
                '&:hover': { bgcolor: '#D97706' }
              }}
            >
              + Add tag
            </Button>
            <Button
              size="small"
              variant="outlined"
              sx={{ 
                textTransform: 'none',
                fontSize: '12px',
                borderColor: '#444',
                color: '#aaa',
                '&:hover': { borderColor: '#666', bgcolor: 'rgba(255,255,255,0.05)' }
              }}
            >
              Audio
            </Button>
          </Stack>
        </Box>

        <Divider sx={{ borderColor: 'rgba(255,255,255,0.1)', mb: 2 }} />

        {/* Details list */}
        <Stack spacing={1.5}>
          <DetailRow label="Name" value={toolName} />
          <DetailRow label="Address" value={address} />
          <DetailRow label="Manufacturer" value={manufacturer} />
          <DetailRow label="Detect count" value={detectCount.toString()} />
          <DetailRow label="First detection" value={formatDate(firstDetection)} />
          <DetailRow label="Last detection" value={formatDate(lastDetection)} />
        </Stack>
      </Box>
    </Paper>
  );
}

/**
 * DetailRow - Affiche une ligne label: value
 */
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography variant="body2" sx={{ color: '#888' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: '#fff', fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}