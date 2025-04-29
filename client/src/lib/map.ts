import { useEffect, useRef } from 'react';
import L from 'leaflet';

// Types for map markers
export interface MarkerData {
  id: number;
  latitude: string;
  longitude: string;
  type: string;
  title: string;
  color?: string;
}

export interface EmergencySignalMarker {
  id: number;
  latitude: string;
  longitude: string;
  user: {
    id: number;
    fullName: string;
  };
  createdAt: string;
  active: boolean;
}

export interface TeamMarker {
  id: number;
  latitude: string;
  longitude: string;
  name: string;
  status: string;
}

// Custom icon for crime markers
export const createMarkerIcon = (color: string, isTeam: boolean = false) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="crime-marker" style="background-color: ${color}; ${isTeam ? 'border: 2px solid white;' : ''}"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Create emergency marker with pulse effect
export const createEmergencyMarker = () => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div class="crime-marker pulse" style="background-color: #dc2626;"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });
};

// Hook to initialize and use Leaflet map
export const useMap = (
  containerId: string, 
  center: [number, number] = [12.9716, 77.5946], // Bengaluru coordinates
  zoom: number = 13
) => {
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapRef.current) {
      // Initialize map
      const map = L.map(containerId).setView(center, zoom);
      
      // Add tile layer (use OSM as fallback if MapBox token not available)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
      
      mapRef.current = map;
    }
    
    // Cleanup on unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [containerId, center, zoom]);

  // Function to add/update crime markers
  const updateMarkers = (markers: MarkerData[]) => {
    if (!mapRef.current) return;
    
    const currentMarkerIds = new Set<string>();
    
    // Add or update markers
    markers.forEach(marker => {
      const markerId = `crime-${marker.id}`;
      currentMarkerIds.add(markerId);
      
      const lat = parseFloat(marker.latitude);
      const lng = parseFloat(marker.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      
      const color = marker.color || getMarkerColor(marker.type);
      
      if (markersRef.current[markerId]) {
        // Update existing marker position
        markersRef.current[markerId].setLatLng([lat, lng]);
      } else {
        // Create new marker
        const icon = createMarkerIcon(color);
        const newMarker = L.marker([lat, lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${marker.title}</b><br>${marker.type}`);
        
        markersRef.current[markerId] = newMarker;
      }
    });
    
    // Remove markers that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (id.startsWith('crime-') && !currentMarkerIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  };
  
  // Function to add/update emergency markers
  const updateEmergencyMarkers = (signals: EmergencySignalMarker[]) => {
    if (!mapRef.current) return;
    
    const currentSignalIds = new Set<string>();
    
    // Add or update emergency signals
    signals.forEach(signal => {
      const signalId = `emergency-${signal.id}`;
      currentSignalIds.add(signalId);
      
      const lat = parseFloat(signal.latitude);
      const lng = parseFloat(signal.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      
      if (markersRef.current[signalId]) {
        // Update existing marker position
        markersRef.current[signalId].setLatLng([lat, lng]);
      } else {
        // Create new marker with pulse effect
        const icon = createEmergencyMarker();
        const timeAgo = getTimeAgo(new Date(signal.createdAt));
        
        const newMarker = L.marker([lat, lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>Emergency Signal</b><br>From: ${signal.user.fullName}<br>Reported: ${timeAgo}`);
        
        markersRef.current[signalId] = newMarker;
      }
    });
    
    // Remove signals that are no longer active
    Object.keys(markersRef.current).forEach(id => {
      if (id.startsWith('emergency-') && !currentSignalIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  };
  
  // Function to add/update team markers
  const updateTeamMarkers = (teams: TeamMarker[]) => {
    if (!mapRef.current) return;
    
    const currentTeamIds = new Set<string>();
    
    // Add or update team markers
    teams.forEach(team => {
      const teamId = `team-${team.id}`;
      currentTeamIds.add(teamId);
      
      const lat = parseFloat(team.latitude);
      const lng = parseFloat(team.longitude);
      if (isNaN(lat) || isNaN(lng)) return;
      
      if (markersRef.current[teamId]) {
        // Update existing marker position
        markersRef.current[teamId].setLatLng([lat, lng]);
      } else {
        // Create new marker
        const icon = createMarkerIcon('#1e40af', true);
        const newMarker = L.marker([lat, lng], { icon })
          .addTo(mapRef.current)
          .bindPopup(`<b>${team.name}</b><br>Status: ${formatStatus(team.status)}`);
        
        markersRef.current[teamId] = newMarker;
      }
    });
    
    // Remove team markers that no longer exist
    Object.keys(markersRef.current).forEach(id => {
      if (id.startsWith('team-') && !currentTeamIds.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });
  };
  
  // Function to set up click handler for location selection
  const setupLocationSelect = (callback: (lat: number, lng: number) => void) => {
    if (!mapRef.current) return;
    
    const map = mapRef.current;
    
    // Create a temporary marker that follows clicks
    let tempMarker: L.Marker | null = null;
    
    // Add click event to the map
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      
      // Remove previous temporary marker if exists
      if (tempMarker) {
        map.removeLayer(tempMarker);
      }
      
      // Create a new marker at clicked position
      tempMarker = L.marker([lat, lng]).addTo(map);
      
      // Call the callback with coordinates
      callback(lat, lng);
    };
    
    map.on('click', handleMapClick);
    
    // Return function to remove event listener
    return () => {
      map.off('click', handleMapClick);
      if (tempMarker) {
        map.removeLayer(tempMarker);
      }
    };
  };
  
  return { 
    map: mapRef.current, 
    updateMarkers, 
    updateEmergencyMarkers, 
    updateTeamMarkers,
    setupLocationSelect 
  };
};

// Helper to get appropriate marker color based on crime type
const getMarkerColor = (crimeType: string): string => {
  const type = crimeType.toLowerCase();
  
  if (type.includes('vehicle') || type.includes('car') || type.includes('theft')) {
    return '#dc2626'; // Red for vehicle-related crimes
  }
  
  if (type.includes('break') || type.includes('burglary')) {
    return '#b91c1c'; // Darker red for break-ins
  }
  
  if (type.includes('suspicious') || type.includes('activity')) {
    return '#ca8a04'; // Yellow for suspicious activity
  }
  
  if (type.includes('vandalism')) {
    return '#7e22ce'; // Purple for vandalism
  }
  
  return '#2563eb'; // Default blue
};

// Helper to format elapsed time
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return `${seconds} seconds ago`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

// Helper to format team status
const formatStatus = (status: string): string => {
  switch (status) {
    case 'available':
      return 'Available';
    case 'assigned':
      return 'Assigned';
    case 'on_scene':
      return 'On Scene';
    case 'en_route':
      return 'En Route';
    default:
      return status;
  }
};
