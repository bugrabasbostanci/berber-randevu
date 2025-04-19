import { format } from "date-fns";
import { Appointment, ClosedSlot } from "@/types";

/**
 * Bir tarihin saat formatını döndürür
 */
export const getTimeString = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  // Debug bilgisi
  console.log(`getTimeString - Original date: ${typeof date === 'string' ? date : date.toISOString()}, Converted: ${format(dateObj, "HH:mm")}`);
  return format(dateObj, "HH:mm");
};

/**
 * Sadece saat ve dakikaya göre iki tarihi karşılaştırır
 */
export const isSameTime = (date1: Date | string, date2: Date | string): boolean => {
  const time1 = getTimeString(date1);
  const time2 = getTimeString(date2);
  const result = time1 === time2;
  
  // Debug bilgisi
  if (result) {
    console.log(`isSameTime - ${time1} === ${time2}`);
  }
  
  return result;
};

/**
 * Belirli bir kullanıcı için randevu bulur
 */
export const findAppointment = (
  userId: number, 
  time: string, 
  appointments: Appointment[]
): Appointment | undefined => {
  // Daha açık bir yaklaşımla eşleştirme yapar
  return appointments.find(app => {
    if (app.userId !== userId) return false;
    const appTime = getTimeString(app.date);
    return appTime === time;
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
  // Daha açık debug bilgisi için
  const userSlots = closedSlots.filter(s => s.userId === userId);
  
  if (userSlots.length > 0) {
    console.log(`User ${userId} has ${userSlots.length} closed slots`);
    
    // Tüm kapalı slotların saatlerini göster
    userSlots.forEach(slot => {
      const slotTime = getTimeString(slot.date);
      console.log(`Kapalı slot: ${slotTime}, karşılaştırma: ${time}, eşleşme: ${slotTime === time}`);
    });
  }
  
  return closedSlots.some(slot => {
    if (slot.userId !== userId) return false;
    const slotTime = getTimeString(slot.date);
    return slotTime === time;
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
  
  if (userClosedSlots.length === 0) return false;
  
  console.log(`isDayClosed - Kullanıcı ${userId} için kontrol ediliyor`);
  console.log(`isDayClosed - Çalışma saatleri: ${workingHours.join(', ')}`);
  
  // Kapalı saatler
  const closedHours = userClosedSlots.map(slot => {
    const timeStr = getTimeString(slot.date);
    return timeStr;
  });
  
  console.log(`isDayClosed - Kapalı saatler: ${closedHours.join(', ')}`);
  
  // Daha açık debug bilgisi için her bir çalışma saatini teker teker kontrol et
  const allClosed = workingHours.every(hour => {
    const isClosed = closedHours.includes(hour);
    console.log(`isDayClosed - Saat ${hour} kapalı mı? ${isClosed ? 'EVET' : 'HAYIR'}`);
    return isClosed;
  });
  
  console.log(`isDayClosed - Tüm saatler kapalı mı? ${allClosed ? 'EVET' : 'HAYIR'}`);
  
  return allClosed;
}; 