import { useRef, useState, useEffect } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMap } from "@/lib/map";
import { useToast } from "@/hooks/use-toast";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { insertCrimeReportSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";

// Extend the schema with form validation
const reportFormSchema = insertCrimeReportSchema
  .extend({
    date: z.string().min(1, "Date is required"),
  })
  .refine((data) => {
    const date = new Date(data.date);
    return !isNaN(date.getTime());
  }, {
    message: "Invalid date format",
    path: ["date"],
  });

type ReportFormValues = z.infer<typeof reportFormSchema>;

export default function ReportForm() {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: string;
    longitude: string;
    locationText: string;
  }>({
    latitude: "",
    longitude: "",
    locationText: "",
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const { toast } = useToast();
  const mapContainerId = "report-location-map";

  // Initialize form with default values
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportFormSchema),
    defaultValues: {
      crimeType: "",
      description: "",
      location: "",
      latitude: "",
      longitude: "",
      date: new Date().toISOString().slice(0, 16), // Format: YYYY-MM-DDThh:mm
      status: "pending",
      evidence: [],
    },
  });

  // Initialize map
  const { setupLocationSelect } = useMap(mapContainerId);

  // Check for draft and setup map location selection
  useEffect(() => {
    // Check for a saved draft in localStorage
    const savedDraft = localStorage.getItem('reportDraft');
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        
        // Restore form values from draft
        if (draftData.crimeType) form.setValue("crimeType", draftData.crimeType);
        if (draftData.date) form.setValue("date", draftData.date);
        if (draftData.description) form.setValue("description", draftData.description);
        
        // Restore location data
        if (draftData.latitude && draftData.longitude) {
          form.setValue("latitude", draftData.latitude);
          form.setValue("longitude", draftData.longitude);
          if (draftData.location) form.setValue("location", draftData.location);
          
          setSelectedLocation({
            latitude: draftData.latitude,
            longitude: draftData.longitude,
            locationText: draftData.locationText || `${draftData.latitude}, ${draftData.longitude}`
          });
        }
        
        // Restore uploaded files
        if (draftData.uploadedFiles && Array.isArray(draftData.uploadedFiles)) {
          setUploadedFiles(draftData.uploadedFiles);
          form.setValue("evidence", draftData.uploadedFiles);
        }
        
        toast({
          title: "Draft loaded",
          description: "Your saved draft has been loaded.",
        });
      } catch (error) {
        console.error("Error loading draft:", error);
      }
    }
    
    const cleanup = setupLocationSelect((lat, lng) => {
      // Update the form with the selected coordinates
      setSelectedLocation({
        latitude: lat.toString(),
        longitude: lng.toString(),
        locationText: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      });

      form.setValue("latitude", lat.toString());
      form.setValue("longitude", lng.toString());
      form.setValue("location", `Selected location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    });

    return cleanup;
  }, [setupLocationSelect, form]);

 

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // In a real app, we would upload the files to a server
    // For this demo, we'll just simulate the upload
    setTimeout(() => {
      const fileUrls = Array.from(files).map(
        (file) => `uploaded_${file.name}`
      );
      setUploadedFiles((prev) => [...prev, ...fileUrls]);
      
      // Update form with evidence
      const currentValues = form.getValues();
      const currentEvidence = Array.isArray(currentValues.evidence) ? currentValues.evidence : [];
      form.setValue("evidence", [...currentEvidence, ...fileUrls]);
      
      setIsUploading(false);
      
      toast({
        title: "Files uploaded",
        description: `${files.length} file(s) uploaded successfully.`,
      });
    }, 1000);
  };

  // Handle form submission
  const onSubmit = async (values: ReportFormValues) => {
    try {
      // Validate required fields
      if (!values.crimeType) {
        toast({
          title: "Missing information",
          description: "Please select an incident type.",
          variant: "destructive",
        });
        return;
      }

      if (!values.description) {
        toast({
          title: "Missing information",
          description: "Please provide a description of the incident.",
          variant: "destructive",
        });
        return;
      }
      
      if (!values.latitude || !values.longitude) {
        toast({
          title: "Missing information",
          description: "Please select a location on the map.",
          variant: "destructive",
        });
        return;
      }

      // Format the date to ISO string
      const formattedValues = {
        ...values,
        date: new Date(values.date).toISOString(),
      };

      console.log("Submitting report:", formattedValues);
      await apiRequest("POST", "/api/reports", formattedValues);
      
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      
      toast({
        title: "Report submitted",
        description: "Your report has been submitted successfully.",
      });
      
      // Reset the form
      form.reset();
      setSelectedLocation({
        latitude: "",
        longitude: "",
        locationText: "",
      });
      setUploadedFiles([]);
      
    } catch (error) {
      console.error("Error submitting report:", error);
      toast({
        title: "Failed to submit report",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Handle save as draft
  const saveDraft = () => {
    try {
      const currentValues = form.getValues();
      // Store draft in localStorage
      localStorage.setItem('reportDraft', JSON.stringify({
        ...currentValues,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
        locationText: selectedLocation.locationText,
        uploadedFiles
      }));
      
      toast({
        title: "Draft saved",
        description: "Your report has been saved as a draft.",
      });
    } catch (error) {
      console.error("Error saving draft:", error);
      toast({
        title: "Failed to save draft",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };
  
  // Clear saved draft
  const clearDraft = () => {
    try {
      localStorage.removeItem('reportDraft');
      
      // Reset the form
      form.reset({
        crimeType: "",
        description: "",
        location: "",
        latitude: "",
        longitude: "",
        date: new Date().toISOString().slice(0, 16),
        status: "pending",
        evidence: [],
      });
      
      setSelectedLocation({
        latitude: "",
        longitude: "",
        locationText: "",
      });
      
      setUploadedFiles([]);
      
      toast({
        title: "Draft cleared",
        description: "Your saved draft has been cleared.",
      });
    } catch (error) {
      console.error("Error clearing draft:", error);
      toast({
        title: "Failed to clear draft",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  // Check if there's a saved draft in localStorage
  const hasSavedDraft = localStorage.getItem('reportDraft') !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report an Incident</CardTitle>
        {hasSavedDraft && (
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">Draft Available</h4>
              <p className="text-xs text-blue-600">
                You have a previously saved draft that has been loaded. You can continue editing or clear it using the buttons below.
              </p>
            </div>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <div
                    id={mapContainerId}
                    className="map-container rounded-lg overflow-hidden mb-2 h-60"
                  ></div>
                  <div className="flex space-x-2">
                    <FormControl className="flex-1">
                      <Input
                        placeholder="Search for address or click on the map to select location"
                        {...field}
                        value={
                          selectedLocation.locationText || field.value
                        }
                      />
                    </FormControl>
                    {selectedLocation.latitude && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        className="bg-slate-50 text-slate-700 border-slate-200"
                        onClick={() => {
                          setSelectedLocation({
                            latitude: "",
                            longitude: "",
                            locationText: "",
                          });
                          form.setValue("latitude", "");
                          form.setValue("longitude", "");
                          form.setValue("location", "");
                        }}
                      >
                        Clear Location
                      </Button>
                    )}
                  </div>
                  <FormDescription>
                    Click on the map to select the incident location in Bengaluru
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <FormField
                control={form.control}
                name="crimeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Incident Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select incident type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Theft">Theft (चोरी / ಕಳ್ಳತನ)</SelectItem>
                        <SelectItem value="Vehicle Theft">
                          Vehicle Theft (वाहन चोरी / ವಾಹನ ಕಳ್ಳತನ)
                        </SelectItem>
                        <SelectItem value="Break-in">Break-in (सेंध / ಮನೆಯೊಳಗೆ ನುಗ್ಗುವಿಕೆ)</SelectItem>
                        <SelectItem value="Chain Snatching">Chain Snatching (चेन स्नैचिंग / ಚೈನ್ ಕದಿಯುವಿಕೆ)</SelectItem>
                        <SelectItem value="Mobile Phone Theft">
                          Mobile Phone Theft (मोबाइल चोरी / ಮೊಬೈಲ್ ಕಳ್ಳತನ)
                        </SelectItem>
                        <SelectItem value="Vandalism">Vandalism (तोड़फोड़ / ಸ್ವತ್ತಿಗೆ ಹಾನಿ)</SelectItem>
                        <SelectItem value="Eve Teasing">Eve Teasing (छेड़छाड़ / ಕಿರುಕುಳ)</SelectItem>
                        <SelectItem value="Traffic Violation">Traffic Violation (यातायात उल्लंघन / ಸಂಚಾರ ನಿಯಮ ಉಲ್ಲಂಘನೆ)</SelectItem>
                        <SelectItem value="Cyber Crime">Cyber Crime (साइबर अपराध / ಸೈಬರ್ ಅಪರಾಧ)</SelectItem>
                        <SelectItem value="Suspicious Activity">
                          Suspicious Activity (संदिग्ध गतिविधि / ಅನುಮಾನಾಸ್ಪದ ಚಟುವಟಿಕೆ)
                        </SelectItem>
                        <SelectItem value="Other">Other (अन्य / ಇತರೆ)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date & Time</FormLabel>
                    <FormControl>
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide details about the incident..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Evidence Upload</FormLabel>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <svg
                  className="w-8 h-8 text-gray-400 mx-auto mb-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-gray-500 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-gray-400">
                  Supports JPG, PNG, MP4 (Max: 20MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  id="file-upload"
                  onChange={handleFileUpload}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => document.getElementById("file-upload")?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? "Uploading..." : "Select Files"}
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Uploaded Files ({uploadedFiles.length})
                  </h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="flex items-center">
                        <svg
                          className="w-4 h-4 text-green-500 mr-2"
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
                        {file.split("_")[1]}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex flex-wrap justify-end space-x-4">
              <div className="flex space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={clearDraft}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  Clear Draft
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={saveDraft}
                  className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                >
                  Save as Draft
                </Button>
              </div>
              <Button 
                type="submit" 
                disabled={form.formState.isSubmitting}
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                {form.formState.isSubmitting
                  ? "Submitting..."
                  : "Submit Report"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
