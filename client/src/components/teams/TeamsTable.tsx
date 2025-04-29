import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Team, CrimeReport } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function TeamsTable() {
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [selectedReport, setSelectedReport] = useState<CrimeReport | null>(null);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  // Fetch teams
  const {
    data: teams,
    isLoading: isLoadingTeams,
    error: teamsError,
  } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Fetch reports for assignment
  const {
    data: reports,
    isLoading: isLoadingReports,
    error: reportsError,
  } = useQuery<CrimeReport[]>({
    queryKey: ["/api/reports"],
  });

  // Mutation for updating team status
  const updateTeamStatus = useMutation({
    mutationFn: async ({
      teamId,
      status,
    }: {
      teamId: number;
      status: string;
    }) => {
      const response = await apiRequest("PATCH", `/api/teams/${teamId}/status`, {
        status,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      toast({
        title: "Team status updated",
        description: "The team status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to update team status",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Mutation for assigning team to a report
  const assignTeam = useMutation({
    mutationFn: async ({
      reportId,
      teamId,
    }: {
      reportId: number;
      teamId: number;
    }) => {
      const response = await apiRequest("PATCH", `/api/reports/${reportId}/team`, {
        teamId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setIsAssignDialogOpen(false);
      toast({
        title: "Team assigned",
        description: "The team has been assigned to the report successfully.",
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

  // Handle team assignment
  const handleAssignTeam = () => {
    if (selectedTeam && selectedReport) {
      assignTeam.mutate({
        reportId: selectedReport.id,
        teamId: selectedTeam.id,
      });
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    switch (status) {
      case "available":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
            Available
          </Badge>
        );
      case "assigned":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Assigned
          </Badge>
        );
      case "on_scene":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
            On Scene
          </Badge>
        );
      case "en_route":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
            En Route
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
            {status}
          </Badge>
        );
    }
  };

  // Get available reports (pending or without team assigned)
  const availableReports = reports
    ? reports.filter(
        (report) =>
          report.status === "pending" || !report.assignedTeam
      )
    : [];

  // Get team's assigned report
  const getAssignedReport = (teamId: number) => {
    return reports?.find((report) => report.assignedTeam === teamId);
  };

  // Loading state
  if (isLoadingTeams) {
    return (
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (teamsError) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-red-500">Failed to load teams. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <CardTitle className="text-lg font-medium text-gray-900">Active Teams</CardTitle>
        <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-sm bg-police text-white px-3 py-1 rounded hover:bg-police-dark transition">
              <svg
                className="w-4 h-4 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Assign Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Assign Team to Report</DialogTitle>
              <DialogDescription>
                Select a team and a report to assign them to each other.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="team" className="text-right">
                  Team
                </label>
                <Select
                  onValueChange={(value) => {
                    const team = teams?.find((t) => t.id === parseInt(value));
                    setSelectedTeam(team || null);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams?.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name} ({team.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="report" className="text-right">
                  Report
                </label>
                <Select
                  onValueChange={(value) => {
                    const report = reports?.find(
                      (r) => r.id === parseInt(value)
                    );
                    setSelectedReport(report || null);
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select report" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableReports.map((report) => (
                      <SelectItem key={report.id} value={report.id.toString()}>
                        #{report.id} - {report.crimeType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button
                onClick={handleAssignTeam}
                disabled={!selectedTeam || !selectedReport || assignTeam.isPending}
              >
                {assignTeam.isPending ? "Assigning..." : "Assign Team"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Team</TableHead>
              <TableHead>Members</TableHead>
              <TableHead>Assigned Case</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams?.map((team) => {
              const assignedReport = getAssignedReport(team.id);
              
              return (
                <TableRow key={team.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-police text-white rounded-full flex items-center justify-center">
                        <span className="font-semibold">
                          {team.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {team.name}
                        </div>
                        <div className="text-sm text-gray-500">{team.type}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex -space-x-2">
                      {team.members.slice(0, 3).map((member: any, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-white">
                          <AvatarFallback>
                            {member.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {team.members.length > 3 && (
                        <div className="h-6 w-6 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center">
                          <span className="text-xs text-gray-500">
                            +{team.members.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {assignedReport ? (
                      <div>
                        <div className="text-gray-900 font-medium">
                          #{assignedReport.id} {assignedReport.crimeType}
                        </div>
                        <div className="text-gray-500 text-sm">
                          Reported{" "}
                          {new Date(assignedReport.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <span className="text-gray-500">No case assigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {assignedReport ? (
                      <div className="flex items-center">
                        <svg
                          className="w-4 h-4 text-secondary mr-1.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {assignedReport.location}
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>{formatStatus(team.status)}</TableCell>
                  <TableCell>
                    <Select
                      defaultValue={team.status}
                      onValueChange={(value) => {
                        updateTeamStatus.mutate({
                          teamId: team.id,
                          status: value,
                        });
                      }}
                      disabled={updateTeamStatus.isPending}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue placeholder="Update status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="assigned">Assigned</SelectItem>
                        <SelectItem value="en_route">En Route</SelectItem>
                        <SelectItem value="on_scene">On Scene</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>

      <CardFooter className="bg-gray-50 px-6 py-3 border-t border-gray-200">
        <a href="#" className="text-primary text-sm font-medium">
          View All Teams
        </a>
      </CardFooter>
    </Card>
  );
}
