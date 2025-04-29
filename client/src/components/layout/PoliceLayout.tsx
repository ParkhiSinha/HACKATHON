import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser, useLogout } from "@/lib/auth";
import { 
  AlertTriangle, 
  BarChart3, 
  Bell, 
  ClipboardList, 
  Download, 
  Map, 
  Plus, 
  Users
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

interface PoliceLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const PoliceLayout = ({ children, title }: PoliceLayoutProps) => {
  const { data: auth } = useUser();
  const logout = useLogout();
  const { toast } = useToast();
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      toast({
        title: "Logged out successfully",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        variant: "destructive",
      });
    }
  };

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-police text-white fixed inset-y-0 left-0 z-10 hidden md:flex md:flex-col">
        <div className="p-4 border-b border-blue-900 flex items-center">
          {/* <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.636 4.636a6 6 0 018.728 8.728 6 6 0 01-8.728-8.728z" clipRule="evenodd"></path>
            <path d="M10 4a6 6 0 00-6 6h2a4 4 0 014-4V4z"></path>
          </svg> */}
          <img src="namma_logo.png" alt="logo" className="h-10 w-auto"/>
          <h1 className="ml-2 text-xl font-semibold">Namma Suraksha</h1>
        </div>
        
        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 px-2 py-4 space-y-1">
            <div 
              onClick={() => window.location.href = '/'}
              className={`flex items-center px-4 py-2 text-white ${location === '/' ? 'bg-police-light' : ''} rounded-lg hover:bg-police-light cursor-pointer`}
            >
              <BarChart3 className="w-5 h-5 mr-3" />
              <span>Dashboard</span>
            </div>
            <div 
              onClick={() => window.location.href = '/reports'}
              className={`flex items-center px-4 py-2 ${location === '/reports' ? 'text-white bg-police-light' : 'text-blue-100'} hover:bg-police-light hover:text-white rounded-lg cursor-pointer`}
            >
              <ClipboardList className="w-5 h-5 mr-3" />
              <span>Reports</span>
            </div>
            <div 
              onClick={() => window.location.href = '/map'}
              className={`flex items-center px-4 py-2 ${location === '/map' ? 'text-white bg-police-light' : 'text-blue-100'} hover:bg-police-light hover:text-white rounded-lg cursor-pointer`}
            >
                <Map className="w-5 h-5 mr-3" />
                <span>Crime Map</span>
            </div>
            <div 
              onClick={() => window.location.href = '/teams'}
              className={`flex items-center px-4 py-2 ${location === '/teams' ? 'text-white bg-police-light' : 'text-blue-100'} hover:bg-police-light hover:text-white rounded-lg cursor-pointer`}
            >
                <Users className="w-5 h-5 mr-3" />
                <span>Teams</span>
            </div>
            <div 
              onClick={() => window.location.href = '/alerts'}
              className={`flex items-center px-4 py-2 ${location === '/alerts' ? 'text-white bg-police-light' : 'text-blue-100'} hover:bg-police-light hover:text-white rounded-lg cursor-pointer`}
            >
                <Bell className="w-5 h-5 mr-3" />
                <span>Alerts</span>
                <Badge variant="destructive" className="ml-auto bg-secondary text-white">3</Badge>
            </div>
          </nav>
          
          <div className="p-4 border-t border-blue-900">
            <div className="flex items-center">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80" alt="User" />
                <AvatarFallback>{auth?.user.fullName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">{auth?.user.fullName}</p>
                <p className="text-xs text-blue-300">Central Precinct</p>
              </div>
            </div>
            <button 
              onClick={handleLogout} 
              disabled={logout.isPending}
              className="mt-4 flex items-center text-sm text-blue-300 hover:text-white"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>{logout.isPending ? "Signing out..." : "Sign out"}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile header */}
      <div className="md:hidden bg-police text-white w-full fixed top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="mr-2">
              {/* <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg> */}
              <img src="namma_logo.png" alt="logo" className="h-10 w-auto"/>
            </button>
            <h1 className="text-lg font-semibold">Namma Suraksha</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button>
              <Bell />
            </button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80" alt="User" />
              <AvatarFallback>{auth?.user.fullName.charAt(0)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="bg-police-dark border-t border-blue-900">
            <nav className="py-2">
              <div 
                onClick={() => window.location.href = '/'} 
                className={`flex items-center px-4 py-2 ${location === '/' ? 'bg-police-light' : ''} cursor-pointer`}
              >
                <BarChart3 className="w-5 h-5 mr-3" />
                <span>Dashboard</span>
              </div>
              <div 
                onClick={() => window.location.href = '/reports'} 
                className={`flex items-center px-4 py-2 ${location === '/reports' ? 'bg-police-light' : ''} cursor-pointer`}
              >
                <ClipboardList className="w-5 h-5 mr-3" />
                <span>Reports</span>
              </div>
              <div 
                onClick={() => window.location.href = '/map'} 
                className={`flex items-center px-4 py-2 ${location === '/map' ? 'bg-police-light' : ''} cursor-pointer`}
              >
                <Map className="w-5 h-5 mr-3" />
                <span>Crime Map</span>
              </div>
              <div 
                onClick={() => window.location.href = '/teams'} 
                className={`flex items-center px-4 py-2 ${location === '/teams' ? 'bg-police-light' : ''} cursor-pointer`}
              >
                <Users className="w-5 h-5 mr-3" />
                <span>Teams</span>
              </div>
              <div 
                onClick={() => window.location.href = '/alerts'} 
                className={`flex items-center px-4 py-2 ${location === '/alerts' ? 'bg-police-light' : ''} cursor-pointer`}
              >
                <Bell className="w-5 h-5 mr-3" />
                <span>Alerts</span>
              </div>
              <button 
                onClick={handleLogout}
                disabled={logout.isPending}
                className="flex items-center px-4 py-2 w-full text-left"
              >
                <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{logout.isPending ? "Signing out..." : "Sign out"}</span>
              </button>
            </nav>
          </div>
        )}
      </div>
      
      {/* Main Content */}
      <div className="flex-1 md:ml-64 pt-16 md:pt-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          {title && (
            <div className="md:flex md:items-center md:justify-between mb-8">
              <div className="flex-1 min-w-0">
                <h2 className="text-2xl font-bold leading-7 text-gray-800 sm:text-3xl sm:truncate">
                  {title}
                </h2>
                <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <svg className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Central Precinct
                  </div>
                </div>
              </div>
              <div className="mt-5 flex lg:mt-0 lg:ml-4">
                <span className="hidden sm:block">
                  <Button variant="outline" className="inline-flex items-center">
                    <Download className="-ml-1 mr-2 h-5 w-5 text-gray-500" />
                    Export Data
                  </Button>
                </span>
                
                <span className="ml-3 hidden sm:block">
                  <Button className="inline-flex items-center bg-police hover:bg-police-dark">
                    <Plus className="-ml-1 mr-2 h-5 w-5" />
                    New Alert
                  </Button>
                </span>
              </div>
            </div>
          )}
          
          {children}
        </div>
      </div>
    </div>
  );
};

export default PoliceLayout;
