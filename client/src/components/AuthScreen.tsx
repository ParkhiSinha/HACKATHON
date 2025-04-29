import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, User } from "lucide-react";
import { useLogin, useRegister } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const AuthScreen = () => {
  const [mode, setMode] = useState<'choose' | 'login' | 'register'>('choose');
  const [role, setRole] = useState<'civilian' | 'police'>('civilian');
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-4">
      <Card className="bg-white rounded-lg shadow-xl overflow-hidden max-w-4xl w-full">
        <div className="md:flex">
          <div className="p-8 md:w-1/2 flex flex-col justify-between">
            {mode === 'choose' && (
              <AccessTypeSelector onSelect={(selectedRole) => {
                setRole(selectedRole);
                setMode('login');
              }} />
            )}
            
            {mode === 'login' && (
              <LoginForm 
                role={role} 
                onBack={() => setMode('choose')}
                onRegister={() => setMode('register')}
              />
            )}
            
            {mode === 'register' && (
              <RegisterForm 
                role={role} 
                onBack={() => setMode('login')}
              />
            )}
            
            <div className="mt-8 text-center text-sm text-gray-500">
              <p>In case of immediate danger, call emergency services directly.</p>
              <p className="font-semibold mt-1">Emergency: 112 / 100</p>
            </div>
          </div>
          
          <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary to-police relative">
            <div className="absolute inset-0 bg-black opacity-20"></div>
            <div className="p-12 relative z-10 h-full flex flex-col justify-end">
              <h3 className="text-white text-2xl font-bold mb-4">Community Safety Platform</h3>
              <p className="text-white opacity-90">Report incidents, track cases, and help keep your community safe with our integrated dashboard system.</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

const AccessTypeSelector = ({ onSelect }: { onSelect: (role: 'civilian' | 'police') => void }) => {
  return (
    <div>
      <div className="flex items-center mb-8">
        {/* <svg className="w-10 h-10 text-primary-dark" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.636 4.636a6 6 0 018.728 8.728 6 6 0 01-8.728-8.728z" clipRule="evenodd"></path>
          <path d="M10 4a6 6 0 00-6 6h2a4 4 0 014-4V4z"></path>
        </svg> */}
        <img src="namma_logo.png" alt="logo" className="h-10 w-auto"/>
        <h1 className="ml-2 text-2xl font-bold text-gray-800">Namma Suraksha</h1>
      </div>
      <h2 className="text-xl font-semibold text-gray-700 mb-6">Choose your access type</h2>
      
      <div className="space-y-4">
        <button 
          onClick={() => onSelect('civilian')} 
          className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-user-light transition"
        >
          <div className="flex items-center">
            <div className="bg-primary p-2 rounded-full">
              <User className="text-white" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="font-medium text-gray-800">Civilian Access</h3>
              <p className="text-sm text-gray-500">Report incidents and track your submissions</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        
        <button 
          onClick={() => onSelect('police')} 
          className="w-full flex items-center justify-between p-4 border rounded-lg hover:bg-blue-50 transition"
        >
          <div className="flex items-center">
            <div className="bg-police p-2 rounded-full">
              <Shield className="text-white" />
            </div>
            <div className="ml-4 text-left">
              <h3 className="font-medium text-gray-800">Law Enforcement</h3>
              <p className="text-sm text-gray-500">Access dashboards and manage reports</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const LoginForm = ({ 
  role, 
  onBack, 
  onRegister 
}: { 
  role: 'civilian' | 'police', 
  onBack: () => void,
  onRegister: () => void
}) => {
  const login = useLogin();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await login.mutateAsync(values);
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center text-primary font-medium hover:underline">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>
      
      <div className="flex items-center mb-8">
        {/* <svg className="w-10 h-10 text-primary-dark" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.636 4.636a6 6 0 018.728 8.728 6 6 0 01-8.728-8.728z" clipRule="evenodd"></path>
          <path d="M10 4a6 6 0 00-6 6h2a4 4 0 014-4V4z"></path>
        </svg> */}
        <img src="namma_logo.png" alt="logo" className="h-10 w-auto" />
        <h1 className="ml-2 text-2xl font-bold text-gray-800">Namma Suraksha</h1>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        {role === 'civilian' ? 'Civilian Login' : 'Law Enforcement Login'}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Enter your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white"
              disabled={login.isPending}
            >
              {login.isPending ? "Logging in..." : "Login"}
            </Button>
          </div>
          
          {/* <div className="text-center text-sm">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <button 
                type="button"
                onClick={onRegister}
                className="text-primary font-medium hover:underline"
              >
                Register
              </button>
            </p>
          </div> */}

          {role === 'civilian' && (
            <div className="text-center text-sm">
              <p className="text-gray-600">
                Don't have an account?{" "}
                <button 
                  type="button"
                  onClick={onRegister}
                  className="text-primary font-medium hover:underline"
                >
                  Register
                </button>
              </p>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

const registerSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const RegisterForm = ({ 
  role, 
  onBack 
}: { 
  role: 'civilian' | 'police', 
  onBack: () => void 
}) => {
  const register = useRegister();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
  });
  
  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    try {
      const { confirmPassword, ...userData } = values;
      await register.mutateAsync({
        ...userData,
        role,
      });
      
      toast({
        title: "Registration successful",
        description: "You can now log in with your credentials",
      });
      
      onBack();
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Username may already exist",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center text-primary font-medium hover:underline">
        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Login
      </button>
      
      <div className="flex items-center mb-8">
        {/* <svg className="w-10 h-10 text-primary-dark" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.636 4.636a6 6 0 018.728 8.728 6 6 0 01-8.728-8.728z" clipRule="evenodd"></path>
          <path d="M10 4a6 6 0 00-6 6h2a4 4 0 014-4V4z"></path>
        </svg> */}
        <img src="namma_logo.png" alt="logo" className="h-10 w-auto" />
        <h1 className="ml-2 text-2xl font-bold text-gray-800">Namma Suraksha</h1>
      </div>
      
      <h2 className="text-xl font-semibold text-gray-700 mb-6">
        {role === 'civilian' ? 'Civilian Registration' : 'Law Enforcement Registration'}
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your full name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Choose a username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Create a password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input type="password" placeholder="Confirm your password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-dark text-white"
              disabled={register.isPending}
            >
              {register.isPending ? "Registering..." : "Register"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default AuthScreen;
