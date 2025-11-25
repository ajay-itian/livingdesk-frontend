// features/booking/TimeSlotGrid.tsx
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { isContiguous } from "./booking.types";

type Props = {
  timeSlots: string[];
  disabledSlots: string[];
  selectedTimeSlots: string[];
  loadingAvailability: boolean;
  onToggle: (slot: string) => void;
};

export function TimeSlotGrid({
  timeSlots,
  disabledSlots,
  selectedTimeSlots,
  loadingAvailability,
  onToggle,
}: Props) {
  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between">
        <Label>Select Time Slots (30-minute intervals)</Label>
        {loadingAvailability && (
          <span className="text-xs text-muted-foreground flex items-center gap-2">
            {/* You can re-add Loader2 here if desired */}
            Loading...
          </span>
        )}
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
        {timeSlots.map((slot) => {
          const isDisabled = disabledSlots.includes(slot);
          const isSelected = selectedTimeSlots.includes(slot);
          return (
            <Button
              key={slot}
              type="button"
              variant={isSelected ? "default" : "outline"}
              onClick={() => onToggle(slot)}
              className={cn(
                "text-sm transition-none",
                isSelected && "shadow-elegant",
                isDisabled && "opacity-50 cursor-not-allowed"
              )}
              disabled={isDisabled || loadingAvailability}
              title={isDisabled ? "Already booked" : undefined}
            >
              {slot}
            </Button>
          );
        })}
      </div>

      {selectedTimeSlots.length > 0 && (
        <div className="bg-accent/10 rounded-lg p-3 border border-accent/20 animate-fade-in">
          <p className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            Selected: {selectedTimeSlots[0]} - {selectedTimeSlots[selectedTimeSlots.length - 1]}
          </p>
        </div>
      )}

      {!isContiguous(selectedTimeSlots) && selectedTimeSlots.length > 0 && (
        <Alert variant="destructive" className="animate-fade-in">
          <AlertDescription>Selection must be contiguous (no gaps between slots)</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
