import { useQuery } from "@tanstack/react-query";
import { CrimeReport } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

export default function CrimeAnalytics() {
  const { data: reports, isLoading } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
  });

  // Process data for charts
  const processData = () => {
    if (!reports) return null;

    // Count crime types
    const crimeTypes: Record<string, number> = {};
    reports.forEach((report) => {
      const type = report.crimeType;
      crimeTypes[type] = (crimeTypes[type] || 0) + 1;
    });

    // Prepare data for pie chart
    const pieData = Object.entries(crimeTypes).map(([name, value]) => ({
      name,
      value,
    }));

    // Count reports by time of day
    const timeDistribution: Record<string, number> = {
      "Morning (6AM-12PM)": 0,
      "Afternoon (12PM-6PM)": 0,
      "Evening (6PM-12AM)": 0,
      "Night (12AM-6AM)": 0,
    };

    reports.forEach((report) => {
      const date = new Date(report.date);
      const hour = date.getHours();

      if (hour >= 6 && hour < 12) {
        timeDistribution["Morning (6AM-12PM)"]++;
      } else if (hour >= 12 && hour < 18) {
        timeDistribution["Afternoon (12PM-6PM)"]++;
      } else if (hour >= 18 && hour < 24) {
        timeDistribution["Evening (6PM-12AM)"]++;
      } else {
        timeDistribution["Night (12AM-6AM)"]++;
      }
    });

    // Prepare data for time distribution chart
    const timeData = Object.entries(timeDistribution).map(([name, value]) => ({
      name,
      value,
    }));

    // Count reports by location
    const locationDistribution: Record<string, number> = {};
    reports.forEach((report) => {
      const location = report.location;
      locationDistribution[location] = (locationDistribution[location] || 0) + 1;
    });

    // Sort and limit to top 5 locations
    const sortedLocations = Object.entries(locationDistribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    // Prepare data for location chart
    const locationData = sortedLocations.map(([name, value]) => ({
      name,
      value,
    }));

    return {
      pieData,
      timeData,
      locationData,
    };
  };

  const data = processData();

  // Colors for pie chart
  const COLORS = ["#2563eb", "#dc2626", "#ca8a04", "#7e22ce", "#10b981"];

  // Loading state
  if (isLoading || !data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Crime Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <svg
                className="w-10 h-10 text-gray-400 mx-auto mb-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <p className="text-gray-500">Loading crime analytics...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crime Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 bg-white rounded-lg mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data.timeData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#2563eb" name="Reports" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Top Crime Categories</h4>
            <ol className="space-y-2">
              {data.pieData.map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-800">{entry.name}</span>
                  <span className="text-primary font-medium">
                    {((entry.value / reports.length) * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Time Distribution</h4>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.timeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={30}
                    outerRadius={60}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {data.timeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-gray-500 mb-3">Hotspot Neighborhoods</h4>
            <ol className="space-y-2">
              {data.locationData.map((entry, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-800">{entry.name}</span>
                  <span className="text-primary font-medium">
                    {((entry.value / reports.length) * 100).toFixed(0)}%
                  </span>
                </li>
              ))}
              {data.locationData.length === 0 && (
                <li className="text-gray-500">No location data available</li>
              )}
            </ol>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
