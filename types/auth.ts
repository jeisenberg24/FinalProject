/**
 * Type definitions for authentication
 */

export interface UseAuthReturn {
  user: any | null;
  session: any | null;
  email: string;
  password: string;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  isSignUpMode: boolean;
  signOut: () => Promise<void>;
  handleLogin: (e: React.FormEvent) => Promise<void>;
  handleGoogleLogin: () => Promise<void>;
  handleSignup: () => Promise<void>;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setIsSignUpMode: (mode: boolean) => void;
  clearError: () => void;
}


