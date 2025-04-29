import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useLogin } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const login = useLogin();
  const { toast } = useToast();
  const [isRedirecting, setIsRedirecting] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const response = await login.mutateAsync(values);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${response.user.fullName}!`,
      });
      
      setIsRedirecting(true);
      
      // Redirect based on user role
      setTimeout(() => {
        setLocation("/");
      }, 500);
      
    } catch (error) {
      toast({
        title: "Login failed",
        description: "Invalid username or password",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-10 h-10 text-primary-dark" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zM5.636 4.636a6 6 0 018.728 8.728 6 6 0 01-8.728-8.728z" clipRule="evenodd"></path>
              <path d="M10 4a6 6 0 00-6 6h2a4 4 0 014-4V4z"></path>
            </svg>
            <h1 className="ml-2 text-2xl font-bold text-gray-800">SafetyNet</h1>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Log in to your account
          </CardTitle>
          <CardDescription className="text-center">
            Enter your username and password to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
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
                      <Input
                        type="password"
                        placeholder="Enter your password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={login.isPending || isRedirecting}
              >
                {login.isPending || isRedirecting ? "Logging in..." : "Log in"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <div className="text-center text-sm text-gray-500 mt-2">
            <p>
              Don't have an account?{" "}
              <Button
                variant="link"
                className="p-0 h-auto font-semibold"
                onClick={() => setLocation("/")}
              >
                Sign up
              </Button>
            </p>
            <p className="mt-4 font-semibold">
              In case of immediate danger, call emergency services directly.
            </p>
            <p className="mt-1 font-bold">Emergency: 911</p>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
