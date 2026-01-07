import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    // Validate environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe configuration error" },
        { status: 500 }
      );
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-02-24.acacia",
    });

    // Get authenticated user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
            } catch (error) {
              // Ignore cookie setting errors
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: "", ...options });
            } catch (error) {
              // Ignore cookie removal errors
            }
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.id;

    // Use service role client for admin operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user's Stripe customer ID
    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("stripe_customer_id")
      .eq("user_id", userId)
      .single();

    if (profileError || !profile?.stripe_customer_id) {
      return NextResponse.json(
        { error: "No Stripe customer found. Please complete a checkout first." },
        { status: 404 }
      );
    }

    // Get all subscriptions for this customer from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripe_customer_id,
      status: "all",
      limit: 10,
    });

    // Find the most recent active or trialing subscription
    const activeSubscription = subscriptions.data.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    if (!activeSubscription) {
      // No active subscription found in Stripe
      // Check if we have a subscription in DB that should be canceled
      const { data: existingSub } = await supabaseAdmin
        .from("subscriptions")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (existingSub && existingSub.status !== "canceled") {
        // Update to canceled if it exists but isn't active in Stripe
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("user_id", userId);
      }

      return NextResponse.json({
        success: true,
        subscription: null,
        message: "No active subscription found",
      });
    }

    // Determine tier from subscription metadata or price
    let tier = "pro";
    if (activeSubscription.metadata?.tier) {
      tier = activeSubscription.metadata.tier;
    } else if (activeSubscription.items.data[0]?.price.metadata?.tier) {
      tier = activeSubscription.items.data[0].price.metadata.tier;
    }

    // Update or create subscription in database
    const { data: subscriptionData, error: subError } = await supabaseAdmin
      .from("subscriptions")
      .upsert({
        user_id: userId,
        stripe_subscription_id: activeSubscription.id,
        stripe_customer_id: profile.stripe_customer_id,
        status: activeSubscription.status,
        tier: tier,
        current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
      })
      .select()
      .single();

    if (subError) {
      console.error("Error upserting subscription:", subError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscription: subscriptionData,
      message: "Subscription synced successfully",
    });
  } catch (error: any) {
    console.error("Error syncing subscription:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync subscription" },
      { status: 500 }
    );
  }
}

