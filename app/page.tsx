"use client";

import { useAuth } from "@/hooks/useAuth";
import { QuoteForm } from "@/components/QuoteForm";
import { QuoteDisplay } from "@/components/QuoteDisplay";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { calculateQuote, QuoteInput } from "@/lib/calculations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Calculator, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { isLoggedIn, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Form state
  const [marketRate, setMarketRate] = useState<number>(0);
  const [laborHours, setLaborHours] = useState<number>(0);
  const [travelTime, setTravelTime] = useState<number>(0);
  const [complexity, setComplexity] = useState<"Simple" | "Moderate" | "Complex" | "Expert">("Moderate");
  const [experienceLevel, setExperienceLevel] = useState<"Entry" | "Standard" | "Pro" | "Expert">("Standard");
  const [materialsCost, setMaterialsCost] = useState<number>(0);
  const [equipmentCost, setEquipmentCost] = useState<number>(0);
  const [marketDemand, setMarketDemand] = useState<"Low" | "Normal" | "High" | "Peak">("Normal");
  const [seasonalFactor, setSeasonalFactor] = useState<"Off-season" | "Standard" | "Busy season">("Standard");
  const [timeOfDay, setTimeOfDay] = useState<"Normal hours" | "Evening/Weekend">("Normal hours");
  const [competitorPrice, setCompetitorPrice] = useState<number | undefined>(undefined);
  const [isEmergency, setIsEmergency] = useState<boolean>(false);
  const [serviceType, setServiceType] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  // Redirect to login if not logged in - but wait a bit for OAuth callback to complete
  useEffect(() => {
    // Give OAuth callback time to complete (2 seconds)
    const timer = setTimeout(() => {
      if (!authLoading && !isLoggedIn) {
        router.push("/login");
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoggedIn, authLoading, router]);

  // Calculate quote when inputs change
  useEffect(() => {
    if (marketRate > 0 && laborHours > 0 && serviceType && location) {
      setIsCalculating(true);
      const timeoutId = setTimeout(() => {
        try {
          // Calculate base price: market rate * labor hours
          const basePrice = marketRate * laborHours;
          
          const input: QuoteInput = {
            marketRate: basePrice, // Pass the calculated base price
            marketDemand: marketDemand === "Low" ? "Low" : marketDemand === "High" ? "High" : marketDemand === "Peak" ? "High" : "Medium",
            serviceType,
            isEmergency,
            location,
            complexity: complexity === "Expert" ? "Complex" : complexity,
            materialsCost: materialsCost > 0 ? materialsCost : undefined,
            timeOfDay: timeOfDay === "Evening/Weekend" ? "evening" : undefined,
            seasonalFactor: seasonalFactor === "Off-season" ? "Off-peak" : seasonalFactor === "Busy season" ? "Peak" : "Normal",
            competitorPricing: competitorPrice,
            experienceLevel: experienceLevel === "Entry" ? "Beginner" : experienceLevel === "Pro" ? "Expert" : experienceLevel === "Expert" ? "Expert" : "Intermediate",
            equipmentRequirements: equipmentCost > 0 ? (equipmentCost > 100 ? "Heavy-duty" : "Specialized") : "Standard",
            travelDistance: travelTime > 0 ? travelTime * 30 : undefined, // Convert hours to approximate miles
          };
          const result = calculateQuote(input);
          setQuoteResult(result);
        } catch (error) {
          console.error("Error calculating quote:", error);
        } finally {
          setIsCalculating(false);
        }
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setQuoteResult(null);
    }
  }, [marketRate, laborHours, travelTime, complexity, experienceLevel, materialsCost, equipmentCost, marketDemand, seasonalFactor, timeOfDay, competitorPrice, isEmergency, serviceType, location]);

  const handleReset = () => {
    setMarketRate(0);
    setLaborHours(0);
    setTravelTime(0);
    setComplexity("Moderate");
    setExperienceLevel("Standard");
    setMaterialsCost(0);
    setEquipmentCost(0);
    setMarketDemand("Normal");
    setSeasonalFactor("Standard");
    setTimeOfDay("Normal hours");
    setCompetitorPrice(undefined);
    setIsEmergency(false);
    setServiceType("");
    setLocation("");
    setQuoteResult(null);
  };

  if (authLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  // Don't render calculator if not logged in (will redirect)
  if (!isLoggedIn) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">ServiceQuote Pro</h1>
          </div>
          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/quotes" className="text-sm text-gray-600 hover:text-gray-900">
                My Quotes
              </Link>
              <Link href="/dashboard" className="text-sm text-gray-600 hover:text-gray-900">
                Dashboard
              </Link>
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" size="sm" className="border-gray-300">
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Market-smart quotes in minutes</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Quote Inputs */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Quote Inputs</h3>
              <div className="space-y-4">
                {/* Regional Market Rate */}
                <div className="space-y-2">
                  <Label htmlFor="marketRate">Regional Market Rate ($/hr)</Label>
                  <Input
                    id="marketRate"
                    type="number"
                    step="0.01"
                    value={marketRate || ""}
                    onChange={(e) => setMarketRate(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Estimated Labor Hours */}
                <div className="space-y-2">
                  <Label htmlFor="laborHours">Estimated Labor Hours</Label>
                  <Input
                    id="laborHours"
                    type="number"
                    step="0.5"
                    value={laborHours || ""}
                    onChange={(e) => setLaborHours(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Travel Time */}
                <div className="space-y-2">
                  <Label htmlFor="travelTime">Travel Time (hours)</Label>
                  <Input
                    id="travelTime"
                    type="number"
                    step="0.5"
                    value={travelTime || ""}
                    onChange={(e) => setTravelTime(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Job Complexity */}
                <div className="space-y-2">
                  <Label htmlFor="complexity">Job Complexity</Label>
                  <Select value={complexity} onValueChange={(value: any) => setComplexity(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Simple">Simple</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="Complex">Complex</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience Level */}
                <div className="space-y-2">
                  <Label htmlFor="experienceLevel">Experience Level</Label>
                  <Select value={experienceLevel} onValueChange={(value: any) => setExperienceLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Entry">Entry (discount)</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Pro">Pro</SelectItem>
                      <SelectItem value="Expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Materials Cost */}
                <div className="space-y-2">
                  <Label htmlFor="materialsCost">Materials Cost ($)</Label>
                  <Input
                    id="materialsCost"
                    type="number"
                    step="0.01"
                    value={materialsCost || ""}
                    onChange={(e) => setMaterialsCost(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Equipment/Rental */}
                <div className="space-y-2">
                  <Label htmlFor="equipmentCost">Equipment/Rental ($)</Label>
                  <Input
                    id="equipmentCost"
                    type="number"
                    step="0.01"
                    value={equipmentCost || ""}
                    onChange={(e) => setEquipmentCost(parseFloat(e.target.value) || 0)}
                  />
                </div>

                {/* Market Demand */}
                <div className="space-y-2">
                  <Label htmlFor="marketDemand">Market Demand</Label>
                  <Select value={marketDemand} onValueChange={(value: any) => setMarketDemand(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Peak">Peak</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Seasonal Factor */}
                <div className="space-y-2">
                  <Label htmlFor="seasonalFactor">Seasonal Factor</Label>
                  <Select value={seasonalFactor} onValueChange={(value: any) => setSeasonalFactor(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Off-season">Off-season</SelectItem>
                      <SelectItem value="Standard">Standard</SelectItem>
                      <SelectItem value="Busy season">Busy season</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Time of Day */}
                <div className="space-y-2">
                  <Label htmlFor="timeOfDay">Time of Day</Label>
                  <Select value={timeOfDay} onValueChange={(value: any) => setTimeOfDay(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal hours">Normal hours</SelectItem>
                      <SelectItem value="Evening/Weekend">Evening/Weekend</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Competitor Price */}
                <div className="space-y-2">
                  <Label htmlFor="competitorPrice">Competitor Price (optional)</Label>
                  <Input
                    id="competitorPrice"
                    type="number"
                    step="0.01"
                    value={competitorPrice || ""}
                    onChange={(e) => setCompetitorPrice(e.target.value ? parseFloat(e.target.value) : undefined)}
                    placeholder="Optional"
                  />
                </div>

                {/* Emergency job */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isEmergency"
                    checked={isEmergency}
                    onCheckedChange={(checked) => setIsEmergency(checked as boolean)}
                  />
                  <Label htmlFor="isEmergency" className="cursor-pointer">
                    Emergency job
                  </Label>
                </div>

                {/* Service Type and Location - hidden but needed for calculation */}
                <div className="space-y-2">
                  <Label htmlFor="serviceType">Service Type</Label>
                  <Input
                    id="serviceType"
                    value={serviceType}
                    onChange={(e) => setServiceType(e.target.value)}
                    placeholder="Describe the service"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Service location"
                  />
                </div>

                {/* Buttons */}
                <div className="flex gap-2 pt-4">
                  <Button
                    type="button"
                    onClick={handleReset}
                    variant="outline"
                    className="flex-1"
                  >
                    Reset
                  </Button>
                  {isLoggedIn && (
                    <Link href="/quote/new" className="flex-1">
                      <Button variant="outline" className="w-full">
                        Save
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold mb-6">Results</h3>
              {quoteResult ? (
                <div className="space-y-6">
                  {/* Estimated Quote */}
                  <div className="text-center p-6 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <p className="text-sm text-gray-600 mb-2">Estimated Quote</p>
                    <p className="text-4xl font-bold text-blue-600">
                      ${quoteResult.calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Price Range */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Price Range</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ${quoteResult.priceRange.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - ${quoteResult.priceRange.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>

                  {/* Validity */}
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">Validity</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {quoteResult.validityDays} days
                    </p>
                  </div>

                  {/* Pricing Tiers */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Pricing Tiers</h4>
                    <div className="space-y-2">
                      <div className="p-3 bg-gray-50 rounded border">
                        <div className="font-medium text-gray-900">Basic</div>
                        <div className="text-sm text-gray-600">Standard scheduling, essentials only</div>
                        <div className="text-lg font-semibold text-gray-900 mt-1">
                          ${quoteResult.priceRange.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded border border-blue-200">
                        <div className="font-medium text-blue-900">Premium</div>
                        <div className="text-sm text-blue-700">Priority scheduling, extended warranty</div>
                        <div className="text-lg font-semibold text-blue-900 mt-1">
                          ${quoteResult.calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                      {isEmergency && (
                        <div className="p-3 bg-red-50 rounded border border-red-200">
                          <div className="font-medium text-red-900">Emergency</div>
                          <div className="text-sm text-red-700">Immediate dispatch</div>
                          <div className="text-lg font-semibold text-red-900 mt-1">
                            ${quoteResult.calculatedPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="space-y-2 pt-4 border-t">
                    <h4 className="font-semibold text-gray-900">Breakdown</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Base Price:</span>
                        <span className="font-medium">${quoteResult.breakdown.basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      {quoteResult.breakdown.marketAdjustment !== 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Market Adjustment:</span>
                          <span>${quoteResult.breakdown.marketAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {quoteResult.breakdown.complexityAdjustment !== 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Complexity:</span>
                          <span>${quoteResult.breakdown.complexityAdjustment.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {quoteResult.breakdown.emergencyPremium > 0 && (
                        <div className="flex justify-between text-red-600">
                          <span>Emergency Premium:</span>
                          <span>+${quoteResult.breakdown.emergencyPremium.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {materialsCost > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Materials:</span>
                          <span>${materialsCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      {equipmentCost > 0 && (
                        <div className="flex justify-between text-gray-600">
                          <span>Equipment:</span>
                          <span>${equipmentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-2 border-t">
                        <span>Total:</span>
                        <span>${quoteResult.breakdown.finalPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400">
                  <p>Fill in the quote inputs to see results</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>© ServiceQuote Pro</p>
        </div>
      </footer>
    </div>
  );
}
