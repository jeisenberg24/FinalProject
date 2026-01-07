"use client";

import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { createBrowserClient } from "@supabase/ssr";

export default function LoginPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();
  const hasRedirected = useRef(false);

  // Redirect to homepage if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isLoading, router]);

  // Automatically redirect to Google sign-in IMMEDIATELY on page load
  // Don't wait for auth state to load
  useEffect(() => {
    if (!hasRedirected.current) {
      hasRedirected.current = true;
      
      // Create supabase client directly for immediate redirect
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Trigger OAuth redirect immediately - don't wait for anything
      supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      }).catch((error) => {
        console.error("Error initiating Google sign-in:", error);
        hasRedirected.current = false;
      });
    }
  }, []); // Empty dependency array = run immediately on mount

  // Show minimal loading state while redirecting
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <div className="text-lg mb-2">Redirecting to Google sign-in...</div>
        <div className="text-sm text-muted-foreground">Please wait</div>
      </div>
    </div>
  );
}

