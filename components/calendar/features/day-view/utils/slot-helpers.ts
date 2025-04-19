import { Appointment, ClosedSlot } from "@/types";

// BookedSlot arayüzü
interface BookedSlot {
  time: string;
  reason?: string;
  userId: number;
}

/**
 * Bir tarihin saat formatını döndürür
 */
export const getTimeString = (date: Date | string): string => {
  try {
    // Date nesnesine çevir
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Debug bilgisi
    console.log(`getTimeString - Original date: ${typeof date === 'string' ? date : date.toISOString()}`);
    
    // Saati ve dakikayı yerel saat diliminde al
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;
    
    console.log(`getTimeString - Yerel saat: ${timeString}`);
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
  // Yerel zaman formatını kullanarak randevu ara
  return appointments.find(app => {
    if (app.userId !== userId) return false;
    
    // Randevu tarihini al
    const date = typeof app.date === 'string' ? new Date(app.date) : app.date;
    
    // Yerel saat ve dakikayı al
    const hours = date.getHours();
    const minutes = date.getMinutes();
    
    // Formatlanmış saati oluştur
    const appTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    
    const isMatch = appTime === time;
    if (isMatch) {
      console.log(`Randevu bulundu - Saat: ${appTime}, Aranan: ${time}`);
    }
    
    return isMatch;
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
    
    // Kapalı slotların saatlerini yerel formatta karşılaştır
    for (const slot of userSlots) {
      const date = typeof slot.date === 'string' ? new Date(slot.date) : slot.date;
      
      // Yerel saat ve dakikayı al
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      // Formatlanmış saati oluştur
      const slotTime = `${hours}:${minutes}`;
      
      // Saat dilimlerinde yarım saatte bir karşılaştırma yapılıyor,
      // bu nedenle saatleri normalize edelim
      const normalizedTime = normalizeTime(time);
      const normalizedSlotTime = normalizeTime(slotTime);
      
      const isMatch = normalizedSlotTime === normalizedTime;
      console.log(`Kapalı slot: ${slotTime} (normalized: ${normalizedSlotTime}), karşılaştırma: ${time} (normalized: ${normalizedTime}), eşleşme: ${isMatch ? 'EVET' : 'HAYIR'}`);
      
      if (isMatch) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * Saatleri normalize eder - tarih karşılaştırması için
 */
const normalizeTime = (time: string): string => {
  try {
    // Zaman formatını doğrula
    if (!time || !time.includes(':')) {
      console.error('normalizeTime - Geçersiz zaman formatı:', time);
      return time;
    }
    
    const [hourStr, minuteStr] = time.split(':');
    const hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    
    // Zaman dilimi doğrulama
    if (isNaN(hour) || isNaN(minute) || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
      console.error('normalizeTime - Geçersiz saat veya dakika:', hourStr, minuteStr);
      return time;
    }
    
    // Sadece saat:dakika formatına çevir, normalizasyon yok (gelecekte gerekli olursa burada saat düzeltmesi yapılabilir)
    return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  } catch (error) {
    console.error('normalizeTime - Hata:', error);
    return time;
  }
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

/**
 * Belirtilen tarih için tüm randevuları alır ve bu randevuların saatlerini döndürür
 */
export const getBookedSlots = (
  date: Date,
  appointments: Appointment[]
): BookedSlot[] => {
  if (!date) {
    return [];
  }

  // Randevuları aynı gün içinde filtrele
  const todayAppointments = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date);
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    );
  });

  console.log(`Bugün için ${todayAppointments.length} randevu bulundu`);

  // Randevuları zaman slotlarına dönüştür
  const bookedSlots = todayAppointments.map((appointment) => {
    const appointmentDate = new Date(appointment.date);
    
    // Yerel saat formatında saat ve dakika bilgilerini al
    const hours = appointmentDate.getHours().toString().padStart(2, '0');
    const minutes = appointmentDate.getMinutes().toString().padStart(2, '0');
    
    // Saat formatını oluştur (HH:MM)
    const time = `${hours}:${minutes}`;
    
    return {
      time,
      userId: appointment.userId,
    };
  });
  
  console.log('Dolu slotlar:', bookedSlots);

  return bookedSlots;
}; 