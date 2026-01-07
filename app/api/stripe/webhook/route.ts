import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    console.error("Stripe environment variables not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Supabase service role key not configured");
    return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-02-24.acacia",
  });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        console.log(`Processing checkout.session.completed: customer=${customerId}, subscription=${subscriptionId}`);

        if (!subscriptionId) {
          console.error("No subscription ID in checkout session", { sessionId: session.id });
          break;
        }

        if (!customerId) {
          console.error("No customer ID in checkout session", { sessionId: session.id });
          break;
        }

        try {
          // Get subscription details
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          // Get tier from session metadata (set during checkout) or default to "pro"
          const tier = (session.metadata?.tier as string) || "pro";

          console.log(`Subscription details: status=${subscription.status}, tier=${tier}`);

          // Find user by customer ID
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("user_id")
            .eq("stripe_customer_id", customerId)
            .single();

          if (profileError) {
            console.error("Error finding profile by customer ID:", {
              error: profileError,
              customerId,
              code: profileError.code,
              message: profileError.message,
            });
            break;
          }

          if (!profile) {
            console.error("No profile found for customer ID:", customerId);
            break;
          }

          // Update or create subscription
          const { data: subscriptionData, error: subError } = await supabase
            .from("subscriptions")
            .upsert({
              user_id: profile.user_id,
              stripe_subscription_id: subscriptionId,
              stripe_customer_id: customerId,
              status: subscription.status,
              tier: tier,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .select()
            .single();

          if (subError) {
            console.error("Error upserting subscription:", {
              error: subError,
              userId: profile.user_id,
              subscriptionId,
              status: subscription.status,
              tier,
            });
          } else {
            console.log(`✅ Subscription created/updated for user ${profile.user_id}`, {
              subscriptionId,
              tier,
              status: subscription.status,
              subscriptionData,
            });
          }
        } catch (error: any) {
          console.error("Error processing checkout.session.completed:", {
            error: error.message,
            stack: error.stack,
            customerId,
            subscriptionId,
          });
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            })
            .eq("user_id", profile.user_id);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const { data: profile } = await supabase
          .from("profiles")
          .select("user_id")
          .eq("stripe_customer_id", customerId)
          .single();

        if (profile) {
          await supabase
            .from("subscriptions")
            .update({
              status: "canceled",
            })
            .eq("user_id", profile.user_id);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


