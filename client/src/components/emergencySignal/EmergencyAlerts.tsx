import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { EmergencySignal } from '@shared/schema';
import { User } from '@shared/schema';

interface EmergencySignalWithUser extends EmergencySignal {
  user: {
    id: number;
    fullName: string;
  };
}

const EmergencyAlerts = () => {
  const { data: activeSignals, isLoading, error } = useQuery<EmergencySignalWithUser[]>({
    queryKey: ['/api/emergency'],
    refetchInterval: 10000, // Refetch every 10 seconds
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Unable to load emergency signals. Please refresh the page.
        </AlertDescription>
      </Alert>
    );
  }

  if (!activeSignals || activeSignals.length === 0) {
    return null;
  }

  return (
    <div className="bg-red-50 border-l-4 border-secondary rounded-md p-4 mb-8">
      <div className="flex">
        <div className="flex-shrink-0">
          <AlertTriangle className="h-5 w-5 text-secondary" />
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-secondary">
            Emergency Signals Active ({activeSignals.length})
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
              {activeSignals.map((signal) => (
                <div key={signal.id} className="bg-white p-3 rounded shadow-sm flex items-center">
                  <div className="pulse bg-secondary rounded-full w-3 h-3 mr-3"></div>
                  <div>
                    <p className="font-medium">{signal.user.fullName}</p>
                    <p className="text-xs text-gray-500">
                      {getLocationText(signal.latitude, signal.longitude)} • {getTimeAgo(new Date(signal.createdAt))}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper function to format location
const getLocationText = (latitude: string, longitude: string): string => {
  // In a real app, we would use reverse geocoding to get the address
  return `${parseFloat(latitude).toFixed(4)}, ${parseFloat(longitude).toFixed(4)}`;
};

// Helper function to format time ago
const getTimeAgo = (date: Date): string => {
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) {
    return `${seconds} sec ago`;
  }
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min ago`;
  }
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hours ago`;
  }
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

export default EmergencyAlerts;
