import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useEffect, useState } from "react";
import NotFound from "@/pages/not-found";
import AuthScreen from "@/components/AuthScreen";
import Login from "@/pages/auth/Login";
import { useUser } from "@/lib/auth";

// User pages
import UserDashboard from "@/pages/user/Dashboard";
import ReportCrime from "@/pages/user/ReportCrime";
import MyReports from "@/pages/user/MyReports";

// Police pages
import PoliceDashboard from "@/pages/police/Dashboard";
import Reports from "@/pages/police/Reports";
import CrimeMap from "@/pages/police/CrimeMap";
import Teams from "@/pages/police/Teams";

// WebSocket connection for real-time updates
function useWebSocket() {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  useEffect(() => {
    // Create WebSocket connection
    let ws: WebSocket | null = null;
    
    const connectWebSocket = () => {
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        // Use the same port as the application is running on in Replit with the /ws path
        const wsUrl = `${protocol}//${host}/ws`;
        
        console.log(`Connecting to WebSocket at ${wsUrl}`);
        ws = new WebSocket(wsUrl);
        
        ws.onopen = () => {
          console.log('WebSocket connection established');
          setRetryCount(0); // Reset retry count on successful connection
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            console.log('WebSocket message received:', data);
            
            // Handle emergency signals
            if (data.type === 'EMERGENCY_SIGNAL') {
              queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
            }
            
            // Handle emergency resolution
            if (data.type === 'EMERGENCY_RESOLVED') {
              queryClient.invalidateQueries({ queryKey: ['/api/emergency'] });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };
        
        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };
        
        ws.onclose = (event) => {
          console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
          
          // Attempt to reconnect unless we've reached max retries
          if (retryCount < maxRetries) {
            console.log(`Attempting to reconnect (${retryCount + 1}/${maxRetries})...`);
            const timeout = Math.min(1000 * 2 ** retryCount, 10000); // Exponential backoff
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
              if (ws) {
                try {
                  ws.close();
                } catch (e) {
                  console.error('Error closing WebSocket:', e);
                }
              }
              connectWebSocket();
            }, timeout);
          } else {
            console.log('Max WebSocket reconnection attempts reached');
          }
        };
        
        setSocket(ws);
      } catch (error) {
        console.error('Error creating WebSocket:', error);
      }
    };

    connectWebSocket();

    // Clean up on unmount
    return () => {
      if (ws) {
        try {
          ws.close();
        } catch (e) {
          console.error('Error closing WebSocket during cleanup:', e);
        }
      }
    };
  }, [retryCount]);

  return socket;
}

function Router() {
  const { data: auth, isLoading } = useUser();
  useWebSocket();
  
  // If loading auth state, show nothing (avoid flash)
  if (isLoading) {
    return null;
  }
  
  // If not authenticated, show auth screens only
  if (!auth) {
    return (
      <Switch>
        <Route path="/" component={AuthScreen} />
        <Route path="/login" component={Login} />
        <Route component={AuthScreen} />
      </Switch>
    );
  }
  
  // Show different routes based on user role
  if (auth.user.role === "police") {
    return (
      <Switch>
        <Route path="/" component={PoliceDashboard} />
        <Route path="/reports" component={Reports} />
        <Route path="/map" component={CrimeMap} />
        <Route path="/teams" component={Teams} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // Civilian routes
  return (
    <Switch>
      <Route path="/" component={UserDashboard} />
      <Route path="/report" component={ReportCrime} />
      <Route path="/my-reports" component={MyReports} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
