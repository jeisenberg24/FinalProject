"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { Quote } from "@/types/models";
import { QuoteDisplay } from "@/components/QuoteDisplay";
import { QuoteInput } from "@/lib/calculations";
import { calculateQuote } from "@/lib/calculations";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn } = useAuth();
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!isLoggedIn || !user) return;

    const fetchQuote = async () => {
      try {
        const { data, error } = await supabase
          .from("quotes")
          .select("*")
          .eq("id", params.id)
          .eq("user_id", user.id)
          .single();

        if (error) throw error;
        setQuote(data);
      } catch (error) {
        console.error("Error fetching quote:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuote();
  }, [params.id, isLoggedIn, user]);

  if (!isLoggedIn) {
    return <div>Please log in to view this quote.</div>;
  }

  if (isLoading) {
    return <div>Loading quote...</div>;
  }

  if (!quote) {
    return <div>Quote not found.</div>;
  }

  // Reconstruct input and calculate quote for display
  const input: QuoteInput = {
    marketRate: quote.market_rate,
    marketDemand: quote.market_demand,
    serviceType: quote.service_type,
    isEmergency: quote.is_emergency,
    location: quote.location,
    complexity: quote.complexity,
    materialsCost: quote.materials_cost,
    timeOfDay: quote.time_of_day || undefined,
    seasonalFactor: quote.seasonal_factor,
    competitorPricing: quote.competitor_pricing || undefined,
    experienceLevel: quote.experience_level,
    equipmentRequirements: quote.equipment_requirements,
  };

  const quoteResult = calculateQuote(input);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/quotes">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Quotes
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">Quote Details</h1>
          <p className="text-muted-foreground">
            Created: {new Date(quote.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <QuoteDisplay quote={quoteResult} input={input} />
    </div>
  );
}

