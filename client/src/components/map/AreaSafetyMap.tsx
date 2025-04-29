import { useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMap, MarkerData } from '@/lib/map';
import { useQuery } from '@tanstack/react-query';
import { CrimeReport } from '@shared/schema';
import { Link } from 'wouter';
import 'leaflet/dist/leaflet.css';

const AreaSafetyMap = () => {
  const mapContainerId = `safety-map-${Math.random().toString(36).substring(2, 9)}`;
  const { map, updateMarkers } = useMap(mapContainerId);
  
  // Fetch crime reports
  const { data: crimeReports, isLoading } = useQuery<CrimeReport[]>({
    queryKey: ['/api/reports'],
  });
  
  // Update markers when data changes
  useEffect(() => {
    if (!map || !crimeReports) return;
    
    // Map crime reports to marker data
    const crimeMarkers: MarkerData[] = crimeReports.map(report => ({
      id: report.id,
      latitude: report.latitude,
      longitude: report.longitude,
      type: report.crimeType,
      title: report.crimeType,
    }));
    
    updateMarkers(crimeMarkers);
  }, [map, crimeReports, updateMarkers]);
  
  // Count crime types
  const crimeTypeCounts = crimeReports?.reduce((acc, report) => {
    const type = getCrimeTypeCategory(report.crimeType);
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};
  
  return (
    <Card className="overflow-hidden h-full">
      <CardHeader className="px-6 py-4 border-b border-gray-100">
        <CardTitle className="text-lg font-semibold text-gray-800">Area Safety Map</CardTitle>
      </CardHeader>
      
      <CardContent className="p-6">
        <div id={mapContainerId} className="map-container rounded-lg overflow-hidden mb-4 h-[250px]"></div>
        
        <div className="space-y-3">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
            <span className="text-sm text-gray-600">
              Vehicle theft/break-in ({crimeTypeCounts['vehicle'] || 0})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span className="text-sm text-gray-600">
              Suspicious activity ({crimeTypeCounts['suspicious'] || 0})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-red-600 mr-2"></div>
            <span className="text-sm text-gray-600">
              Break-in/burglary ({crimeTypeCounts['break-in'] || 0})
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <Link href="/map">
          <a className="text-primary text-sm font-medium flex items-center">
            View detailed crime map
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
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

export default AreaSafetyMap;
