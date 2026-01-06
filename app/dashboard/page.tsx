"use client";

import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Calculator, FileText, Settings } from "lucide-react";

export default function Dashboard() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ""}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5" />
              New Quote
            </CardTitle>
            <CardDescription>
              Create a new service quote
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quote/new">
              <Button className="w-full">Create Quote</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              My Quotes
            </CardTitle>
            <CardDescription>
              View and manage your saved quotes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/quotes">
              <Button variant="outline" className="w-full">View Quotes</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings
            </CardTitle>
            <CardDescription>
              Manage your account settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/profile">
              <Button variant="outline" className="w-full">Settings</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

