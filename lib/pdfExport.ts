import jsPDF from "jspdf";
import { QuoteResult, PriceBreakdown, formatCurrency } from "@/lib/calculations";
import { QuoteInput } from "@/lib/calculations";

export function generateQuotePDF(quote: QuoteResult, input: QuoteInput, companyName?: string) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let yPos = margin;

  // Helper function to add a new page if needed
  const checkPageBreak = (requiredSpace: number) => {
    if (yPos + requiredSpace > pageHeight - margin) {
      doc.addPage();
      yPos = margin;
    }
  };

  // Title
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0); // Black
  doc.text("Service Quote", pageWidth / 2, yPos, { align: "center" });
  yPos += 10;

  // Company name (if provided)
  if (companyName) {
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    doc.text(companyName, pageWidth / 2, yPos, { align: "center" });
    yPos += 8;
  }

  // Date
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 10;

  // Service Type
  doc.setFontSize(14);
  doc.text(`Service: ${input.serviceType}`, margin, yPos);
  yPos += 8;

  // Location
  doc.setFontSize(12);
  doc.text(`Location: ${input.location}`, margin, yPos);
  yPos += 10;

  // Main Price
  checkPageBreak(20);
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  doc.text("Estimated Quote", pageWidth / 2, yPos, { align: "center" });
  yPos += 8;
  doc.setFontSize(24);
  doc.setFont(undefined, "bold");
  doc.text(formatCurrency(quote.calculatedPrice), pageWidth / 2, yPos, { align: "center" });
  doc.setFont(undefined, "normal");
  yPos += 6;
  doc.setFontSize(10);
  doc.text(
    `Range: ${formatCurrency(quote.priceRange.min)} - ${formatCurrency(quote.priceRange.max)}`,
    pageWidth / 2,
    yPos,
    { align: "center" }
  );
  yPos += 15;

  // Price Breakdown
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Price Breakdown", margin, yPos);
  yPos += 8;
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  const breakdown = quote.breakdown;
  const lineHeight = 6;

  // Base Price
  doc.text("Base Price:", margin, yPos);
  doc.text(formatCurrency(breakdown.basePrice), pageWidth - margin, yPos, { align: "right" });
  yPos += lineHeight;

  // Market Adjustment
  if (breakdown.marketAdjustment !== 0) {
    doc.text(`Market Demand (${input.marketDemand}):`, margin, yPos);
    doc.text(
      `${breakdown.marketAdjustment > 0 ? "+" : ""}${formatCurrency(breakdown.marketAdjustment)}`,
      pageWidth - margin,
      yPos,
      { align: "right" }
    );
    yPos += lineHeight;
  }

  // Complexity Adjustment
  if (breakdown.complexityAdjustment !== 0) {
    doc.text(`Complexity (${input.complexity}):`, margin, yPos);
    doc.text(
      `${breakdown.complexityAdjustment > 0 ? "+" : ""}${formatCurrency(breakdown.complexityAdjustment)}`,
      pageWidth - margin,
      yPos,
      { align: "right" }
    );
    yPos += lineHeight;
  }

  // Emergency Premium
  if (breakdown.emergencyPremium > 0) {
    doc.setFont(undefined, "bold");
    doc.text("Emergency Premium:", margin, yPos);
    doc.text(`+${formatCurrency(breakdown.emergencyPremium)}`, pageWidth - margin, yPos, { align: "right" });
    doc.setFont(undefined, "normal");
    yPos += lineHeight;
  }

  // Travel Cost
  if (breakdown.travelCost > 0) {
    doc.text("Travel Cost:", margin, yPos);
    doc.text(`+${formatCurrency(breakdown.travelCost)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += lineHeight;
  }

  // Seasonal Adjustment
  if (breakdown.seasonalAdjustment !== 0) {
    doc.text(`Seasonal (${input.seasonalFactor}):`, margin, yPos);
    doc.text(
      `${breakdown.seasonalAdjustment > 0 ? "+" : ""}${formatCurrency(breakdown.seasonalAdjustment)}`,
      pageWidth - margin,
      yPos,
      { align: "right" }
    );
    yPos += lineHeight;
  }

  // Experience Adjustment
  if (breakdown.experienceAdjustment !== 0) {
    doc.text(`Experience (${input.experienceLevel}):`, margin, yPos);
    doc.text(
      `${breakdown.experienceAdjustment > 0 ? "+" : ""}${formatCurrency(breakdown.experienceAdjustment)}`,
      pageWidth - margin,
      yPos,
      { align: "right" }
    );
    yPos += lineHeight;
  }

  // Equipment Cost
  if (breakdown.equipmentCost > 0) {
    doc.text(`Equipment (${input.equipmentRequirements}):`, margin, yPos);
    doc.text(`+${formatCurrency(breakdown.equipmentCost)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += lineHeight;
  }

  // Materials Cost
  if (input.materialsCost && input.materialsCost > 0) {
    doc.text("Materials:", margin, yPos);
    doc.text(`+${formatCurrency(input.materialsCost)}`, pageWidth - margin, yPos, { align: "right" });
    yPos += lineHeight;
  }

  // Competitor Adjustment
  if (breakdown.competitorAdjustment && breakdown.competitorAdjustment !== 0) {
    doc.text("Competitor Adjustment:", margin, yPos);
    doc.text(
      `${breakdown.competitorAdjustment > 0 ? "+" : ""}${formatCurrency(breakdown.competitorAdjustment)}`,
      pageWidth - margin,
      yPos,
      { align: "right" }
    );
    yPos += lineHeight;
  }

  // Total
  yPos += 3;
  doc.setDrawColor(0, 0, 0);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 6;
  doc.setFont(undefined, "bold");
  doc.setFontSize(12);
  doc.text("Total:", margin, yPos);
  doc.text(formatCurrency(breakdown.finalPrice), pageWidth - margin, yPos, { align: "right" });
  doc.setFont(undefined, "normal");
  yPos += 10;

  // Job Details
  checkPageBreak(30);
  doc.setFontSize(14);
  doc.setFont(undefined, "bold");
  doc.text("Job Details", margin, yPos);
  yPos += 8;
  doc.setFont(undefined, "normal");
  doc.setFontSize(10);

  doc.text(`Complexity: ${input.complexity}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Market Demand: ${input.marketDemand}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Seasonal Factor: ${input.seasonalFactor}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Experience Level: ${input.experienceLevel}`, margin, yPos);
  yPos += lineHeight;
  doc.text(`Equipment Requirements: ${input.equipmentRequirements}`, margin, yPos);
  yPos += lineHeight;
  if (input.isEmergency) {
    doc.setFont(undefined, "bold");
    doc.text("Emergency Service: Yes", margin, yPos);
    doc.setFont(undefined, "normal");
    yPos += lineHeight;
  }
  if (input.timeOfDay) {
    doc.text(`Time of Day: ${input.timeOfDay}`, margin, yPos);
    yPos += lineHeight;
  }
  if (input.competitorPricing) {
    doc.text(`Competitor Pricing: ${formatCurrency(input.competitorPricing)}`, margin, yPos);
    yPos += lineHeight;
  }

  // Quote Validity
  yPos += 5;
  doc.setFontSize(10);
  doc.text(`Quote valid for ${quote.validityDays} days`, margin, yPos);

  // Footer
  const footerY = pageHeight - 15;
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text("This quote is an estimate and may vary based on final job requirements.", pageWidth / 2, footerY, {
    align: "center",
  });

  return doc;
}


