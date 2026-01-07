"use client";

import { useAuth } from "@/hooks/useAuth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LoadingSkeleton } from "./LoadingSkeleton";

const PUBLIC_ROUTES = ["/login"];
const PROTECTED_ROUTES = ["/", "/quotes", "/dashboard", "/profile", "/quote/new"];

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isLoggedIn, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Allow login page to render immediately without waiting for auth
    if (pathname === "/login") {
      setIsReady(true);
      return;
    }

    if (isLoading) return;

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
    const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

    // If not logged in and trying to access protected route, redirect to login
    if (!isLoggedIn && isProtectedRoute) {
      router.replace("/login");
      return;
    }

    // Allow everyone (logged in or not) to access public routes like login
    // Allow logged-in users to access protected routes
    setIsReady(true);
  }, [isLoggedIn, isLoading, pathname, router]);

  if (!isReady) return <LoadingSkeleton />;

  return <>{children}</>;
}

