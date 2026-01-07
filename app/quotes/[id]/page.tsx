"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { createBrowserClient } from "@supabase/ssr";
import { Quote } from "@/types/models";
import { QuoteDisplay } from "@/components/QuoteDisplay";
import { QuoteInput } from "@/lib/calculations";
import { calculateQuote } from "@/lib/calculations";
import { generateQuotePDF } from "@/lib/pdfExport";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QuoteDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoggedIn, isLoading: authLoading } = useAuth();
  const { isPro, isLoading: subscriptionLoading } = useSubscription(user?.id);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const { toast } = useToast();
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

    const fetchCompanyName = async () => {
      if (user) {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("company_name")
            .eq("user_id", user.id)
            .single();
          if (data?.company_name) {
            setCompanyName(data.company_name);
          }
        } catch (error) {
          console.error("Error fetching company name:", error);
        }
      }
    };

    fetchQuote();
    fetchCompanyName();
  }, [params.id, isLoggedIn, user, authLoading, supabase]);

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

  const handleExportPDF = () => {
    if (!isPro) {
      toast({
        variant: "destructive",
        title: "Premium Feature",
        description: "Please upgrade to Pro to export quotes as PDF.",
      });
      router.push("/profile");
      return;
    }

    try {
      const doc = generateQuotePDF(quoteResult, input, companyName || undefined);
      const fileName = `quote-${quote.service_type.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`;
      doc.save(fileName);
      toast({
        variant: "success",
        title: "PDF Exported",
        description: "Your quote has been exported as a PDF.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        variant: "destructive",
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/quotes">
            <Button variant="outline" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Quotes
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Quote Details</h1>
            <p className="text-muted-foreground">
              Created: {new Date(quote.created_at).toLocaleString()}
            </p>
          </div>
        </div>
        {!subscriptionLoading && (
          <Button
            onClick={handleExportPDF}
            variant={isPro ? "default" : "outline"}
            size="sm"
            className={isPro ? "" : "opacity-60"}
          >
            <Download className="mr-2 h-4 w-4" />
            {isPro ? "Export PDF" : "Export PDF (Pro)"}
          </Button>
        )}
      </div>

      <QuoteDisplay quote={quoteResult} input={input} />
    </div>
  );
}

