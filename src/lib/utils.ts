import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO, isAfter, isBefore, parse } from 'date-fns';

// =============================================================================
// Tailwind Utilities
// =============================================================================

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// Date & Time Utilities
// =============================================================================

export const formatDate = (date: string | Date): string => {
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'MMM dd, yyyy');
  } catch {
    return 'Invalid date';
  }
};

export const formatTime = (time: string): string => {
  try {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  } catch {
    return time;
  }
};

export const formatDateTime = (dateTime: string): string => {
  try {
    const dt = parseISO(dateTime);
    return format(dt, 'MMM dd, yyyy hh:mm a');
  } catch {
    return 'Invalid date';
  }
};

export const getTodayDate = (): string => {
  return format(new Date(), 'yyyy-MM-dd');
};

// =============================================================================
// Validation Utilities
// =============================================================================

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
  return phoneRegex.test(phone);
};

// =============================================================================
// Text Utilities
// =============================================================================

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

// =============================================================================
// Booking Utilities
// =============================================================================

export const isTimeSlotAvailable = (
  startTime: string,
  endTime: string,
  existingBookings: { start_time: string; end_time: string }[]
): boolean => {
  const start = parse(startTime, 'HH:mm', new Date());
  const end = parse(endTime, 'HH:mm', new Date());

  for (const booking of existingBookings) {
    const bookingStart = parse(booking.start_time, 'HH:mm', new Date());
    const bookingEnd = parse(booking.end_time, 'HH:mm', new Date());

    // Check for overlap
    if (
      (isAfter(start, bookingStart) && isBefore(start, bookingEnd)) ||
      (isAfter(end, bookingStart) && isBefore(end, bookingEnd)) ||
      (isBefore(start, bookingStart) && isAfter(end, bookingEnd))
    ) {
      return false;
    }
  }

  return true;
};

export const generateTimeSlots = (startHour = 9, endHour = 18): string[] => {
  const slots: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    slots.push(`${hour.toString().padStart(2, '0')}:00`);
    if (hour < endHour) {
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
  }
  return slots;
};

// =============================================================================
// Style Utilities
// =============================================================================

export const getStatusColor = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-blue-100 text-blue-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// =============================================================================
// Performance Utilities
// =============================================================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
