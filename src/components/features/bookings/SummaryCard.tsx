// components/features/bookings/SummaryCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, IndianRupee, Info, TrendingUp, User, Zap } from "lucide-react";
import type { ChargeInfo } from "./booking.types";

interface SummaryCardProps {
  chargeInfo: ChargeInfo | null;
  chargeCalc: {
    durationHours: number;
    totalCharge: number;
    breakdown?: {
      freeHours: number;
      billableHours: number;
    };
  } | null;
  selectedTimeSlots: string[];
}

export function SummaryCard({ chargeInfo, chargeCalc, selectedTimeSlots }: SummaryCardProps) {
  // If no slots selected, show nothing
  if (selectedTimeSlots.length === 0 || !chargeCalc) {
    return null;
  }

  const getTierBadgeVariant = (tier: string) => {
    switch (tier) {
      case "new_customer":
        return "default";
      case "existing_free_tier":
        return "default"; // Green/Success variant if available
      case "existing_high_usage":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getTierLabel = (tier: string) => {
    switch (tier) {
      case "new_customer":
        return "New Customer";
      case "existing_free_tier":
        return "Free Tier";
      case "existing_high_usage":
        return "Standard Tier";
      default:
        return "Existing Customer";
    }
  };

  return (
    <Card className="mt-6 border-2 border-primary/20 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <IndianRupee className="h-5 w-5" />
          Booking Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer Tier (Only if ChargeInfo is known) */}
        {chargeInfo && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>Customer Status</span>
            </div>
            <Badge variant={getTierBadgeVariant(chargeInfo.tier)}>
              {getTierLabel(chargeInfo.tier)}
            </Badge>
          </div>
        )}

        {/* Monthly Usage (Only if Existing Customer) */}
        {chargeInfo?.is_existing_customer && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <TrendingUp className="h-4 w-4" />
              <span>Used Month-to-Date</span>
            </div>
            <span className="font-semibold">
              {chargeInfo.monthly_hours.toFixed(1)} / 10.0 hours
            </span>
          </div>
        )}

        {/* Breakdown for Split Pricing (Existing Customers crossing threshold) */}
        {chargeInfo?.is_existing_customer && chargeCalc.breakdown && (
          (chargeCalc.breakdown.freeHours > 0 && chargeCalc.breakdown.billableHours > 0) ? (
            <div className="bg-background/50 p-3 rounded-md border border-border space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span>Split Pricing Applied</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Free Allowance:</span>
                <span className="text-green-600 font-semibold">{chargeCalc.breakdown.freeHours} hours</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Billable Overage:</span>
                <span className="text-primary font-semibold">{chargeCalc.breakdown.billableHours} hours @ ₹300/hr</span>
              </div>
            </div>
          ) : null
        )}

        {/* Rate Display (Simplified if not split) */}
        {chargeInfo && (!chargeInfo.is_existing_customer || !chargeCalc.breakdown || (chargeCalc.breakdown.freeHours === 0 || chargeCalc.breakdown.billableHours === 0)) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <IndianRupee className="h-4 w-4" />
              <span>Applicable Rate</span>
            </div>
            <span className="font-semibold">
              {chargeInfo.is_existing_customer
                ? (chargeCalc.breakdown?.billableHours ? "₹300/hour" : "Free")
                : `₹${chargeInfo.charge_per_hour}/hour`}
            </span>
          </div>
        )}

        {/* Duration (Always visible) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Duration</span>
          </div>
          <span className="font-semibold">
            {chargeCalc.durationHours} {chargeCalc.durationHours === 1 ? "hour" : "hours"}
          </span>
        </div>

        {/* Total Charge or Prompt */}
        {chargeInfo ? (
          <div className="pt-4 border-t">
            <div className="flex items-center justify-between text-lg">
              <span className="font-bold">Total Amount</span>
              <span className="font-bold text-primary">
                ₹{chargeCalc.totalCharge}
              </span>
            </div>
            {chargeCalc.totalCharge === 0 && (
              <p className="text-sm text-muted-foreground mt-2 text-right">
                Free booking applied!
              </p>
            )}
          </div>
        ) : (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-md text-sm">
              <Info className="h-4 w-4" />
              <span>Enter your email to calculate the price</span>
            </div>
          </div>
        )}

        {/* Tier Description */}
        {chargeInfo && (
          <div className="pt-2 text-xs text-muted-foreground">
            <p>{chargeInfo.tier_description}</p>
          </div>
        )}

        {/* Pricing Info */}
        <div className="pt-2 text-xs text-muted-foreground space-y-1">
          <p className="font-semibold">Pricing:</p>
          <ul className="list-disc list-inside space-y-0.5 ml-2">
            <li>First-time users: ₹500 per hour</li>
            <li>
              Returning users: Enjoy 10 FREE hours every month, then just ₹300 per hour
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}