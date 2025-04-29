import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMap, MarkerData } from '@/lib/map';
import { useQuery } from '@tanstack/react-query';
import { CrimeReport, Team, EmergencySignal } from '@shared/schema';
import 'leaflet/dist/leaflet.css';

interface CrimeMapProps {
  height?: string;
  showControls?: boolean;
  showLegend?: boolean;
}

const CrimeMap = ({ height = "500px", showControls = true, showLegend = true }: CrimeMapProps) => {
  const mapContainerId = `map-${Math.random().toString(36).substring(2, 9)}`;
  const { map, updateMarkers, updateEmergencyMarkers, updateTeamMarkers } = useMap(mapContainerId);
  
  const [filterOptions, setFilterOptions] = useState({
    showCrimes: true,
    showTeams: true,
    showEmergencies: true,
  });
  
  // Fetch crime reports
  const { data: crimeReports, isLoading: isLoadingReports } = useQuery<CrimeReport[]>({
    queryKey: ['/api/reports'],
  });
  
  // Fetch teams
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });
  
  // Fetch emergency signals
  const { data: emergencies, isLoading: isLoadingEmergencies } = useQuery<EmergencySignal[]>({
    queryKey: ['/api/emergency'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });
  
  // Update markers when data changes
  useEffect(() => {
    if (!map) return;
    
    // Map crime reports to marker data
    if (crimeReports && filterOptions.showCrimes) {
      const crimeMarkers: MarkerData[] = crimeReports.map(report => ({
        id: report.id,
        latitude: report.latitude,
        longitude: report.longitude,
        type: report.crimeType,
        title: report.crimeType,
      }));
      
      updateMarkers(crimeMarkers);
    } else {
      updateMarkers([]);
    }
    
    // Map emergency signals
    if (emergencies && filterOptions.showEmergencies) {
      const emergencyMarkersWithUser = emergencies.map(signal => ({
        ...signal,
        user: { id: 1, fullName: "Emergency Signal" } // In real app, fetch user data
      }));
      
      updateEmergencyMarkers(emergencyMarkersWithUser);
    } else {
      updateEmergencyMarkers([]);
    }
    
    // Map teams
    if (teams && filterOptions.showTeams) {
      const teamMarkers = teams.map(team => ({
        id: team.id,
        latitude: "40.7128", // This would be the team's current location in a real app
        longitude: "-74.0060",
        name: team.name,
        status: team.status
      }));
      
      updateTeamMarkers(teamMarkers);
    } else {
      updateTeamMarkers([]);
    }
  }, [map, crimeReports, teams, emergencies, filterOptions, updateMarkers, updateEmergencyMarkers, updateTeamMarkers]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Crime Map</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div 
          id={mapContainerId} 
          className="map-container rounded-lg overflow-hidden mb-4" 
          style={{ height }}
        ></div>
        
        {showControls && (
          <div className="absolute left-5 top-20 bg-white rounded-lg shadow-md p-2 z-20">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="show-crimes" 
                  checked={filterOptions.showCrimes}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, showCrimes: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="show-crimes" className="text-sm font-medium">Show Crimes</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="show-teams" 
                  checked={filterOptions.showTeams}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, showTeams: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="show-teams" className="text-sm font-medium">Show Teams</label>
              </div>
              
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="show-emergencies" 
                  checked={filterOptions.showEmergencies}
                  onChange={(e) => setFilterOptions(prev => ({ ...prev, showEmergencies: e.target.checked }))}
                  className="rounded text-primary focus:ring-primary"
                />
                <label htmlFor="show-emergencies" className="text-sm font-medium">Show Emergencies</label>
              </div>
            </div>
          </div>
        )}
        
        {showLegend && (
          <div className="bg-gray-50 px-4 py-3 flex flex-wrap items-center gap-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
              <span className="text-sm text-gray-600">Vehicle theft/break-in</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-sm text-gray-600">Suspicious activity</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
              <span className="text-sm text-gray-600">Break-in/burglary</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600">Teams</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CrimeMap;
