import { Appointment, ClosedSlot } from "@/types";

/**
 * Bir tarihin saat formatını döndürür
 */
export const getTimeString = (date: Date | string): string => {
  try {
    // Date nesnesine çevir
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Debug bilgisi
    console.log(`getTimeString - Original date: ${typeof date === 'string' ? date : date.toISOString()}`);
    
    // Saati ve dakikayı doğrudan al, zaman dilimini dikkate almadan
    const hours = dateObj.getUTCHours().toString().padStart(2, '0');
    const minutes = dateObj.getUTCMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    console.log(`getTimeString - UTC saat: ${timeString}`);
    return timeString;
  } catch (error) {
    console.error('getTimeString - Tarih işleme hatası:', error, 'Tarih:', date);
    return '00:00'; // Hata durumunda varsayılan değer
  }
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
    
    // Kapalı slotların saatlerini göster (UTC zamanını kullanarak)
    const closedTimes = userSlots.map(slot => {
      const slotTime = getTimeString(slot.date);
      console.log(`Kapalı slot: ${slotTime}, karşılaştırma: ${time}, eşleşme: ${slotTime === time}`);
      return slotTime;
    });
    
    // Kontrol edilen zaman bu kullanıcının kapalı slotlarında var mı?
    return closedTimes.includes(time);
  }
  
  return false;
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
  if (closedSlots.length === 0) {
    console.log(`isDayClosed - Hiç kapalı slot yok`);
    return false;
  }
  
  // Kullanıcıya ait kapalı slotlar
  const userClosedSlots = closedSlots.filter(slot => slot.userId === userId);
  
  if (userClosedSlots.length === 0) {
    console.log(`isDayClosed - ${userId} numaralı kullanıcı için hiç kapalı slot yok`);
    return false;
  }
  
  // Günlük tüm çalışma saatlerini ve kapalı saatleri karşılaştıralım
  console.log(`isDayClosed - Kullanıcı ${userId} için kontrol ediliyor`);
  console.log(`isDayClosed - Çalışma saatleri: ${workingHours.join(', ')}`);
  
  // Kapalı saatler - tarih formatını güvenli bir şekilde işleme
  const closedHours = userClosedSlots.map(slot => {
    let date;
    if (typeof slot.date === 'string') {
      date = new Date(slot.date);
    } else if (slot.date instanceof Date) {
      date = slot.date;
    } else {
      console.error('isDayClosed - Geçersiz slot.date formatı:', slot.date);
      // Varsayılan olarak boş string döndür, bu saat eşleşmeyecek
      return '';
    }
    
    try {
      // Format: HH:mm
      return date.getHours().toString().padStart(2, '0') + ':' + 
             date.getMinutes().toString().padStart(2, '0');
    } catch (error) {
      console.error('isDayClosed - Tarih formatlarken hata:', error);
      return '';
    }
  }).filter(timeStr => timeStr !== ''); // Boş değerleri filtrele
  
  console.log(`isDayClosed - Kapalı saatler: ${closedHours.join(', ')}`);
  
  // Her çalışma saati için, o saatin kapalı olup olmadığını kontrol et
  const allClosed = workingHours.every(hour => {
    const isClosed = closedHours.includes(hour);
    console.log(`isDayClosed - Saat ${hour} kapalı mı? ${isClosed ? 'EVET' : 'HAYIR'}`);
    return isClosed;
  });
  
  console.log(`isDayClosed - Tüm saatler kapalı mı? ${allClosed ? 'EVET' : 'HAYIR'}`);
  
  return allClosed;
}; 