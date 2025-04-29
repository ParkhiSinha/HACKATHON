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
    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
      <div className="flex items-center mb-4">
        <div className="flex-shrink-0 bg-red-100 p-2 rounded-full">
          <AlertTriangle className="h-5 w-5 text-red-600" />
        </div>
        <div className="ml-3">
          <h3 className="text-base font-bold text-red-800">
            Emergency Signals Active ({activeSignals.length})
          </h3>
          <p className="text-sm text-red-600">
            Citizens requiring immediate police assistance in Bengaluru
          </p>
        </div>
        <div className="ml-auto flex items-center">
          <div className="animate-ping mr-2 h-2 w-2 rounded-full bg-red-500"></div>
          <div className="text-xs font-medium text-red-700">
            Live Updates
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activeSignals.map((signal) => (
          <div 
            key={signal.id} 
            className="bg-white border border-red-100 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center">
                <div className="relative mr-3">
                  <div className="absolute animate-ping h-4 w-4 rounded-full bg-red-200 opacity-75"></div>
                  <div className="relative rounded-full h-4 w-4 bg-red-500"></div>
                </div>
                <p className="font-bold text-gray-900">{signal.user.fullName}</p>
              </div>
              <div className="px-2 py-1 bg-red-100 rounded text-xs font-medium text-red-800">
                {getTimeAgo(new Date(signal.createdAt))}
              </div>
            </div>
            
            <div className="flex items-center mt-2 text-sm text-gray-600">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1 text-gray-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
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
              <span>
                {getLocationText(signal.latitude, signal.longitude)}
              </span>
            </div>
            
            <div className="mt-4 flex justify-end space-x-2">
              <button 
                onClick={() => window.location.href = `tel:${signal.user.id}`} 
                className="text-xs px-3 py-1 bg-blue-50 text-blue-700 rounded border border-blue-200"
              >
                Call Civilian
              </button>
              <button 
                onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${signal.latitude},${signal.longitude}`, '_blank')}
                className="text-xs px-3 py-1 bg-green-50 text-green-700 rounded border border-green-200"
              >
                Open in Maps
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-xs text-gray-500">
        <p>Emergency signals can be responded to by Karnataka State Police. For assistance, contact Bengaluru City Police Control Room: <span className="font-medium">080-2294-3322</span></p>
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
