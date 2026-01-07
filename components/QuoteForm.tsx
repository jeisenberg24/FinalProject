"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { QuoteInput } from "@/lib/calculations";
import { QuoteDisplay } from "./QuoteDisplay";
import { calculateQuote } from "@/lib/calculations";

const quoteSchema = z.object({
  marketRate: z.number().min(0, "Market rate must be positive"),
  marketDemand: z.enum(["High", "Medium", "Low"]),
  serviceType: z.string().min(1, "Service type is required"),
  isEmergency: z.boolean(),
  location: z.string().min(1, "Location is required"),
  complexity: z.enum(["Simple", "Moderate", "Complex"]),
  materialsCost: z.number().min(0).optional(),
  timeOfDay: z.string().optional(),
  seasonalFactor: z.enum(["Peak", "Normal", "Off-peak"]),
  competitorPricing: z.number().min(0).optional(),
  experienceLevel: z.enum(["Beginner", "Intermediate", "Expert"]),
  equipmentRequirements: z.enum(["Standard", "Specialized", "Heavy-duty"]),
  travelDistance: z.number().min(0).optional(),
});

type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  onSave?: (quote: any) => void;
  initialData?: Partial<QuoteFormData>;
}

export function QuoteForm({ onSave, initialData }: QuoteFormProps) {
  const [quoteResult, setQuoteResult] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      marketRate: initialData?.marketRate || 0,
      marketDemand: initialData?.marketDemand || "Medium",
      serviceType: initialData?.serviceType || "",
      isEmergency: initialData?.isEmergency || false,
      location: initialData?.location || "",
      complexity: initialData?.complexity || "Moderate",
      materialsCost: initialData?.materialsCost,
      timeOfDay: initialData?.timeOfDay,
      seasonalFactor: initialData?.seasonalFactor || "Normal",
      competitorPricing: initialData?.competitorPricing,
      experienceLevel: initialData?.experienceLevel || "Intermediate",
      equipmentRequirements: initialData?.equipmentRequirements || "Standard",
      travelDistance: initialData?.travelDistance,
    },
  });

  // Watch all form values for real-time calculation
  const formValues = watch();

  // Calculate quote whenever form values change
  useEffect(() => {
    const calculate = async () => {
      try {
        const input: QuoteInput = {
          marketRate: formValues.marketRate || 0,
          marketDemand: formValues.marketDemand || "Medium",
          serviceType: formValues.serviceType || "",
          isEmergency: formValues.isEmergency || false,
          location: formValues.location || "",
          complexity: formValues.complexity || "Moderate",
          materialsCost: formValues.materialsCost,
          timeOfDay: formValues.timeOfDay,
          seasonalFactor: formValues.seasonalFactor || "Normal",
          competitorPricing: formValues.competitorPricing,
          experienceLevel: formValues.experienceLevel || "Intermediate",
          equipmentRequirements: formValues.equipmentRequirements || "Standard",
          travelDistance: formValues.travelDistance,
        };

        // Only calculate if we have minimum required fields
        if (input.marketRate > 0 && input.serviceType && input.location) {
          setIsCalculating(true);
          const result = calculateQuote(input);
          setQuoteResult(result);
          setIsCalculating(false);
        } else {
          setQuoteResult(null);
        }
      } catch (error) {
        console.error("Error calculating quote:", error);
        setIsCalculating(false);
      }
    };

    // Debounce calculation
    const timeoutId = setTimeout(calculate, 300);
    return () => clearTimeout(timeoutId);
  }, [formValues]);

  const onSubmit = (data: QuoteFormData) => {
    if (quoteResult && onSave) {
      onSave({
        ...data,
        calculatedPrice: quoteResult.calculatedPrice,
        priceRangeMin: quoteResult.priceRange.min,
        priceRangeMax: quoteResult.priceRange.max,
        priceBreakdown: quoteResult.breakdown,
        quoteValidityDays: quoteResult.validityDays,
      });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Market Rate */}
          <div className="space-y-2">
            <Label htmlFor="marketRate">Market Rate ($)</Label>
            <Input
              id="marketRate"
              type="number"
              step="0.01"
              {...register("marketRate", { valueAsNumber: true })}
            />
            {errors.marketRate && (
              <p className="text-sm text-destructive">{errors.marketRate.message}</p>
            )}
          </div>

          {/* Market Demand */}
          <div className="space-y-2">
            <Label htmlFor="marketDemand">Market Demand</Label>
            <Select
              value={formValues.marketDemand}
              onValueChange={(value) => setValue("marketDemand", value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select demand level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Service Type */}
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="serviceType">Service Type</Label>
            <Textarea
              id="serviceType"
              placeholder="Describe the service..."
              {...register("serviceType")}
            />
            {errors.serviceType && (
              <p className="text-sm text-destructive">{errors.serviceType.message}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" {...register("location")} />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          {/* Travel Distance */}
          <div className="space-y-2">
            <Label htmlFor="travelDistance">Travel Distance (miles)</Label>
            <Input
              id="travelDistance"
              type="number"
              step="0.1"
              {...register("travelDistance", { valueAsNumber: true })}
            />
          </div>

          {/* Complexity */}
          <div className="space-y-2">
            <Label htmlFor="complexity">Complexity</Label>
            <Select
              value={formValues.complexity}
              onValueChange={(value) => setValue("complexity", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Simple">Simple</SelectItem>
                <SelectItem value="Moderate">Moderate</SelectItem>
                <SelectItem value="Complex">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Experience Level */}
          <div className="space-y-2">
            <Label htmlFor="experienceLevel">Experience Level</Label>
            <Select
              value={formValues.experienceLevel}
              onValueChange={(value) => setValue("experienceLevel", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Expert">Expert</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Equipment Requirements */}
          <div className="space-y-2">
            <Label htmlFor="equipmentRequirements">Equipment Requirements</Label>
            <Select
              value={formValues.equipmentRequirements}
              onValueChange={(value) => setValue("equipmentRequirements", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Specialized">Specialized</SelectItem>
                <SelectItem value="Heavy-duty">Heavy-duty</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Seasonal Factor */}
          <div className="space-y-2">
            <Label htmlFor="seasonalFactor">Seasonal Factor</Label>
            <Select
              value={formValues.seasonalFactor}
              onValueChange={(value) => setValue("seasonalFactor", value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Peak">Peak</SelectItem>
                <SelectItem value="Normal">Normal</SelectItem>
                <SelectItem value="Off-peak">Off-peak</SelectItem>
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
              {...register("materialsCost", { valueAsNumber: true })}
            />
          </div>

          {/* Competitor Pricing */}
          <div className="space-y-2">
            <Label htmlFor="competitorPricing">Competitor Pricing ($) - Optional</Label>
            <Input
              id="competitorPricing"
              type="number"
              step="0.01"
              {...register("competitorPricing", { valueAsNumber: true })}
            />
          </div>

          {/* Emergency Service */}
          <div className="flex items-center space-x-2 md:col-span-2">
            <Checkbox
              id="isEmergency"
              checked={formValues.isEmergency}
              onCheckedChange={(checked) => setValue("isEmergency", checked as boolean)}
            />
            <Label htmlFor="isEmergency" className="cursor-pointer">
              Emergency Service
            </Label>
          </div>

          {/* Time of Day (if emergency) */}
          {formValues.isEmergency && (
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="timeOfDay">Time of Day</Label>
              <Select
                value={formValues.timeOfDay}
                onValueChange={(value) => setValue("timeOfDay", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time of day" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning</SelectItem>
                  <SelectItem value="afternoon">Afternoon</SelectItem>
                  <SelectItem value="evening">Evening</SelectItem>
                  <SelectItem value="night">Night</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {onSave && (
          <Button type="submit" disabled={!quoteResult || isCalculating} className="w-full">
            {isCalculating ? "Calculating..." : "Save Quote"}
          </Button>
        )}
      </form>

      {/* Quote Display */}
      {quoteResult && (
        <QuoteDisplay quote={quoteResult} input={formValues as any} />
      )}
    </div>
  );
}



