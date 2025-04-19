import { format } from "date-fns";
import { Appointment, ClosedSlot } from "@/types";

/**
 * Bir tarihin saat formatını döndürür
 */
export const getTimeString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, "HH:mm");
};

/**
 * Belirli bir kullanıcı için randevu bulur
 */
export const findAppointment = (
  userId: number, 
  time: string, 
  appointments: Appointment[]
): Appointment | undefined => {
  return appointments.find(app => {
    if (app.userId !== userId) return false;
    return getTimeString(app.date) === time;
  });
};

/**
 * Belirli bir saatin kapalı olup olmadığını kontrol eder
 */
export const isTimeSlotClosed = (
  userId: number, 
  time: string, 
  closedSlots: ClosedSlot[]
): boolean => {
  return closedSlots.some(slot => {
    if (slot.userId !== userId) return false;
    return getTimeString(slot.date) === time;
  });
};

/**
 * Kapalı slot için neden bilgisini bulur
 */
export const getClosedSlotReason = (
  userId: number, 
  time: string, 
  closedSlots: ClosedSlot[]
): string | undefined => {
  const slot = closedSlots.find(slot => {
    if (slot.userId !== userId) return false;
    return getTimeString(slot.date) === time;
  });
  
  return slot?.reason;
};

/**
 * Bir günün tamamının kapalı olup olmadığını kontrol eder
 */
export const isDayClosed = (
  userId: number,
  workingHours: string[],
  closedSlots: ClosedSlot[]
): boolean => {
  if (closedSlots.length === 0) return false;
  
  // Kullanıcıya ait kapalı slotlar
  const userClosedSlots = closedSlots.filter(slot => slot.userId === userId);
  
  // Kapalı saatler
  const closedHours = userClosedSlots.map(slot => getTimeString(slot.date));
  
  // Tüm çalışma saatleri kapalı mı?
  return workingHours.every(hour => closedHours.includes(hour));
}; 