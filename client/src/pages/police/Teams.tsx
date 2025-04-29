import { useState } from "react";
import { useRequirePolice } from "@/lib/auth";
import PoliceLayout from "@/components/layout/PoliceLayout";
import TeamsTable from "@/components/teams/TeamsTable";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Team } from "@shared/schema";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// Schema for team creation
const createTeamSchema = z.object({
  name: z.string().min(3, "Team name must be at least 3 characters"),
  type: z.string().min(1, "Team type is required"),
  members: z.array(z.object({
    id: z.number(),
    name: z.string(),
  })).min(1, "At least one member is required"),
  status: z.string().min(1, "Status is required"),
});

type CreateTeamValues = z.infer<typeof createTeamSchema>;

export default function TeamsPage() {
  const { isLoading: authLoading } = useRequirePolice();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Mock team member data (in a real app, this would be fetched from API)
  const availableMembers = [
    { id: 2, name: "Officer Johnson" },
    { id: 3, name: "Officer Smith" },
    { id: 4, name: "Officer Davis" },
    { id: 5, name: "Officer Rodriguez" },
    { id: 6, name: "Officer Chen" },
  ];

  // Fetch teams
  const { data: teams, isLoading: teamsLoading } = useQuery<Team[]>({
    queryKey: ["/api/teams"],
  });

  // Form for creating a new team
  const form = useForm<CreateTeamValues>({
    resolver: zodResolver(createTeamSchema),
    defaultValues: {
      name: "",
      type: "",
      members: [],
      status: "available",
    },
  });

  // Mutation for creating a new team
  const createTeam = useMutation({
    mutationFn: async (teamData: CreateTeamValues) => {
      const response = await apiRequest("POST", "/api/teams", teamData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teams"] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Team created",
        description: "The team has been created successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Failed to create team",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: CreateTeamValues) => {
    createTeam.mutate(values);
  };

  // Handle member selection
  const handleMemberSelection = (memberId: number) => {
    const member = availableMembers.find((m) => m.id === memberId);
    if (!member) return;

    const currentMembers = form.getValues("members") || [];
    
    // Check if member is already selected
    if (currentMembers.some((m) => m.id === memberId)) {
      // Remove member if already selected
      const updatedMembers = currentMembers.filter((m) => m.id !== memberId);
      form.setValue("members", updatedMembers);
    } else {
      // Add member if not already selected
      form.setValue("members", [...currentMembers, member]);
    }
  };

  // Show loading state
  if (authLoading || teamsLoading) {
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
    <PoliceLayout title="Team Management">
      <div className="mb-6 flex justify-end">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-police hover:bg-police-dark">
              <svg
                className="w-5 h-5 mr-2"
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
              Create New Team
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Team</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new team
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter team name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select team type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Patrol Unit">Patrol Unit</SelectItem>
                          <SelectItem value="Investigation Unit">Investigation Unit</SelectItem>
                          <SelectItem value="Rapid Response">Rapid Response</SelectItem>
                          <SelectItem value="Special Operations">Special Operations</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Initial Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select initial status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="en_route">En Route</SelectItem>
                          <SelectItem value="on_scene">On Scene</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="members"
                  render={() => (
                    <FormItem>
                      <FormLabel>Team Members</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        {availableMembers.map((member) => {
                          const isSelected = form.getValues("members").some(
                            (m) => m.id === member.id
                          );
                          
                          return (
                            <div 
                              key={member.id}
                              className={`p-2 border rounded cursor-pointer ${
                                isSelected ? "border-primary bg-primary/10" : "border-gray-200"
                              }`}
                              onClick={() => handleMemberSelection(member.id)}
                            >
                              <div className="flex items-center">
                                <div className={`w-4 h-4 rounded-full mr-2 ${
                                  isSelected ? "bg-primary" : "bg-gray-200"
                                }`}>
                                  {isSelected && (
                                    <svg
                                      className="w-4 h-4 text-white"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <span className="text-sm">{member.name}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createTeam.isPending}
                  >
                    {createTeam.isPending ? "Creating..." : "Create Team"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-3">
          <TeamsTable />
        </Card>
      </div>
    </PoliceLayout>
  );
}
