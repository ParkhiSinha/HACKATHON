import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useUser, useLogout } from "@/lib/auth";
import { AlertTriangle, Home, List, Plus, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import EmergencyButton from "@/components/emergencySignal/EmergencyButton";
import LanguageSelector, { LanguageSelectorMobile } from "@/components/LanguageSelector";
import { useToast } from "@/hooks/use-toast";

interface UserLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const UserLayout = ({ children, title }: UserLayoutProps) => {
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
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.636 4.636a6 6 0 018.728 8.728 6 6 0 01-8.728-8.728z" clipRule="evenodd"></path>
                <path d="M10 4a6 6 0 00-6 6h2a4 4 0 014-4V4z"></path>
              </svg>
              <h1 className="ml-2 text-xl font-semibold text-gray-800">SafetyNet</h1>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <div
                onClick={() => window.location.href = '/'}
                className={`${location === '/' ? 'text-gray-800 font-medium' : 'text-gray-500'} hover:text-primary cursor-pointer`}
              >
                Dashboard
              </div>
              <div
                onClick={() => window.location.href = '/report'}
                className={`${location === '/report' ? 'text-gray-800 font-medium' : 'text-gray-500'} hover:text-primary cursor-pointer`}
              >
                Report Crime
              </div>
              <div
                onClick={() => window.location.href = '/my-reports'}
                className={`${location === '/my-reports' ? 'text-gray-800 font-medium' : 'text-gray-500'} hover:text-primary cursor-pointer`}
              >
                My Reports
              </div>
            </nav>
            
            <div className="flex items-center space-x-4">
              <EmergencyButton />
              
              <div className="hidden md:block">
                <LanguageSelector />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80" alt="User profile" />
                      <AvatarFallback>{auth?.user.fullName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{auth?.user.fullName}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} disabled={logout.isPending}>
                    {logout.isPending ? "Logging out..." : "Logout"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation */}
        <div className={`md:hidden bg-gray-50 border-t ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-4 py-2 flex justify-end border-b border-gray-200">
            <LanguageSelectorMobile />
          </div>
          <nav className="flex justify-between px-4 py-3">
            <Link href="/">
              <a className={`${location === '/' ? 'text-primary' : 'text-gray-500'} flex flex-col items-center text-xs`}>
                <Home className={`text-lg mb-1 ${location === '/' ? 'text-primary' : 'text-gray-500'}`} />
                Home
              </a>
            </Link>
            <Link href="/report">
              <a className={`${location === '/report' ? 'text-primary' : 'text-gray-500'} flex flex-col items-center text-xs`}>
                <Plus className={`text-lg mb-1 ${location === '/report' ? 'text-primary' : 'text-gray-500'}`} />
                Report
              </a>
            </Link>
            <Link href="/my-reports">
              <a className={`${location === '/my-reports' ? 'text-primary' : 'text-gray-500'} flex flex-col items-center text-xs`}>
                <List className={`text-lg mb-1 ${location === '/my-reports' ? 'text-primary' : 'text-gray-500'}`} />
                My Reports
              </a>
            </Link>
            <a className="text-gray-500 flex flex-col items-center text-xs">
              <UserIcon className="text-lg mb-1 text-gray-500" />
              Profile
            </a>
          </nav>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {title && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
};

export default UserLayout;
