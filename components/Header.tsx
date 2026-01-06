import Link from "next/link";
import { UserCircle, Calculator } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

const Header = () => {
  const { isLoggedIn, signOut, user } = useAuth();

  return (
    <header className="bg-transparent text-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href={"/"} className="text-xl font-bold flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Quote Calculator
        </Link>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <Link href="/quotes" className="text-sm hover:underline">
                My Quotes
              </Link>
              <Link href="/dashboard" className="text-sm hover:underline">
                Dashboard
              </Link>
              <Link href="/profile">
                <UserCircle className="w-6 h-6" />
              </Link>
              <Button
                variant="outline"
                size="sm"
                onClick={signOut}
                className="text-white border-white hover:bg-white/10"
              >
                Sign Out
              </Button>
            </>
          ) : (
            <Link href="/" className="text-sm hover:underline">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

