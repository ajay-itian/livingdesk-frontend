// features/booking/SummaryCard.tsx
import { User, UserCheck, CheckCircle2, IndianRupee } from "lucide-react";
import { type ChargeInfo } from "./booking.types";

export function SummaryCard({
  chargeInfo,
  chargeCalc,
  selectedTimeSlots,
}: {
  chargeInfo: ChargeInfo | null;
  chargeCalc: { durationHours: number; totalCharge: number } | null;
  selectedTimeSlots: string[];
}) {
  if (!chargeInfo || selectedTimeSlots.length === 0 || !chargeCalc) return null;

  return (
    <div className="border-2 rounded-2xl p-5 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20 shadow-soft animate-fade-in mt-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        {chargeInfo.is_existing_customer ? (
          <>
            <UserCheck className="h-5 w-5 text-success" />
            <span>Welcome Back - Existing Customer</span>
          </>
        ) : (
          <>
            <User className="h-5 w-5 text-primary" />
            <span>New Customer</span>
          </>
        )}
      </h3>

      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Duration:</span>
          <span className="font-semibold">
            {chargeCalc.durationHours} hour{chargeCalc.durationHours !== 1 ? "s" : ""}
          </span>
        </div>

        <div className="flex justify-between items-center py-2 border-b border-border/50">
          <span className="text-sm text-muted-foreground">Flat charge:</span>
          <span className="font-semibold">
            {chargeInfo.is_existing_customer || chargeInfo.charge === 0 ? (
              <span className="text-success flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4" />
                FREE
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <IndianRupee className="h-4 w-4" />
                {chargeInfo.charge}
              </span>
            )}
          </span>
        </div>

        <div className="bg-card rounded-lg p-4 mt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Charge:</span>
            <span className="flex items-center gap-1">
              {chargeInfo.is_existing_customer || chargeCalc.totalCharge === 0 ? (
                <span className="text-success text-3xl font-bold">FREE</span>
              ) : (
                <>
                  <IndianRupee className="h-6 w-6" />
                  <span className="text-3xl font-bold price-total">{chargeCalc.totalCharge}</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
