import { useRequirePolice } from "@/lib/auth";
import PoliceLayout from "@/components/layout/PoliceLayout";
import StatsOverview from "@/components/stats/StatsOverview";
import CrimeDensityMap from "@/components/map/CrimeDensityMap";
import CrimeAnalytics from "@/components/analytics/CrimeAnalytics";
import TeamsTable from "@/components/teams/TeamsTable";
import EmergencyAlerts from "@/components/emergencySignal/EmergencyAlerts";
import { useQuery } from "@tanstack/react-query";
import { CrimeReport } from "@shared/schema";

export default function PoliceDashboard() {
  const { user, isLoading } = useRequirePolice();
  
  const { data: reports } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
    enabled: !!user,
  });

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
    <PoliceLayout title="Police Dashboard">
      {/* Emergency Alerts Section */}
      <EmergencyAlerts />
      
      {/* Stats Overview */}
      <StatsOverview userRole="police" />
      
      {/* Crime Map & Reports Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Crime Density Map */}
        <div className="lg:col-span-2">
          <CrimeDensityMap showTeams={true} />
        </div>
        
        {/* Recent Reports Table */}
        <div>
          <table className="min-w-full divide-y divide-gray-200 bg-white rounded-lg shadow overflow-hidden">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports?.slice(0, 5).map((report) => (
                <tr key={report.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{report.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.crimeType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      report.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 
                      'bg-green-100 text-green-800'}`}>
                      {report.status === 'pending' ? 'Pending' : 
                       report.status === 'in_progress' ? 'In Progress' : 
                       'Resolved'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Crime Analytics */}
      <div className="mb-8">
        <CrimeAnalytics />
      </div>
      
      {/* Active Teams */}
      <TeamsTable />
    </PoliceLayout>
  );
}
