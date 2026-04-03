// features/booking/TimeSlotGrid.tsx
import { cn } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Clock, Loader2, AlertTriangle } from "lucide-react";
import { isContiguous } from "./booking.types";

const TIME_SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30",
  "16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30",
  "20:00", "20:30", "21:00", "21:30", "22:00", "22:30",
];

function formatDuration(count: number): string {
  const mins = count * 30;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h === 0) return `${m} min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

function addThirtyMinutes(slot: string | undefined): string {
  if (!slot) return "";
  const [h, m] = slot.split(":").map(Number);
  const d = new Date(2000, 0, 1, h, m + 30);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

type Props = {
  timeSlots?: string[];
  disabledSlots: string[];
  selectedTimeSlots: string[];
  loadingAvailability: boolean;
  onToggle: (slot: string) => void;
};

export function TimeSlotGrid({
  timeSlots = TIME_SLOTS,
  disabledSlots,
  selectedTimeSlots,
  loadingAvailability,
  onToggle,
}: Props) {
  const sorted = [...selectedTimeSlots].sort();
  const startSlot = sorted[0];
  const endSlot = sorted[sorted.length - 1];
  const endTime = addThirtyMinutes(endSlot);
  const hasSelection = selectedTimeSlots.length > 0;
  const isValid = !hasSelection || isContiguous(selectedTimeSlots);

  return (
    <div className="space-y-4 mt-4">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">
          Select Time Slots
          <span className="text-xs font-normal text-muted-foreground ml-1">(30-min intervals)</span>
        </p>
        {loadingAvailability && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            Checking availability…
          </span>
        )}
      </div>

      {/* Slot grid */}
      <div
        role="group"
        aria-label="Available time slots"
        className={cn(
          "grid gap-1.5 transition-opacity",
          "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6",
          loadingAvailability && "opacity-40 pointer-events-none"
        )}
      >
        {timeSlots.map((slot) => {
          const isDisabled = disabledSlots.includes(slot);
          const isSelected = selectedTimeSlots.includes(slot);
          const isFirst = slot === startSlot && selectedTimeSlots.length > 1;
          const isLast = slot === endSlot && selectedTimeSlots.length > 1;
          const isMid = isSelected && !isFirst && !isLast && selectedTimeSlots.length > 1;

          return (
            <button
              key={slot}
              type="button"
              disabled={isDisabled || loadingAvailability}
              aria-pressed={isSelected}
              aria-label={`${slot}${isDisabled ? " — unavailable" : isSelected ? " — selected" : ""}`}
              onClick={() => onToggle(slot)}
              className={cn(
                "relative py-2.5 px-1 text-xs font-semibold rounded-xl border-2 transition-all duration-150 text-center select-none",
                // Base unselected
                !isSelected && !isDisabled && "bg-background border-border text-foreground hover:border-primary/50 hover:bg-primary/5 active:scale-[0.96]",
                // Selected
                isSelected && isValid && "bg-primary border-primary text-primary-foreground shadow-sm",
                // Selected but invalid (gap)
                isSelected && !isValid && "bg-destructive/10 border-destructive text-destructive",
                // Disabled (booked)
                isDisabled && "bg-muted border-muted text-muted-foreground cursor-not-allowed opacity-50 line-through",
              )}
              title={isDisabled ? "Already booked" : undefined}
            >
              {slot}
              {/* Range endpoint indicators */}
              {isFirst && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-primary-foreground bg-primary/80 rounded-full px-1 leading-tight whitespace-nowrap">
                  start
                </span>
              )}
              {isLast && (
                <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 text-[8px] font-black text-primary-foreground bg-primary/80 rounded-full px-1 leading-tight whitespace-nowrap">
                  end
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Selection summary */}
      {hasSelection && isValid && (
        <div className="flex items-center justify-between bg-primary/8 dark:bg-primary/15 border border-primary/25 rounded-xl px-4 py-3 animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary flex-shrink-0" />
            <div>
              <p className="text-sm font-bold text-primary leading-none">
                {startSlot} – {endTime}
              </p>
              <p className="text-[11px] text-primary/60 font-medium mt-0.5">
                {formatDuration(selectedTimeSlots.length)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onToggle(selectedTimeSlots[0])} // deselect all by re-tapping first
            className="text-[10px] font-bold text-primary/60 hover:text-primary underline underline-offset-2 transition-colors"
            aria-label="Clear selection"
          >
            Clear
          </button>
        </div>
      )}

      {/* Contiguous error */}
      {hasSelection && !isValid && (
        <Alert variant="destructive" className="animate-in fade-in slide-in-from-bottom-1 duration-200 py-3">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-xs">
            Your selection has a gap. Please select a continuous range of slots.
          </AlertDescription>
        </Alert>
      )}

      {/* Empty hint */}
      {!hasSelection && !loadingAvailability && (
        <p className="text-center text-xs text-muted-foreground">
          Tap a slot to start · tap another to set the end of your range
        </p>
      )}
    </div>
  );
}