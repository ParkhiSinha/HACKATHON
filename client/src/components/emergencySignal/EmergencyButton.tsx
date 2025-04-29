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
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-25"></div>
        <Button
          onClick={() => setIsOpen(true)}
          className="emergency-button relative bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-6 rounded-full font-bold flex items-center shadow-lg hover:from-red-700 hover:to-red-800 transition-all"
        >
          <AlertTriangle className="mr-2 h-5 w-5" />
          <span className="text-lg">EMERGENCY</span>
        </Button>
      </div>
      
      <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600 text-xl font-bold">Emergency Assistance</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                This will send an emergency alert with your location to the nearest Bengaluru Police Station. 
                Only use in case of genuine emergency situations.
              </p>
              <p className="text-sm text-gray-600 italic">
                Your report will be received by Karnataka State Police and appropriate action will be taken based on the nature of emergency.
              </p>
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center mb-3">
                  <div className="bg-red-100 rounded-full p-2 mr-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-red-800">India Emergency Services</p>
                    <p className="text-sm text-red-700">
                      Please call directly for immediate assistance
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <Button 
                    size="sm" 
                    variant="destructive"
                    className="text-white w-full flex justify-center"
                    onClick={() => window.location.href = "tel:112"}
                  >
                    <span className="mr-2 font-bold">112</span> Emergency Helpline
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = "tel:100"}
                    className="text-red-800 border-red-300 w-full flex justify-center"
                  >
                    <span className="mr-2 font-bold">100</span> Police
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = "tel:101"}
                    className="text-orange-700 border-orange-300 bg-orange-50 w-full flex justify-center"
                  >
                    <span className="mr-2 font-bold">101</span> Fire
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => window.location.href = "tel:108"}
                    className="text-green-800 border-green-300 bg-green-50 w-full flex justify-center"
                  >
                    <span className="mr-2 font-bold">108</span> Ambulance
                  </Button>
                </div>
                
                <div className="text-xs text-center text-gray-500 mt-1">
                  <p>For Bengaluru City Police Control Room: <span className="font-medium">080-2294-3322</span></p>
                  <p className="mt-1">Women Helpline: <span className="font-medium">1091</span> | Senior Citizen Helpline: <span className="font-medium">14567</span></p>
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
