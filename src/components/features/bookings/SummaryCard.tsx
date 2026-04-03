import { Card, CardContent } from "@/components/ui/card";
import { Clock, IndianRupee, Building2, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

interface SummaryCardProps {
  chargeInfo: any;
  chargeCalc: any;
  selectedTimeSlots: string[];
  roomName?: string;
}

export function SummaryCard({ chargeInfo, chargeCalc, selectedTimeSlots, roomName }: SummaryCardProps) {
  if (selectedTimeSlots.length === 0 || !chargeCalc) return null;

  // Reliable Day Pass detection via room name (not slot count)
  const isDayPass = !!roomName?.toLowerCase().includes("day pass");

  // Day Pass is always ₹299 flat unless member with full credit coverage (amount === 0)
  const isFree = chargeInfo?.user_type === "member" && chargeCalc.totalCharge === 0;
  const displayPrice = isDayPass ? (isFree ? 0 : 299) : chargeCalc.totalCharge;

  return (
    <Card className="mt-5 border-2 border-primary/15 bg-primary/3">
      <div className="px-5 py-3 bg-primary/10 border-b border-primary/15 flex items-center gap-2">
        <IndianRupee className="h-4 w-4 text-primary" />
        <p className="text-sm font-black uppercase text-primary">Booking Summary</p>
      </div>
      <CardContent className="px-5 py-4 space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Duration</span>
          <span className="font-bold flex items-center gap-1">
            <Clock size={12} />
            {isDayPass ? "Full Day (8:00 – 18:30)" : `${chargeCalc.durationHours}h`}
          </span>
        </div>

        {isDayPass && (
          <div className="flex items-center gap-1.5 text-[11px] text-primary font-bold bg-primary/8 rounded-lg px-2.5 py-1.5 border border-primary/15">
            <Zap size={11} /> Flat day rate · all-day access included
          </div>
        )}

        {chargeInfo?.company_name && (
          <div className="flex justify-between text-sm border-t pt-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Building2 size={12} /> Credits
            </span>
            <span className="font-bold">{chargeInfo.company_remaining_hours.toFixed(1)}h left</span>
          </div>
        )}

        <div className="flex items-end justify-between border-t pt-3">
          <span className="text-sm font-bold">Total</span>
          <div className="text-right">
            <p className={cn("text-2xl font-black", isFree ? "text-green-600" : "text-primary")}>
              {isFree ? "FREE" : `₹${displayPrice}`}
            </p>
            {isDayPass && !isFree && (
              <p className="text-[10px] text-primary font-bold uppercase tracking-tighter">Flat Day Rate</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}