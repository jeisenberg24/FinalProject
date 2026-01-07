"use client";

import LoginForm from "@/components/LoginForm";
import { Card, CardContent } from "@/components/ui/card";
import { Calculator } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { isLoggedIn, isLoading } = useAuth();
  const router = useRouter();

  // Redirect to homepage if already logged in
  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      router.push("/");
    }
  }, [isLoggedIn, isLoading, router]);

  if (isLoading || isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-4">
            <Calculator className="w-10 h-10 text-primary p-2 rounded-lg shadow-lg" />
            <h1 className="text-3xl font-bold text-primary">Service Quote Calculator</h1>
          </Link>
          <p className="text-muted-foreground text-lg">Sign in to access your quotes</p>
        </div>
        <Card className="shadow-xl">
          <CardContent className="p-8">
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

