import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { Subscription } from "@/types/models";

export function useSubscription(userId: string | undefined) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", userId)
          .single();

        if (error && error.code !== "PGRST116") {
          // PGRST116 is "no rows returned", which is fine
          console.error("Error fetching subscription:", error);
        } else if (data) {
          setSubscription(data);
        }
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [userId, supabase]);

  const isPro = subscription?.tier === "pro" && subscription?.status === "active";
  const isPremium = (subscription?.tier === "premium" || subscription?.tier === "pro") && subscription?.status === "active";

  return {
    subscription,
    isLoading,
    isPro,
    isPremium,
  };
}

