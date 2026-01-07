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

    // Ensure we have a user ID
    if (!user.id) {
      alert("User session not properly initialized. Please log out and log back in.");
      return;
    }

    try {
      // Get current session to ensure auth is set
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!session || sessionError) {
        throw new Error("No active session. Please log in again.");
      }

      // Ensure profile exists before inserting quote
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("user_id", user.id)
        .single();

      // If profile doesn't exist, create it
      if (profileError && profileError.code === "PGRST116") {
        const { error: createProfileError } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            experience_level: "Intermediate",
          });

        if (createProfileError) {
          console.error("Profile creation error:", createProfileError);
          throw new Error(`Failed to create profile: ${createProfileError.message}`);
        }
      } else if (profileError) {
        console.error("Profile check error:", profileError);
        throw new Error(`Failed to check profile: ${profileError.message}`);
      }

      console.log("Inserting quote with user_id:", user.id);
      
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

      if (error) {
        console.error("Quote insert error:", error);
        console.error("Error details:", {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      if (!data) {
        throw new Error("Quote was created but no data was returned");
      }

      console.log("Quote created successfully:", data.id);

      // Create history entry (non-blocking - don't fail if this fails)
      const { error: historyError } = await supabase.from("quote_history").insert({
        quote_id: data.id,
        action: "created",
      });

      if (historyError) {
        console.warn("Failed to create history entry:", historyError);
        // Don't throw - quote was created successfully
      }

      // Navigate to the quote detail page
      router.push(`/quotes/${data.id}`);
    } catch (error: any) {
      console.error("Error saving quote:", error);
      alert("Failed to save quote: " + (error.message || "Unknown error") + "\n\nCheck the browser console for more details.");
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

