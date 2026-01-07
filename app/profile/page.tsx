"use client";

import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createBrowserClient } from "@supabase/ssr";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { ArrowLeft, Crown, Check } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoggedIn } = useAuth();
  const { subscription, isLoading: isLoadingSubscription } = useSubscription(user?.id);
  const { toast } = useToast();
  const [companyName, setCompanyName] = useState(user?.company_name || "");
  const [experienceLevel, setExperienceLevel] = useState(user?.experience_level || "Intermediate");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Handle success/cancel query parameters and poll for subscription update
  useEffect(() => {
    if (typeof window === "undefined") return;
    
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "true") {
      toast({
        variant: "success",
        title: "Payment successful!",
        description: "Your subscription is being activated. Please wait a moment...",
      });
      
      // Poll for subscription update (webhook may take a few seconds)
      let pollCount = 0;
      const maxPolls = 10; // Poll for up to 10 seconds
      const pollInterval = setInterval(async () => {
        pollCount++;
        if (user) {
          const { data } = await supabase
            .from("subscriptions")
            .select("*")
            .eq("user_id", user.id)
            .single();
          
          if (data && data.tier === "pro" && data.status === "active") {
            clearInterval(pollInterval);
            toast({
              variant: "success",
              title: "Subscription Activated!",
              description: "Welcome to Pro! Your premium features are now available.",
            });
            // Force a page refresh to update the UI
            window.location.reload();
          } else if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            toast({
              variant: "default",
              title: "Processing...",
              description: "Your subscription is being processed. Please refresh the page in a moment.",
            });
          }
        }
      }, 1000); // Poll every second
      
      // Clean up URL
      window.history.replaceState({}, "", "/profile");
      
      return () => clearInterval(pollInterval);
    } else if (params.get("canceled") === "true") {
      toast({
        variant: "default",
        title: "Payment canceled",
        description: "You can upgrade anytime from your profile.",
      });
      // Clean up URL
      window.history.replaceState({}, "", "/profile");
    }
  }, [user, supabase, toast]);

  // Handle upgrade to Pro
  const handleUpgrade = async () => {
    if (!isLoggedIn || !user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please log in to upgrade your account.",
      });
      return;
    }

    setIsLoadingCheckout(true);
    try {
      const response = await fetch("/api/stripe/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Check if response is actually JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text.substring(0, 200));
        throw new Error("Server returned an invalid response. Please check your configuration.");
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error: any) {
      console.error("Error creating checkout session:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to start checkout process. Please try again.",
      });
      setIsLoadingCheckout(false);
    }
  };

  const handleSave = async () => {
    if (!isLoggedIn || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .upsert({
          user_id: user.id,
          company_name: companyName,
          experience_level: experienceLevel,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;
      toast({
        variant: "success",
        title: "Profile updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update profile. Please try again.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isLoggedIn) {
    return <div>Please log in to view your profile.</div>;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex items-center gap-4 bg-card rounded-2xl p-6 shadow-lg border border-border">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold text-primary">Profile Settings</h1>
              <p className="text-muted-foreground text-lg">
                Manage your account information and preferences
              </p>
            </div>
          </div>

      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-card-foreground">Account Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium">Email</Label>
            <Input id="email" value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyName" className="font-medium">Company Name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experienceLevel" className="font-medium">Experience Level</Label>
            <select
              id="experienceLevel"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm focus:border-ring focus:ring-ring"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Expert">Expert</option>
            </select>
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md border-primary/20">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Subscription & Billing
          </CardTitle>
          <CardDescription>Manage your subscription plan</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoadingSubscription ? (
            <div className="text-muted-foreground">Loading subscription status...</div>
          ) : (
            <>
              <div className="space-y-2">
                <Label className="font-medium">Current Plan</Label>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold capitalize">
                    {subscription?.tier || "Free"}
                  </span>
                  {subscription?.status === "active" && subscription?.tier !== "free" && (
                    <span className="px-2 py-1 text-xs bg-green-500/20 text-green-600 rounded-full">
                      Active
                    </span>
                  )}
                </div>
                {subscription?.current_period_end && (
                  <p className="text-sm text-muted-foreground">
                    {subscription.tier !== "free" 
                      ? `Renews on ${new Date(subscription.current_period_end).toLocaleDateString()}`
                      : "No active subscription"}
                  </p>
                )}
              </div>

              {(subscription?.tier === "free" || !subscription) && (
                <div className="space-y-4 pt-4 border-t">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Upgrade to Pro</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Unlock advanced features and get the most out of our platform.
                    </p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Unlimited quote calculations
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Advanced AI recommendations
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Priority support
                      </li>
                      <li className="flex items-center gap-2 text-sm">
                        <Check className="w-4 h-4 text-primary" />
                        Export quotes to PDF
                      </li>
                    </ul>
                    <Button
                      onClick={handleUpgrade}
                      disabled={isLoadingCheckout}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      {isLoadingCheckout ? "Processing..." : "Upgrade to Pro"}
                    </Button>
                  </div>
                </div>
              )}

              {subscription?.tier === "pro" && subscription?.status === "active" && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    You&apos;re currently on the Pro plan. Thank you for your subscription!
                  </p>
                  <Button variant="outline" className="w-full" disabled>
                    Manage Subscription
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  );
}

