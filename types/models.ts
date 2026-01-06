/**
 * Type definitions for Quote Calculator models
 */

export interface User {
  id: string;
  email: string;
  company_name?: string;
  experience_level?: "Beginner" | "Intermediate" | "Expert";
  created_at?: string;
  updated_at?: string;
}

export interface Quote {
  id: string;
  user_id: string;
  service_type: string;
  market_rate: number;
  market_demand: "High" | "Medium" | "Low";
  is_emergency: boolean;
  location: string;
  complexity: "Simple" | "Moderate" | "Complex";
  materials_cost?: number;
  time_of_day?: string;
  seasonal_factor: "Peak" | "Normal" | "Off-peak";
  competitor_pricing?: number;
  experience_level: "Beginner" | "Intermediate" | "Expert";
  equipment_requirements: "Standard" | "Specialized" | "Heavy-duty";
  calculated_price: number;
  price_range_min: number;
  price_range_max: number;
  price_breakdown: Record<string, any>;
  quote_validity_days: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_subscription_id?: string;
  stripe_customer_id?: string;
  status: "active" | "canceled" | "past_due" | "trialing";
  tier: "free" | "premium" | "pro";
  current_period_end?: string;
  created_at: string;
}

export interface QuoteHistory {
  id: string;
  quote_id: string;
  action: "created" | "updated" | "deleted" | "sent";
  metadata?: Record<string, any>;
  created_at: string;
}

