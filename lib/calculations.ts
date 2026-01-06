/**
 * Core pricing calculation logic for Service Quote Calculator
 */

export interface QuoteInput {
  marketRate: number;
  marketDemand: "High" | "Medium" | "Low";
  serviceType: string;
  isEmergency: boolean;
  location: string;
  complexity: "Simple" | "Moderate" | "Complex";
  materialsCost?: number;
  timeOfDay?: string;
  seasonalFactor: "Peak" | "Normal" | "Off-peak";
  competitorPricing?: number;
  experienceLevel: "Beginner" | "Intermediate" | "Expert";
  equipmentRequirements: "Standard" | "Specialized" | "Heavy-duty";
  travelDistance?: number; // in miles/km
}

export interface PriceBreakdown {
  basePrice: number;
  marketAdjustment: number;
  complexityAdjustment: number;
  emergencyPremium: number;
  travelCost: number;
  seasonalAdjustment: number;
  experienceAdjustment: number;
  equipmentCost: number;
  competitorAdjustment?: number;
  subtotal: number;
  finalPrice: number;
  priceRangeMin: number;
  priceRangeMax: number;
}

export interface QuoteResult {
  calculatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  breakdown: PriceBreakdown;
  validityDays: number;
}

// Multipliers
const MARKET_DEMAND_MULTIPLIERS = {
  High: 1.15,
  Medium: 1.0,
  Low: 0.9,
};

const COMPLEXITY_MULTIPLIERS = {
  Simple: 0.9,
  Moderate: 1.0,
  Complex: 1.2,
};

const SEASONAL_MULTIPLIERS = {
  Peak: 1.15,
  Normal: 1.0,
  "Off-peak": 0.9,
};

const EXPERIENCE_MULTIPLIERS = {
  Beginner: 0.95,
  Intermediate: 1.0,
  Expert: 1.1,
};

const EQUIPMENT_COSTS = {
  Standard: 0,
  Specialized: 50,
  "Heavy-duty": 150,
};

const TRAVEL_RATE_PER_MILE = 0.65; // $0.65 per mile
const EMERGENCY_BASE_PREMIUM = 0.5; // 50% of base
const EMERGENCY_AFTER_HOURS_PREMIUM = 0.25; // Additional 25% for after hours
const CONFIDENCE_INTERVAL = 0.1; // 10% variance for price range

/**
 * Calculate quote price based on input parameters
 */
export function calculateQuote(input: QuoteInput): QuoteResult {
  let price = input.marketRate;
  const breakdown: PriceBreakdown = {
    basePrice: input.marketRate,
    marketAdjustment: 0,
    complexityAdjustment: 0,
    emergencyPremium: 0,
    travelCost: 0,
    seasonalAdjustment: 0,
    experienceAdjustment: 0,
    equipmentCost: 0,
    subtotal: 0,
    finalPrice: 0,
    priceRangeMin: 0,
    priceRangeMax: 0,
  };

  // 1. Market Demand Adjustment
  const marketMultiplier = MARKET_DEMAND_MULTIPLIERS[input.marketDemand];
  price = price * marketMultiplier;
  breakdown.marketAdjustment = price - breakdown.basePrice;

  // 2. Complexity Adjustment
  const complexityMultiplier = COMPLEXITY_MULTIPLIERS[input.complexity];
  const priceBeforeComplexity = price;
  price = price * complexityMultiplier;
  breakdown.complexityAdjustment = price - priceBeforeComplexity;

  // 3. Emergency Premium
  if (input.isEmergency) {
    const emergencyBase = breakdown.basePrice * EMERGENCY_BASE_PREMIUM;
    let afterHoursPremium = 0;
    
    // Check if after hours (assuming evening/night times)
    if (input.timeOfDay && (input.timeOfDay.includes("evening") || input.timeOfDay.includes("night"))) {
      afterHoursPremium = breakdown.basePrice * EMERGENCY_AFTER_HOURS_PREMIUM;
    }
    
    breakdown.emergencyPremium = emergencyBase + afterHoursPremium;
    price += breakdown.emergencyPremium;
  }

  // 4. Travel Cost
  if (input.travelDistance && input.travelDistance > 0) {
    breakdown.travelCost = input.travelDistance * TRAVEL_RATE_PER_MILE;
    price += breakdown.travelCost;
  }

  // 5. Seasonal Adjustment
  const seasonalMultiplier = SEASONAL_MULTIPLIERS[input.seasonalFactor];
  const priceBeforeSeasonal = price;
  price = price * seasonalMultiplier;
  breakdown.seasonalAdjustment = price - priceBeforeSeasonal;

  // 6. Experience Level Adjustment
  const experienceMultiplier = EXPERIENCE_MULTIPLIERS[input.experienceLevel];
  const priceBeforeExperience = price;
  price = price * experienceMultiplier;
  breakdown.experienceAdjustment = price - priceBeforeExperience;

  // 7. Equipment Cost
  breakdown.equipmentCost = EQUIPMENT_COSTS[input.equipmentRequirements];
  price += breakdown.equipmentCost;

  // 8. Materials Cost
  if (input.materialsCost && input.materialsCost > 0) {
    price += input.materialsCost;
  }

  // 9. Competitor Pricing Consideration (optional adjustment)
  if (input.competitorPricing && input.competitorPricing > 0) {
    const competitorDiff = input.competitorPricing - price;
    // If competitor is significantly lower, adjust slightly (max 5% reduction)
    if (competitorDiff < -price * 0.1) {
      const adjustment = Math.min(Math.abs(competitorDiff) * 0.1, price * 0.05);
      breakdown.competitorAdjustment = -adjustment;
      price -= adjustment;
    } else if (competitorDiff > price * 0.1) {
      // If competitor is significantly higher, we can adjust up slightly
      const adjustment = Math.min(competitorDiff * 0.1, price * 0.05);
      breakdown.competitorAdjustment = adjustment;
      price += adjustment;
    }
  }

  breakdown.subtotal = price;
  breakdown.finalPrice = price;

  // Calculate price range (confidence interval)
  const variance = price * CONFIDENCE_INTERVAL;
  breakdown.priceRangeMin = Math.max(0, price - variance);
  breakdown.priceRangeMax = price + variance;

  // Calculate validity period
  const validityDays = input.isEmergency ? 7 : 30;

  return {
    calculatedPrice: Math.round(price * 100) / 100, // Round to 2 decimal places
    priceRange: {
      min: Math.round(breakdown.priceRangeMin * 100) / 100,
      max: Math.round(breakdown.priceRangeMax * 100) / 100,
    },
    breakdown,
    validityDays,
  };
}

/**
 * Format currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

