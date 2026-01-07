import Link from "next/link";
import { UserCircle, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isLoggedIn, signOut, user } = useAuth();

  return (
    <header className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-lg border-b border-blue-500/20">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={"/"} className="text-xl font-bold flex items-center gap-2 text-white hover:text-blue-100 transition-colors">
          <Calculator className="w-7 h-7 text-white drop-shadow-md" />
          <span className="text-white font-semibold tracking-tight">Service Quote Calculator</span>
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/quotes" className="text-sm text-white/90 hover:text-white hover:underline transition-colors font-medium">
                My Quotes
              </Link>
              <Link href="/dashboard" className="text-sm text-white/90 hover:text-white hover:underline transition-colors font-medium">
                Dashboard
              </Link>
              <Link href="/profile" className="text-white/90 hover:text-white transition-colors">
                <UserCircle className="w-6 h-6" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-white border-white/30 bg-white/10 hover:bg-white/20 hover:border-white/50 backdrop-blur-sm transition-all"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/login" className="text-sm text-white/90 hover:text-white hover:underline transition-colors font-medium">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

