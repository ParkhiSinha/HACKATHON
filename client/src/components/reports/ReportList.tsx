import { useState } from "react";
import { CrimeReport } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import ReportListItem from "./ReportListItem";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportListProps {
  limit?: number;
  showAll?: boolean;
  showHeader?: boolean;
  title?: string;
  filterRole?: "civilian" | "police";
  onReportClick?: (report: CrimeReport) => void;
}

export default function ReportList({
  limit,
  showAll = false,
  showHeader = true,
  title = "Recent Reports",
  filterRole = "civilian",
  onReportClick,
}: ReportListProps) {
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  // Fetch crime reports
  const { data: reports, isLoading } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
  });

  // Filter reports based on search and filter criteria
  const filteredReports = reports
    ? reports
        .filter((report) => {
          // Filter by status if not "all"
          if (filter !== "all" && report.status !== filter) {
            return false;
          }
          
          // Search in crime type or description
          if (search && search.trim() !== "") {
            const searchLower = search.toLowerCase();
            return (
              report.crimeType.toLowerCase().includes(searchLower) ||
              report.description.toLowerCase().includes(searchLower) ||
              report.location.toLowerCase().includes(searchLower)
            );
          }
          
          return true;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
    : [];

  // Limit the number of reports if specified
  const displayReports = limit ? filteredReports.slice(0, limit) : filteredReports;

  return (
    <Card>
      {showHeader && (
        <CardHeader className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
          <CardTitle className="font-semibold text-gray-800">{title}</CardTitle>
          {filterRole === "police" && (
            <div className="flex gap-2">
              <Input
                placeholder="Search reports..."
                className="max-w-xs"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Select
                value={filter}
                onValueChange={(value) => setFilter(value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reports</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </CardHeader>
      )}

      <CardContent className="p-0">
        {isLoading ? (
          <div className="divide-y divide-gray-100">
            {[...Array(limit || 3)].map((_, i) => (
              <div key={i} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start">
                  <Skeleton className="h-12 w-12 rounded-lg mr-4" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : displayReports.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {displayReports.map((report) => (
              <ReportListItem 
                key={report.id} 
                report={report} 
                onClick={() => onReportClick && onReportClick(report)} 
              />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center">
            <p className="text-gray-500">No reports found</p>
          </div>
        )}
      </CardContent>

      {showAll && reports && reports.length > 0 && (
        <CardFooter className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <a href="#" className="text-primary text-sm font-medium">
            View all
          </a>
        </CardFooter>
      )}
    </Card>
  );
}
