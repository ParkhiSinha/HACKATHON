import { useRequirePolice } from "@/lib/auth";
import PoliceLayout from "@/components/layout/PoliceLayout";
import CrimeMap from "@/components/map/CrimeMap";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import EmergencyAlerts from "@/components/emergencySignal/EmergencyAlerts";

export default function CrimeMapPage() {
  const { isLoading } = useRequirePolice();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <PoliceLayout title="Crime Map">
      {/* Emergency Alerts */}
      <EmergencyAlerts />
      
      {/* Full-sized Crime Map */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Crime Density Map</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[calc(100vh-300px)] min-h-[500px]">
              <CrimeMap height="100%" showControls={true} showLegend={true} />
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Map Usage Guide</h3>
                <ul className="text-sm space-y-2 text-gray-600">
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-primary mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Use the layer controls on the left to show/hide different elements
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-primary mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Click on markers to view details about the incident
                  </li>
                  <li className="flex items-start">
                    <svg className="w-4 h-4 text-primary mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Zoom and pan to explore different areas
                  </li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Crime Hotspots</h3>
                <p className="text-sm text-gray-600 mb-2">Areas with high concentration of incidents:</p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Downtown (35%)</li>
                  <li>• Westside (25%)</li>
                  <li>• North Hills (18%)</li>
                  <li>• Central Park Area (14%)</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h3>
                <p className="text-sm text-gray-600 mb-2">The map shows the following recent activities:</p>
                <ul className="text-sm space-y-1 text-gray-600">
                  <li>• Active emergency signals</li>
                  <li>• Unresolved crime reports</li>
                  <li>• Team locations and statuses</li>
                  <li>• Crime density patterns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PoliceLayout>
  );
}
