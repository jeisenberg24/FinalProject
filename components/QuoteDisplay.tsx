"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteResult, PriceBreakdown, formatCurrency } from "@/lib/calculations";
import { QuoteInput } from "@/lib/calculations";
import { Badge } from "@/components/ui/badge";

interface QuoteDisplayProps {
  quote: QuoteResult;
  input: QuoteInput;
}

export function QuoteDisplay({ quote, input }: QuoteDisplayProps) {
  const breakdown = quote.breakdown;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quote Summary</CardTitle>
          <CardDescription>Service: {input.serviceType}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Price */}
          <div className="text-center p-6 bg-primary/10 rounded-lg">
            <p className="text-sm text-muted-foreground mb-2">Estimated Quote</p>
            <p className="text-4xl font-bold text-primary">
              {formatCurrency(quote.calculatedPrice)}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Range: {formatCurrency(quote.priceRange.min)} - {formatCurrency(quote.priceRange.max)}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <h3 className="font-semibold">Price Breakdown</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Base Price:</span>
                <span>{formatCurrency(breakdown.basePrice)}</span>
              </div>
              {breakdown.marketAdjustment !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Market Demand ({input.marketDemand}):</span>
                  <span>
                    {breakdown.marketAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.marketAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.complexityAdjustment !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Complexity ({input.complexity}):</span>
                  <span>
                    {breakdown.complexityAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.complexityAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.emergencyPremium > 0 && (
                <div className="flex justify-between text-destructive">
                  <span>Emergency Premium:</span>
                  <span>+{formatCurrency(breakdown.emergencyPremium)}</span>
                </div>
              )}
              {breakdown.travelCost > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Travel Cost:</span>
                  <span>+{formatCurrency(breakdown.travelCost)}</span>
                </div>
              )}
              {breakdown.seasonalAdjustment !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Seasonal ({input.seasonalFactor}):</span>
                  <span>
                    {breakdown.seasonalAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.seasonalAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.experienceAdjustment !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Experience ({input.experienceLevel}):</span>
                  <span>
                    {breakdown.experienceAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.experienceAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.equipmentCost > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Equipment ({input.equipmentRequirements}):</span>
                  <span>+{formatCurrency(breakdown.equipmentCost)}</span>
                </div>
              )}
              {input.materialsCost && input.materialsCost > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Materials:</span>
                  <span>+{formatCurrency(input.materialsCost)}</span>
                </div>
              )}
              {breakdown.competitorAdjustment && breakdown.competitorAdjustment !== 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Competitor Adjustment:</span>
                  <span>
                    {breakdown.competitorAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.competitorAdjustment)}
                  </span>
                </div>
              )}
              <div className="border-t pt-2 mt-2 flex justify-between font-semibold">
                <span>Total:</span>
                <span>{formatCurrency(breakdown.finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Quote Validity */}
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Quote valid for <strong>{quote.validityDays} days</strong>
            </p>
          </div>

          {/* Job Details Summary */}
          <div className="pt-4 border-t space-y-2">
            <h3 className="font-semibold text-sm">Job Details</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{input.complexity}</Badge>
              <Badge variant="outline">{input.marketDemand} Demand</Badge>
              <Badge variant="outline">{input.seasonalFactor} Season</Badge>
              {input.isEmergency && <Badge variant="destructive">Emergency</Badge>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

