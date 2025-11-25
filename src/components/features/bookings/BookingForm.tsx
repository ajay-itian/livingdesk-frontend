// features/booking/BookingForm.tsx
import { format } from "date-fns";
import { Calendar as CalendarIcon, Loader2 } from "lucide-react";
import { FormField, FormItem, FormLabel, FormMessage, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import type { UseFormReturn } from "react-hook-form";
import type { BookingFormData } from "./booking.types";

type Props = {
  form: UseFormReturn<BookingFormData>;
  rooms: { id: number; name: string }[];
  checkingCharge: boolean;
  selectedTimeSlots: string[];
  setSelectedTimeSlots: (s: string[]) => void;
  disabledSlots: string[];
  loadingAvailability: boolean;
};

export function BookingForm({
  form,
  rooms,
  checkingCharge,
  selectedTimeSlots,
  setSelectedTimeSlots,
}: Props) {
  return (
    <form className="space-y-6">
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Email Address</FormLabel>
            <FormControl>
              <Input placeholder="your@email.com" {...field} className="transition-none" />
            </FormControl>
            <FormMessage />
            {checkingCharge && (
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking customer status...
              </p>
            )}
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Phone Number</FormLabel>
            <FormControl>
              <Input placeholder="+91 1234567890" {...field} className="transition-none" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="room_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Select Room</FormLabel>
            <Select
              onValueChange={(v) => {
                field.onChange(v);
                setSelectedTimeSlots([]);
              }}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="transition-none">
                  <SelectValue placeholder={rooms.length ? "Choose a room" : "Loading rooms..."} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {rooms.map((room) => (
                  <SelectItem key={room.id} value={String(room.id)}>
                    {room.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Select Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full pl-3 text-left font-normal transition-none",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={(d) => {
                    field.onChange(d);
                    setSelectedTimeSlots([]);
                  }}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      <Label className="sr-only">Time Slots are below</Label>
    </form>
  );
}
