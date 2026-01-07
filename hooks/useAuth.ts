import { useState, useEffect } from "react";
import { UseAuthReturn } from "@/types/auth";
import { createBrowserClient } from "@supabase/ssr";

export function useAuth(): UseAuthReturn {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // State
  const [session, setSession] = useState<any>(null);
  const [user, setUser] = useState<any | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // Helper functions
  const clearError = () => setError(null);

  const fetchUserProfile = async (userId: string, userEmail: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === "PGRST116") {
        const { error: createError } = await supabase
          .from("profiles")
          .insert({
            user_id: userId,
            experience_level: "Intermediate",
          });

        if (createError) {
          console.error("Error creating profile:", createError);
          // Still set user with basic info even if profile creation fails
          setUser({
            id: userId,
            email: userEmail,
          });
        } else {
          // Profile created, fetch it again
          const { data: newProfile } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", userId)
            .single();

          setUser({
            ...newProfile,
            id: userId,
            email: userEmail,
          });
        }
      } else if (profileError) {
        console.error("Error fetching profile:", profileError);
        // Set user with basic info even if profile fetch fails
        setUser({
          id: userId,
          email: userEmail,
        });
      } else {
        setUser({
          ...data,
          id: userId,
          email: userEmail,
        });
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Set user with basic info on error
      setUser({
        id: userId,
        email: userEmail,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSessionState = async (newSession: any) => {
    setSession(newSession);
    setIsLoggedIn(!!newSession);

    if (newSession?.user) {
      setIsLoading(true);
      await fetchUserProfile(newSession.user.id, newSession.user.email);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  };

  // Auth methods
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);
      setUser(null);
      setIsLoggedIn(false);
      setEmail("");
      setPassword("");
      window.localStorage.removeItem("supabase.auth.token");
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing out:", error);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
    } catch (error: any) {
      setError(error.message);
      console.error("Error logging in:", error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      // Use just the base callback URL - Supabase is strict about URL format
      const redirectUrl = `${window.location.origin}/auth/callback`;
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: redirectUrl,
        },
      });
      
      if (oauthError) {
        setError(oauthError.message);
        console.error("Error with Google login:", oauthError);
      }
      // Note: signInWithOAuth will automatically redirect the browser if successful
      // If it doesn't redirect, check Supabase dashboard for redirect URL configuration
    } catch (error: any) {
      setError(error.message || "Failed to initiate Google sign-in");
      console.error("Error with Google login:", error);
    }
  };

  const handleSignup = async () => {
    clearError();
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/` },
      });

      if (error) {
        setError(error.message);
      } else {
        setError("Please check your email to confirm your account");
      }
    } catch (error: any) {
      setError(error.message);
      console.error("Error signing up:", error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        await updateSessionState(session);
      } catch (error: any) {
        console.error("Error initializing auth:", error);
        setError(error.message);
        await signOut();
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      updateSessionState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    // State
    user,
    session,
    email,
    password,
    isLoggedIn,
    isLoading,
    error,
    isSignUpMode,

    // Operations
    signOut,
    handleLogin,
    handleGoogleLogin,
    handleSignup,
    setEmail,
    setPassword,
    setIsSignUpMode,
    clearError,
  };
}

