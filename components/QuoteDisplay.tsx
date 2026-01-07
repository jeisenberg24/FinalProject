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
          <CardTitle className="text-card-foreground">Quote Summary</CardTitle>
          <CardDescription className="text-muted-foreground">Service: {input.serviceType}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Price */}
          <div className="text-center p-6 bg-primary/20 rounded-lg border border-primary/30">
            <p className="text-sm text-foreground mb-2">Estimated Quote</p>
            <p className="text-4xl font-bold text-primary">
              {formatCurrency(quote.calculatedPrice)}
            </p>
            <p className="text-sm text-foreground mt-2">
              Range: {formatCurrency(quote.priceRange.min)} - {formatCurrency(quote.priceRange.max)}
            </p>
          </div>

          {/* Price Breakdown */}
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground">Price Breakdown</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between text-foreground">
                <span>Base Price:</span>
                <span>{formatCurrency(breakdown.basePrice)}</span>
              </div>
              {breakdown.marketAdjustment !== 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Market Demand ({input.marketDemand}):</span>
                  <span className="text-foreground">
                    {breakdown.marketAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.marketAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.complexityAdjustment !== 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Complexity ({input.complexity}):</span>
                  <span className="text-foreground">
                    {breakdown.complexityAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.complexityAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.emergencyPremium > 0 && (
                <div className="flex justify-between bg-destructive text-destructive-foreground font-semibold px-3 py-2 rounded">
                  <span>Emergency Premium:</span>
                  <span>+{formatCurrency(breakdown.emergencyPremium)}</span>
                </div>
              )}
              {breakdown.travelCost > 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Travel Cost:</span>
                  <span className="text-foreground">+{formatCurrency(breakdown.travelCost)}</span>
                </div>
              )}
              {breakdown.seasonalAdjustment !== 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Seasonal ({input.seasonalFactor}):</span>
                  <span className="text-foreground">
                    {breakdown.seasonalAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.seasonalAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.experienceAdjustment !== 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Experience ({input.experienceLevel}):</span>
                  <span className="text-foreground">
                    {breakdown.experienceAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.experienceAdjustment)}
                  </span>
                </div>
              )}
              {breakdown.equipmentCost > 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Equipment ({input.equipmentRequirements}):</span>
                  <span className="text-foreground">+{formatCurrency(breakdown.equipmentCost)}</span>
                </div>
              )}
              {input.materialsCost && input.materialsCost > 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Materials:</span>
                  <span className="text-foreground">+{formatCurrency(input.materialsCost)}</span>
                </div>
              )}
              {breakdown.competitorAdjustment && breakdown.competitorAdjustment !== 0 && (
                <div className="flex justify-between text-foreground">
                  <span className="text-muted-foreground">Competitor Adjustment:</span>
                  <span className="text-foreground">
                    {breakdown.competitorAdjustment > 0 ? "+" : ""}
                    {formatCurrency(breakdown.competitorAdjustment)}
                  </span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between font-semibold text-foreground">
                <span>Total:</span>
                <span>{formatCurrency(breakdown.finalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Quote Validity */}
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-foreground">
              Quote valid for <strong className="text-foreground">{quote.validityDays} days</strong>
            </p>
          </div>

          {/* Job Details Summary */}
          <div className="pt-4 border-t border-border space-y-2">
            <h3 className="font-semibold text-sm text-foreground">Job Details</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{input.complexity}</Badge>
              <Badge variant="outline">{input.marketDemand} Demand</Badge>
              <Badge variant="outline">{input.seasonalFactor} Season</Badge>
              {input.isEmergency && (
                <Badge variant="destructive" className="bg-destructive text-destructive-foreground">
                  Emergency
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

