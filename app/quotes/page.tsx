"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { Quote } from "@/types/models";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/calculations";
import Link from "next/link";
import { Plus, FileText } from "lucide-react";

export default function QuotesPage() {
  const { user, isLoggedIn } = useAuth();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const fetchQuotes = async () => {
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setQuotes(data || []);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuotes();
  }, [isLoggedIn, user]);

  if (!isLoggedIn) {
    return <div>Please log in to view your quotes.</div>;
  }

  if (isLoading) {
    return <div>Loading quotes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Quotes</h1>
          <p className="text-muted-foreground">
            View and manage all your saved quotes
          </p>
        </div>
        <Link href="/quote/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Quote
          </Button>
        </Link>
      </div>

      {quotes.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No quotes yet</p>
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
  );
}

