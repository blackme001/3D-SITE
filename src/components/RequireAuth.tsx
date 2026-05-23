// src/components/RequireAuth.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface RequireAuthProps {
  /** If true, redirects unauthenticated users to /login */
  redirect?: boolean;
  /** Content to display when authorized */
  children: React.ReactNode;
  /** The role required to access the page (e.g. 'admin') */
  requiredRole?: string;
}

export default function RequireAuth({ redirect = true, children, requiredRole }: RequireAuthProps) {
  // In a real app you would pull auth state from your auth provider/ Supabase
  const isAuthenticated = true; // placeholder – replace with real check
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && redirect) {
      router.replace("/login");
    }
  }, [isAuthenticated, redirect, router]);

  // Show nothing while redirecting or when not authenticated
  if (!isAuthenticated) return null;
  return <>{children}</>;
}
