"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { Quote } from "@/types/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import Link from "next/link";
import { Plus, FileText, ArrowLeft } from "lucide-react";

export default function QuotesPage() {
  const { user, isLoggedIn, isLoading: authLoading, session } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) return;

    // If not logged in, stop loading
    if (!isLoggedIn || !user) {
      setIsLoading(false);
      return;
    }

    const fetchQuotes = async () => {
      try {
        // Get the current session to ensure it's available
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          throw new Error("Failed to get session: " + sessionError.message);
        }

        if (!currentSession) {
          throw new Error("No active session. Please log in again.");
        }

        console.log("Session available, user ID:", currentSession.user.id);
        console.log("Fetching quotes for user:", user.id);

        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Supabase error fetching quotes:", error);
          console.error("Error details:", {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint
          });
          setError(error.message);
          throw error;
        }
        
        console.log("Quotes fetched successfully:", data?.length || 0, "quotes");
        setQuotes(data || []);
        setError(null);
      } catch (error: any) {
        console.error("Error fetching quotes:", error);
        setError(error.message || "Failed to load quotes");
        // Set empty array on error so UI doesn't stay in loading state
        setQuotes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [isLoggedIn, user, authLoading, session]);

  if (!isLoggedIn) {
    return <div>Please log in to view your quotes.</div>;
  }

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">My Quotes</h1>
                <p className="text-gray-600">
                  View and manage all your saved quotes
                </p>
              </div>
            </div>
            <Link href="/quote/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Quote
              </Button>
            </Link>
          </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-4">
            <p className="text-red-800 text-sm">Error: {error}</p>
          </CardContent>
        </Card>
      )}

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              {error ? "Failed to load quotes" : "No quotes yet"}
            </p>
            <Link href="/quote/new">
              <Button>Create Your First Quote</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((quote) => (
            <Card key={quote.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">{quote.service_type}</CardTitle>
                <CardDescription>
                  {quote.location} • {new Date(quote.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">
                    {formatCurrency(quote.calculated_price)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Range: {formatCurrency(quote.price_range_min)} - {formatCurrency(quote.price_range_max)}
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href={`/quotes/${quote.id}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        View
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

