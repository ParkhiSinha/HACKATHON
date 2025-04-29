import { useQuery } from "@tanstack/react-query";
import { CrimeReport } from "@shared/schema";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUp, ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface StatCardProps {
  title: string;
  value: number | string;
  subtext?: string;
  badge?: string;
  badgeColor?: string;
  icon?: React.ReactNode;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
}

interface StatsOverviewProps {
  userRole: "civilian" | "police";
}

export default function StatsOverview({ userRole }: StatsOverviewProps) {
  const { data: reports, isLoading } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
  });

  // Calculate statistics
  const calculateStats = () => {
    if (!reports) return null;

    // For civilian
    if (userRole === "civilian") {
      const totalReports = reports.length;
      const inProgressReports = reports.filter(
        (report) => report.status === "in_progress"
      ).length;
      const resolvedReports = reports.filter(
        (report) => report.status === "resolved"
      ).length;

      // Calculate monthly trend (simplified for demo)
      const currentMonth = new Date().getMonth();
      const reportsThisMonth = reports.filter(
        (report) => new Date(report.createdAt).getMonth() === currentMonth
      ).length;

      return {
        totalReports,
        inProgressReports,
        resolvedReports,
        reportsThisMonth,
      };
    } 
    // For police
    else {
      const totalReports = reports.length;
      const pendingReports = reports.filter(
        (report) => report.status === "pending"
      ).length;
      const inProgressReports = reports.filter(
        (report) => report.status === "in_progress"
      ).length;
      const resolvedReports = reports.filter(
        (report) => report.status === "resolved"
      ).length;

      // Calculate trends (simplified for demo)
      const increaseTrend = "12%"; // In a real app this would be calculated

      return {
        totalReports,
        pendingReports,
        inProgressReports,
        resolvedReports,
        increaseTrend,
      };
    }
  };

  const stats = calculateStats();

  // Render loading state
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(userRole === "civilian" ? 3 : 4)].map((_, i) => (
          <Card key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <CardContent className="p-0">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-8 w-12 mb-1" />
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If no stats or reports, return null
  if (!stats) return null;

  // StatCard component for reuse
  const StatCard = ({
    title,
    value,
    subtext,
    badge,
    badgeColor = "bg-blue-100 text-primary",
    icon,
    trend,
    trendValue,
  }: StatCardProps) => (
    <Card className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
      <CardContent className="p-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium text-gray-700">{title}</h3>
          {badge && (
            <span className={`${badgeColor} text-xs px-2 py-1 rounded-full`}>
              {badge}
            </span>
          )}
        </div>
        <p className="text-3xl font-bold text-gray-800 mb-1">{value}</p>
        {subtext && (
          <div className="flex items-center text-sm text-gray-500">
            {trend === "up" && (
              <span className="text-status-success font-medium flex items-center">
                <ArrowUp className="h-3 w-3 mr-1" />
                {trendValue}
              </span>
            )}
            {trend === "neutral" && (
              <span className="font-medium flex items-center">
                <ArrowRight className="h-3 w-3 mr-1 text-gray-400" />
                {trendValue}
              </span>
            )}
            {subtext}
          </div>
        )}
      </CardContent>
    </Card>
  );

  // For civilian users
  if (userRole === "civilian") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Your Reports"
          value={stats.totalReports}
          badge="All time"
          subtext={`${stats.reportsThisMonth} this month`}
          trend="up"
          trendValue=""
        />
        <StatCard
          title="In Progress"
          value={stats.inProgressReports}
          badge="Active"
          badgeColor="bg-yellow-100 text-status-warning"
          subtext="Last update: 2 days ago"
          trend="neutral"
          trendValue=""
        />
        <StatCard
          title="Resolved"
          value={stats.resolvedReports}
          badge="Completed"
          badgeColor="bg-green-100 text-status-success"
          subtext="Last resolution: 1 week ago"
          trend="neutral"
          trendValue=""
        />
      </div>
    );
  }

  // For police users
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard
        title="New Reports"
        value={stats.totalReports}
        subtext={stats.increaseTrend}
        trend="up"
        trendValue=""
      />
      <StatCard
        title="Pending Cases"
        value={stats.pendingReports}
        subtext={stats.pendingReports > 0 ? "Requires attention" : "All caught up"}
        trend={stats.pendingReports > 0 ? "up" : "neutral"}
        trendValue=""
        badgeColor="bg-yellow-100 text-status-warning"
      />
      <StatCard
        title="In Progress"
        value={stats.inProgressReports}
        subtext="Being investigated"
        trend="neutral"
        trendValue=""
        badgeColor="bg-blue-100 text-blue-600"
      />
      <StatCard
        title="Resolved Cases"
        value={stats.resolvedReports}
        subtext="20% increase"
        trend="up"
        trendValue=""
        badgeColor="bg-green-100 text-status-success"
      />
    </div>
  );
}
