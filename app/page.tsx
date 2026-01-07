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
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">Dashboard</h1>
            <p className="text-slate-600 text-lg">
              Welcome back{user?.email ? `, ${user.email.split('@')[0]}` : ""}! 👋
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card className="card-hover border-blue-100 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Calculator className="w-6 h-6 text-blue-600" />
                  New Quote
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Create a new service quote
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quote/new">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md">
                    Create Quote
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover border-indigo-100 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-indigo-700">
                  <FileText className="w-6 h-6 text-indigo-600" />
                  My Quotes
                </CardTitle>
                <CardDescription className="text-slate-600">
                  View and manage your saved quotes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/quotes">
                  <Button variant="outline" className="w-full border-indigo-200 text-indigo-700 hover:bg-indigo-50 hover:border-indigo-300">
                    View Quotes
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="card-hover border-purple-100 bg-white/90 backdrop-blur-sm shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <Settings className="w-6 h-6 text-purple-600" />
                  Settings
                </CardTitle>
                <CardDescription className="text-slate-600">
                  Manage your account settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/profile">
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300">
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
