"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calculator, FileText, Settings } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, isLoading, isLoggedIn } = useAuth();
  const router = useRouter();

  // Redirect to login if not logged in
  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push("/login");
    }
  }, [isLoading, isLoggedIn, router]);

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!isLoggedIn) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          <div className="bg-card rounded-2xl p-6 shadow-lg border border-border">
            <h1 className="text-4xl font-bold text-primary mb-2">Dashboard</h1>
            <p className="text-muted-foreground text-lg">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ""}! 👋
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Calculator className="w-6 h-6 text-primary" />
                  New Quote
                </CardTitle>
                <CardDescription>
                  Create a new service quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quote/new">
                  <Button className="w-full">
                    Create Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <FileText className="w-6 h-6 text-primary" />
                  My Quotes
                </CardTitle>
                <CardDescription>
                  View and manage your saved quotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quotes">
                  <Button variant="outline" className="w-full">
                    View Quotes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-card-foreground">
                  <Settings className="w-6 h-6 text-primary" />
                  Settings
                </CardTitle>
                <CardDescription>
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
