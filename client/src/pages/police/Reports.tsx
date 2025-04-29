import { useState } from "react";
import { useRequirePolice } from "@/lib/auth";
import PoliceLayout from "@/components/layout/PoliceLayout";
import { CrimeReport, Team } from "@shared/schema";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function Reports() {
  const { isLoading: authLoading } = useRequirePolice();
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  
  const { toast } = useToast();

  // Fetch reports
  const { data: reports, isLoading: reportsLoading } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
  });

  // Fetch teams for assignment
  const { data: teams } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Mutation for updating report status
  const updateStatus = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/reports/${reportId}/status`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Status updated",
        description: "The report status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update status",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Mutation for assigning team
  const assignTeam = useMutation({
    mutationFn: async ({ reportId, teamId }: { reportId: number; teamId: number }) => {
      const response = await apiRequest("PATCH", `/api/reports/${reportId}/team`, {
        teamId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      toast({
        title: "Team assigned",
        description: "A team has been assigned to this report.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to assign team",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Filter reports based on status and search
  const filteredReports = reports
    ? reports.filter((report) => {
        // Filter by status
        if (statusFilter !== "all" && report.status !== statusFilter) {
          return false;
        }

        // Search in crime type, description or location
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
    : [];

  // Handle report row click
  const handleReportClick = (report: CrimeReport) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Loading state
  if (authLoading || reportsLoading) {
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
    <PoliceLayout title="Crime Reports">
      <Card className="mb-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>All Crime Reports</CardTitle>
          <div className="flex gap-2">
            <Input
              placeholder="Search reports..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
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
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date Reported</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Assigned Team</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow
                  key={report.id}
                  className="cursor-pointer hover:bg-gray-50"
                  onClick={() => handleReportClick(report)}
                >
                  <TableCell className="font-medium">#{report.id}</TableCell>
                  <TableCell>{report.crimeType}</TableCell>
                  <TableCell>{formatDate(report.createdAt)}</TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`${
                        report.status === "pending"
                          ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                          : report.status === "in_progress"
                          ? "bg-blue-100 text-blue-800 border-blue-200"
                          : "bg-green-100 text-green-800 border-green-200"
                      }`}
                    >
                      {report.status === "pending"
                        ? "Pending"
                        : report.status === "in_progress"
                        ? "In Progress"
                        : "Resolved"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {report.assignedTeam
                      ? teams?.find((team) => team.id === report.assignedTeam)?.name || "Unknown Team"
                      : "None"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredReports.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No reports found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle>
                  {selectedReport.crimeType} (Report #{selectedReport.id})
                </DialogTitle>
                <DialogDescription>
                  Reported on {formatDate(selectedReport.createdAt)}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-start gap-4">
                  <label className="text-right font-medium">Description:</label>
                  <div className="col-span-3">
                    <p className="text-sm">{selectedReport.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Location:</label>
                  <div className="col-span-3">
                    <p className="text-sm">{selectedReport.location}</p>
                    <p className="text-xs text-gray-500">
                      Coordinates: {selectedReport.latitude}, {selectedReport.longitude}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Incident Date:</label>
                  <div className="col-span-3">
                    <p className="text-sm">{formatDate(selectedReport.date)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Status:</label>
                  <div className="col-span-3">
                    <Select
                      defaultValue={selectedReport.status}
                      onValueChange={(value) => {
                        updateStatus.mutate({
                          reportId: selectedReport.id,
                          status: value,
                        });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="resolved">Resolved</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Assign Team:</label>
                  <div className="col-span-3">
                    <Select
                      defaultValue={selectedReport.assignedTeam?.toString() || ""}
                      onValueChange={(value) => {
                        if (value) {
                          assignTeam.mutate({
                            reportId: selectedReport.id,
                            teamId: parseInt(value),
                          });
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {teams?.map((team) => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name} ({team.status})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {selectedReport.evidence && selectedReport.evidence.length > 0 && (
                  <div className="grid grid-cols-4 items-start gap-4">
                    <label className="text-right font-medium">Evidence:</label>
                    <div className="col-span-3">
                      <ul className="list-disc pl-5 text-sm">
                        {(selectedReport.evidence as string[]).map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button
                  onClick={() => setIsDialogOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </PoliceLayout>
  );
}
