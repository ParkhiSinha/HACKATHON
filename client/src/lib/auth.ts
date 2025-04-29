import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type AuthUser = Omit<User, "password">;

interface AuthResponse {
  user: AuthUser;
}

export function useUser() {
  return useQuery<AuthResponse | null>({
    queryKey: ["/api/auth/user"],
    retry: false
  });
}

export function useLogin() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const response = await apiRequest("POST", "/api/auth/login", credentials);
      return response.json() as Promise<AuthResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  return mutation;
}

export function useLogout() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/auth/logout", {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.setQueryData(["/api/auth/user"], null);
    }
  });

  return mutation;
}

export function useRegister() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (userData: { username: string; password: string; fullName: string; role: string }) => {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    }
  });

  return mutation;
}

export function useRequireAuth(redirectUrl: string = "/login") {
  const { data: auth, isLoading, isError } = useUser();
  
  useEffect(() => {
    if (!isLoading && !auth) {
      window.location.href = redirectUrl;
    }
  }, [auth, isLoading, redirectUrl]);

  return { user: auth?.user, isLoading };
}

export function useRequirePolice(redirectUrl: string = "/login") {
  const { data: auth, isLoading, isError } = useUser();
  
  useEffect(() => {
    if (!isLoading) {
      if (!auth) {
        window.location.href = redirectUrl;
      } else if (auth.user.role !== "police") {
        window.location.href = "/";
      }
    }
  }, [auth, isLoading, redirectUrl]);

  return { user: auth?.user, isLoading };
}
