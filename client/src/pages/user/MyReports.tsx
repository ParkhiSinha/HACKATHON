import { useState } from "react";
import { useRequireAuth } from "@/lib/auth";
import UserLayout from "@/components/layout/UserLayout";
import ReportList from "@/components/reports/ReportList";
import { CrimeReport } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function MyReports() {
  const { isLoading: authLoading } = useRequireAuth();
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: reports, isLoading } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
  });

  const handleReportClick = (report: CrimeReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-status-warning border-yellow-200">
            Pending
          </Badge>
        );
      case "in_progress":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200">
            In Progress
          </Badge>
        );
      case "resolved":
        return (
          <Badge variant="outline" className="bg-green-100 text-status-success border-green-200">
            Resolved
          </Badge>
        );
      default:
        return null;
    }
  };

  if (authLoading || isLoading) {
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
    <UserLayout title="My Reports">
      <ReportList
        showHeader={true}
        title="My Reports"
        filterRole="civilian"
        onReportClick={handleReportClick}
      />

      {/* Report Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold flex items-center justify-between">
                  {selectedReport.crimeType}
                  {getStatusBadge(selectedReport.status)}
                </DialogTitle>
                <DialogDescription>
                  Report #{selectedReport.id} - Submitted on{" "}
                  {formatDate(selectedReport.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 my-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-2 text-gray-500">Incident Details</h3>
                    <p className="text-gray-900">{selectedReport.description}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-2 text-gray-500">Location</h3>
                    <p className="text-gray-900">{selectedReport.location}</p>
                    <div className="text-xs text-gray-500 mt-1">
                      Coordinates: {selectedReport.latitude}, {selectedReport.longitude}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-2 text-gray-500">Incident Date & Time</h3>
                    <p className="text-gray-900">{formatDate(selectedReport.date)}</p>
                  </CardContent>
                </Card>

                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                  <Card>
                    <CardContent className="p-4">
                      <h3 className="font-medium text-sm mb-2 text-gray-500">Submitted Evidence</h3>
                      <ul className="list-disc pl-5 text-gray-900">
                        {(selectedReport.evidence as string[]).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium text-sm mb-2 text-gray-500">Current Status</h3>
                    <div className="flex items-center">
                      {getStatusBadge(selectedReport.status)}
                      <span className="ml-2 text-gray-600">
                        {selectedReport.status === "pending"
                          ? "Waiting for review"
                          : selectedReport.status === "in_progress"
                          ? "Being investigated"
                          : "Case closed"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      Last updated: {formatDate(selectedReport.updatedAt)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </UserLayout>
  );
}
