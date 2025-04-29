import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const EmergencyButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleEmergencySignal = async () => {
    if (navigator.geolocation) {
      setIsSubmitting(true);
      
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            await apiRequest("POST", "/api/emergency", {
              latitude: latitude.toString(),
              longitude: longitude.toString(),
              active: true
            });
            
            toast({
              title: "Emergency signal sent",
              description: "Help is on the way. Stay safe.",
              variant: "destructive",
            });
            
            setIsOpen(false);
          } catch (error) {
            toast({
              title: "Failed to send emergency signal",
              description: "Please try again or call emergency services directly.",
              variant: "destructive",
            });
          } finally {
            setIsSubmitting(false);
          }
        },
        (error) => {
          toast({
            title: "Location error",
            description: "Unable to get your location. Please enable location services.",
            variant: "destructive",
          });
          setIsSubmitting(false);
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your device doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="emergency-button bg-secondary text-white px-4 py-2 rounded-full font-medium flex items-center shadow-lg hover:bg-secondary-dark transition pulse"
      >
        <AlertTriangle className="mr-2 h-4 w-4" />
        Emergency
      </Button>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-secondary">Emergency Signal</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will send an emergency alert with your location to law enforcement. 
                Only use in case of immediate danger.
              </p>
              <div className="flex items-center mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="bg-red-100 rounded-full p-2 mr-3">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">India Emergency Number: 112</p>
                  <p className="text-sm text-red-700">
                    Please call 112 directly for immediate assistance
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="text-white"
                      onClick={() => window.location.href = "tel:112"}
                    >
                      Call 112 Now
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => window.location.href = "tel:100"}
                      className="text-red-800 border-red-300"
                    >
                      Police (100)
                    </Button>
                  </div>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleEmergencySignal}
              disabled={isSubmitting}
              className="bg-secondary hover:bg-secondary-dark"
            >
              {isSubmitting ? "Sending..." : "Send Emergency Signal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EmergencyButton;
