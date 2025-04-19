import { Appointment, ClosedSlot } from "@/types"
import { formatTimeFromDate } from "@/lib/utils"

// Sabit çalışma saatleri
export const WORKING_SLOTS = [
  { hour: 9, minute: 30 },   // 09:30
  { hour: 10, minute: 15 },  // 10:15
  { hour: 11, minute: 0 },   // 11:00
  { hour: 11, minute: 45 },  // 11:45
  { hour: 12, minute: 30 },  // 12:30
  { hour: 13, minute: 15 },  // 13:15
  { hour: 14, minute: 0 },   // 14:00
  { hour: 14, minute: 45 },  // 14:45
  { hour: 15, minute: 30 },  // 15:30
  { hour: 16, minute: 15 },  // 16:15
  { hour: 17, minute: 0 },   // 17:00
  { hour: 17, minute: 45 },  // 17:45
  { hour: 18, minute: 30 },  // 18:30
  { hour: 19, minute: 15 },  // 19:15
  { hour: 20, minute: 0 },   // 20:00
  { hour: 20, minute: 45 }   // 20:45
]

// Geriye dönük uyumluluk için eski WORKING_HOURS nesnesini koruyalım
export const WORKING_HOURS = {
  start: 9.5, // 09:30
  end: 21,    // 21:00
  interval: 0.75 // 45 dakika
}

// Zaman dilimlerini oluşturan yardımcı fonksiyon
export const generateTimeSlots = (date: Date) => {
  const slots = []
  
  // Çalışma saatlerini yerel saat dilimine göre oluştur
  for (const slot of WORKING_SLOTS) {
    // Standart tarih objesi oluştur (yerel zaman)
    const slotDate = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      slot.hour,
      slot.minute,
      0,
      0
    );
    
    // UTC formatından yerel saate çevirirken 3 saat ekleyelim (Türkiye UTC+3)
    const utcSlotDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      slot.hour,
      slot.minute,
      0,
      0
    ));
    
    // Formatlanmış saati al
    const formattedTime = `${slot.hour.toString().padStart(2, '0')}:${slot.minute.toString().padStart(2, '0')}`;
    
    console.log(`generateTimeSlots - Slot: ${formattedTime}, UTC: ${utcSlotDate.toISOString()}, Local: ${slotDate.toString()}`);
    
    slots.push({
      time: utcSlotDate, // UTC zaman kaydedelim (backend için)
      formattedTime: formattedTime // Yerel zaman gösterelim (UI için)
    });
  }
  
  return slots
}

// İsim gizleme fonksiyonu
export const maskName = (fullname: string, isAuthenticated: boolean): string => {
  if (isAuthenticated) {
    return fullname
  }
  // İsim ve soyisim baş harflerini al
  const [name, surname] = fullname.split(" ")
  return `${name?.charAt(0) || ""}. ${surname?.charAt(0) || ""}.`
}

// Bir zaman diliminin kapalı olup olmadığını kontrol et
export const isSlotClosed = (
  userId: number, 
  formattedTime: string, 
  closedSlots: ClosedSlot[]
): boolean => {
  return closedSlots.some(closedSlot => {
    if (closedSlot.userId !== userId) return false;
    
    // Tarih kontrolü için güvenli bir şekilde saat formatını elde et
    // closedSlot.date string veya Date olabilir
    const slotTime = formatTimeFromDate(
      typeof closedSlot.date === 'string' ? new Date(closedSlot.date) : closedSlot.date
    );
    
    return slotTime === formattedTime;
  });
}

// Bir zaman dilimi için randevu bul
export const findAppointmentForSlot = (
  userId: number, 
  formattedTime: string, 
  appointments: Appointment[]
): Appointment | undefined => {
  return appointments.find(app => {
    if (app.userId !== userId) return false;
    
    // Tarih kontrolü için güvenli bir şekilde saat formatını elde et
    // app.date string veya Date olabilir
    const appTime = formatTimeFromDate(
      typeof app.date === 'string' ? new Date(app.date) : app.date
    );
    
    return appTime === formattedTime;
  });
}

// Bir zaman dilimi için kapanış nedeni bul
export const findClosedSlotReason = (
  userId: number, 
  formattedTime: string, 
  closedSlots: ClosedSlot[]
): string | undefined => {
  const matchingSlot = closedSlots.find(closedSlot => {
    if (closedSlot.userId !== userId) return false;
    
    // Tarih kontrolü için güvenli bir şekilde saat formatını elde et
    // closedSlot.date string veya Date olabilir
    const slotTime = formatTimeFromDate(
      typeof closedSlot.date === 'string' ? new Date(closedSlot.date) : closedSlot.date
    );
    
    return slotTime === formattedTime;
  });
  
  return matchingSlot?.reason;
}

/**
 * 09:30 - 20:45 arası çalışma saatlerini yerel saat dilimine göre oluşturur
 */
export const getTimeSlots = (date: Date = new Date()): string[] => {
  const slots: string[] = [];
  
  // Türkiye saati başlangıç ve bitiş saatleri (09:30 - 20:45)
  const startHour = 9;
  const startMinute = 30;
  const endHour = 20;
  const endMinute = 45;
  
  console.log(`getTimeSlots için tarih: ${date.toISOString()}`);
  
  // Gün başlangıç saatini belirle (saat ve dakika ayarla, saniye ve milisaniye sıfırla)
  const localDate = new Date(date);
  localDate.setHours(startHour, startMinute, 0, 0);
  
  console.log(`Başlangıç saati (yerel): ${localDate.toLocaleString()}`);
  
  // Bitiş saatine kadar 15'er dakika artırarak slotları oluştur
  while (
    localDate.getHours() < endHour || 
    (localDate.getHours() === endHour && localDate.getMinutes() <= endMinute)
  ) {
    // Saat formatını oluştur (HH:MM)
    const hours = localDate.getHours().toString().padStart(2, '0');
    const minutes = localDate.getMinutes().toString().padStart(2, '0');
    const timeSlot = `${hours}:${minutes}`;
    
    slots.push(timeSlot);
    console.log(`Slot eklendi: ${timeSlot}`);
    
    // 15 dakika ekle
    localDate.setMinutes(localDate.getMinutes() + 15);
  }
  
  console.log(`Toplam slot sayısı: ${slots.length}`);
  return slots;
}; 