import { useRequireAuth } from "@/lib/auth";
import UserLayout from "@/components/layout/UserLayout";
import StatsOverview from "@/components/stats/StatsOverview";
import ReportList from "@/components/reports/ReportList";
import AreaSafetyMap from "@/components/map/AreaSafetyMap";
import { useQuery } from "@tanstack/react-query";
import { CrimeReport } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "wouter";

export default function UserDashboard() {
  const { user, isLoading } = useRequireAuth();
  
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
    <UserLayout>
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-primary to-primary-dark rounded-lg shadow-md p-6 mb-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.fullName}</h2>
            <p className="mb-4 md:mb-0">Thank you for helping keep our community safe.</p>
          </div>
          <Link href="/report">
            <Button className="bg-white text-primary font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition flex items-center">
              <Plus className="mr-2 h-5 w-5" />
              New Report
            </Button>
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <StatsOverview userRole="civilian" />
      
      {/* Recent Reports & Map Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <ReportList 
            limit={3} 
            showAll={true} 
            filterRole="civilian"
          />
        </div>
        
        {/* Area Safety Map */}
        <div>
          <AreaSafetyMap />
        </div>
      </div>
    </UserLayout>
  );
}
