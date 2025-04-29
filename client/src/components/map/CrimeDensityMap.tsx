import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMap, MarkerData } from '@/lib/map';
import { useQuery } from '@tanstack/react-query';
import { CrimeReport, Team } from '@shared/schema';
import { Link } from 'wouter';
import 'leaflet/dist/leaflet.css';

interface CrimeDensityMapProps {
  showTeams?: boolean;
  height?: string;
}

const CrimeDensityMap = ({ showTeams = true, height = "400px" }: CrimeDensityMapProps) => {
  const mapContainerId = `density-map-${Math.random().toString(36).substring(2, 9)}`;
  const { map, updateMarkers, updateTeamMarkers } = useMap(mapContainerId);
  
  // Fetch crime reports
  const { data: crimeReports, isLoading: isLoadingReports } = useQuery<CrimeReport[]>({
    queryKey: ['/api/reports'],
  });
  
  // Fetch teams if needed
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
    enabled: showTeams,
  });
  
  // Update markers when data changes
  useEffect(() => {
    if (!map) return;
    
    // Map crime reports to marker data
    if (crimeReports) {
      const crimeMarkers: MarkerData[] = crimeReports.map(report => ({
        id: report.id,
        latitude: report.latitude,
        longitude: report.longitude,
        type: report.crimeType,
        title: report.crimeType,
      }));
      
      updateMarkers(crimeMarkers);
    }
    
    // Map teams if needed
    if (showTeams && teams) {
      const teamMarkers = teams.map(team => ({
        id: team.id,
        latitude: "40.7128", // This would be the team's current location in a real app
        longitude: "-74.0060",
        name: team.name,
        status: team.status
      }));
      
      updateTeamMarkers(teamMarkers);
    }
  }, [map, crimeReports, teams, showTeams, updateMarkers, updateTeamMarkers]);
  
  // Count crime types
  const crimeTypeCounts = crimeReports?.reduce((acc, report) => {
    const type = getCrimeTypeCategory(report.crimeType);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader>
        <CardTitle>Crime Density Map</CardTitle>
      </CardHeader>
      
      <CardContent>
        <div 
          id={mapContainerId} 
          className="map-container rounded-lg overflow-hidden" 
          style={{ height }}
        ></div>
      </CardContent>
      
      <CardFooter className="bg-gray-50 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
            <span className="text-sm text-gray-600">Vehicle ({crimeTypeCounts['vehicle'] || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-600">Suspicious ({crimeTypeCounts['suspicious'] || 0})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
            <span className="text-sm text-gray-600">Break-in ({crimeTypeCounts['break-in'] || 0})</span>
          </div>
          {showTeams && (
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-blue-600 mr-2"></div>
              <span className="text-sm text-gray-600">Teams ({teams?.length || 0})</span>
            </div>
          )}
        </div>
        
        <Link href="/map">
          <a className="text-primary text-sm font-medium">
            Full Map View
          </a>
        </Link>
      </CardFooter>
    </Card>
  );
};

// Helper function to categorize crime types
const getCrimeTypeCategory = (crimeType: string): string => {
  const type = crimeType.toLowerCase();
  
  if (type.includes('vehicle') || type.includes('car') || type.includes('theft')) {
    return 'vehicle';
  }
  
  if (type.includes('break') || type.includes('burglary')) {
    return 'break-in';
  }
  
  if (type.includes('suspicious') || type.includes('activity')) {
    return 'suspicious';
  }
  
  return 'other';
};

export default CrimeDensityMap;
