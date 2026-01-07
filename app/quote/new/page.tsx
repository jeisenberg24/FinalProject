"use client";

import { QuoteForm } from "@/components/QuoteForm";
import { useAuth } from "@/hooks/useAuth";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
// Toast notifications can be added later

export default function NewQuotePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSave = async (quoteData: any) => {
    if (!isLoggedIn || !user) {
      router.push("/");
      return;
    }

    try {
      const { data, error } = await supabase
        .from("quotes")
        .insert({
          user_id: user.id,
          service_type: quoteData.serviceType,
          market_rate: quoteData.marketRate,
          market_demand: quoteData.marketDemand,
          is_emergency: quoteData.isEmergency,
          location: quoteData.location,
          complexity: quoteData.complexity,
          materials_cost: quoteData.materialsCost,
          time_of_day: quoteData.timeOfDay,
          seasonal_factor: quoteData.seasonalFactor,
          competitor_pricing: quoteData.competitorPricing,
          experience_level: quoteData.experienceLevel,
          equipment_requirements: quoteData.equipmentRequirements,
          calculated_price: quoteData.calculatedPrice,
          price_range_min: quoteData.priceRangeMin,
          price_range_max: quoteData.priceRangeMax,
          price_breakdown: quoteData.priceBreakdown,
          quote_validity_days: quoteData.quoteValidityDays,
        })
        .select()
        .single();

      if (error) throw error;

      // Create history entry
      await supabase.from("quote_history").insert({
        quote_id: data.id,
        action: "created",
      });

      router.push(`/quotes/${data.id}`);
    } catch (error: any) {
      console.error("Error saving quote:", error);
      alert("Failed to save quote: " + error.message);
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to create a quote.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Quote</h1>
            <p className="text-gray-600">
              Fill in the details below to generate an accurate service quote
            </p>
          </div>
          <QuoteForm onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}

