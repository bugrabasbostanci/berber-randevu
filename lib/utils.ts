import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, startOfDay as fnsStartOfDay, endOfDay as fnsEndOfDay } from "date-fns"
import { tr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tarih işlemleri için sabit değerler
 */
export const DATE_FORMAT = {
  ISO_DATE: "yyyy-MM-dd", 
  ISO_TIME: "HH:mm",
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  DISPLAY_DATE: "d MMMM yyyy",
  DISPLAY_TIME: "HH:mm",
  DISPLAY_DATETIME: "d MMMM yyyy HH:mm"
}

/**
 * String tarih değerini güvenli şekilde Date nesnesine çevirir
 * Tüm tarih çevirmelerinde bu fonksiyon kullanılmalı
 * @param dateStr Tarih string'i (örn: "2024-04-23" veya "2024-04-23T15:30:00.000Z")
 * @returns Date nesnesi
 */
export function safeParseDate(dateStr: string): Date {
  try {
    // ISO format kontrolü
    if (dateStr.includes("T")) {
      return parseISO(dateStr);
    }
    
    // Sadece tarih (yyyy-MM-dd) - yerel saat dilimine göre ayarla
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Zaman dilimi kaymasını önlemek için yerel tarih oluşturulur
      const [year, month, day] = dateStr.split('-').map(Number);
      return new Date(year, month - 1, day); // ay 0-indexed olduğu için -1
    }
    
    // Genel durum
    return new Date(dateStr);
  } catch (error) {
    console.error("Tarih ayrıştırılırken hata:", error);
    return new Date(); // Geçersiz ise bugünü döndür
  }
}

/**
 * Tarih formatlaması için standart fonksiyon
 * @param date Tarih (string veya Date nesnesi)
 * @param formatStr Format string (örn: DATE_FORMAT.ISO_DATE)
 * @returns Formatlanmış tarih string
 */
export function formatDate(date: Date | string, formatStr: string = DATE_FORMAT.ISO_DATE): string {
  if (!date) return "";
  
  try {
    // String ise Date'e çevir
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    // Geçerli bir tarih mi kontrol et
    if (isNaN(dateObj.getTime())) {
      throw new Error("Geçersiz tarih");
    }
    
    return format(dateObj, formatStr, { locale: tr });
  } catch (error) {
    console.error("Tarih formatlanırken hata:", error, "Tarih:", date, "Format:", formatStr);
    return "";
  }
}

/**
 * Tutarlı şekilde günün başlangıcını döndürür
 * date-fns startOfDay ile uyumlu ancak doğrudan string değer de alabilir
 * @param date Tarih (string veya Date nesnesi)  
 * @returns Günün başlangıcı (00:00:00.000)
 */
export function startOfDay(date: Date | string): Date {
  const dateObj = typeof date === "string" ? safeParseDate(date) : date;
  return fnsStartOfDay(dateObj);
}

/**
 * Tutarlı şekilde günün sonunu döndürür
 * date-fns endOfDay ile uyumlu ancak doğrudan string değer de alabilir
 * @param date Tarih (string veya Date nesnesi)
 * @returns Günün sonu (23:59:59.999)
 */
export function endOfDay(date: Date | string): Date {
  const dateObj = typeof date === "string" ? safeParseDate(date) : date;
  return fnsEndOfDay(dateObj);
}

/**
 * Tarih nesnesinin saat kısmını standart formatta döndürür
 * @param date Tarih nesnesi veya string
 * @returns Saat formatında string (HH:mm)
 */
export function formatTimeFromDate(date: Date | string): string {
  if (!date) return "";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    
    // Yerel saati kullanarak saat ve dakikayı al
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error("Saat formatlanırken hata:", error);
    return "";
  }
}

/**
 * İki tarih için saat:dakika karşılaştırması yapar
 * @param date1 İlk tarih
 * @param date2 İkinci tarih
 * @returns İki tarihin saat ve dakikaları eşitse true, değilse false
 */
export function isSameTime(date1: Date | string, date2: Date | string): boolean {
  const time1 = formatTimeFromDate(date1);
  const time2 = formatTimeFromDate(date2);
  return time1 === time2;
}

/**
 * Bir tarihin ISO formatında YYYY-MM-DD kısmını döndürür
 * Zaman dilimi kaymasını önlemek için yerel tarih kullanır
 * @param date Tarih nesnesi veya string
 * @returns YYYY-MM-DD formatında string
 */
export function toISODateString(date: Date | string): string {
  const dateObj = typeof date === "string" ? safeParseDate(date) : date;
  return formatDate(dateObj, DATE_FORMAT.ISO_DATE);
}

/**
 * Belirli bir yıl, ay ve gün için tarih oluşturur
 * Zaman dilimi hatalarından kaçınmak için
 * @param year Yıl (ör: 2025)
 * @param month Ay (1-12)
 * @param day Gün (1-31)
 * @returns Date nesnesi
 */
export function createLocalDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day); // ay 0-indexed olduğu için -1
}

/**
 * Date nesnesini ISO string biçimine dönüştürür (API yanıtları için)
 * @param date Date nesnesi
 * @returns ISO format string
 */
export function toISOString(date: Date): string {
  return date.toISOString();
}

/**
 * Tarih nesnesinin sadece tarih bölümünü alır, saat kısmını 00:00:00 olarak ayarlar
 * @param date Tarih nesnesi veya string
 * @returns Sadece tarih bilgisi olan Date nesnesi
 */
export function getDateOnly(date: Date | string): Date {
  const dateObj = typeof date === "string" ? safeParseDate(date) : date;
  const year = dateObj.getFullYear();
  const month = dateObj.getMonth();
  const day = dateObj.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Tarih nesnesinin verilen saat ve dakikaya göre ayarlar
 * @param date Tarih nesnesi veya string
 * @param hours Saat (0-23)
 * @param minutes Dakika (0-59)
 * @returns Saati ayarlanmış Date nesnesi
 */
export function setTimeToDate(date: Date | string, hours: number, minutes: number): Date {
  const dateObj = typeof date === "string" ? safeParseDate(date) : new Date(date);
  dateObj.setHours(hours, minutes, 0, 0);
  return dateObj;
}

/**
 * API'den alınan Date verilerini doğru formatta dönüştürmek için
 * @param obj Dönüştürülecek nesne (appointment, closedSlot vb.)
 * @returns date ve zaman alanları ISO string olarak dönüştürülmüş nesne
 */
export function formatDatesForApi<T extends Record<string, unknown>>(obj: T): T {
  const result = { ...obj };
  for (const [key, value] of Object.entries(obj)) {
    if (value instanceof Date) {
      (result as Record<string, unknown>)[key] = value.toISOString();
    }
  }
  return result;
}

/**
 * İki saat değerini HH:MM formatında normalize edip karşılaştırır
 * Bu fonksiyon, zaman dilimi farklarından bağımsız olarak saat
 * ve dakika değerlerini standart formata çevirip karşılaştırır
 * @param time1 Birinci saat (HH:MM formatında string veya Date)
 * @param time2 İkinci saat (HH:MM formatında string veya Date)
 * @returns Eşleşiyorsa true, eşleşmiyorsa false
 */
export function compareTimeStrings(time1: string | Date, time2: string | Date): boolean {
  // String formatındaysa ve ":" içeriyorsa (HH:MM) direkt kullan
  function normalizeTimeString(time: string | Date): string {
    if (typeof time === 'string' && time.includes(':')) {
      // HH:MM formatında gelen saat
      const [hours, minutes] = time.split(':').map(Number);
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else if (time instanceof Date) {
      // Date nesnesi ise HH:MM formatına dönüştür
      return formatTimeFromDate(time);
    } else if (typeof time === 'string') {
      // ISO string veya başka bir tarih formatı
      return formatTimeFromDate(safeParseDate(time));
    }
    
    // Hiçbir formata uymuyorsa boş döndür
    console.error("Geçersiz saat formatı:", time);
    return "";
  }
  
  const normalizedTime1 = normalizeTimeString(time1);
  const normalizedTime2 = normalizeTimeString(time2);
  
  return normalizedTime1 === normalizedTime2;
}

/**
 * Date nesnelerinin yerel saat işlemleri için kullanılan yardımcı fonksiyon.
 * Bu fonksiyon, tüm uygulamada Date nesnelerinin yerel saat olarak oluşturulması ve 
 * saklanması için tutarlı bir yöntem sağlar.
 * 
 * @param year Yıl (YYYY)
 * @param month Ay (1-12)
 * @param day Gün (1-31)
 * @param hours Saat (0-23)
 * @param minutes Dakika (0-59)
 * @param seconds Saniye (0-59), varsayılan 0
 * @param ms Milisaniye (0-999), varsayılan 0
 * @returns Date nesnesi (yerel saat olarak)
 */
export function createLocalDatetime(
  year: number, 
  month: number, 
  day: number, 
  hours = 0, 
  minutes = 0, 
  seconds = 0, 
  ms = 0
): Date {
  // Not: JS'de ay indeksi 0'dan başlar, bu yüzden month-1 yapıyoruz
  return new Date(year, month - 1, day, hours, minutes, seconds, ms);
}

/**
 * ISO string tarihini yerel saat olarak yorumlar
 * Tarih+saat verilerini veritabanına kaydederken veya yüklerken kullanılır
 * 
 * @param isoString ISO formatında tarih stringi
 * @returns Yerel saat olarak yorumlanmış Date nesnesi
 */
export function parseISOAsLocalDate(isoString: string): Date {
  // ISO formatını parçalara ayır
  const dateMatch = isoString.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d{3}))?Z?$/);
  
  if (!dateMatch) {
    console.error(`Geçersiz ISO formatı: ${isoString}`);
    return new Date(); // Geçersiz format durumunda şu anki tarihi döndür
  }
  
  // Grupları sayılara çevir
  const [ yearStr, monthStr, dayStr, hourStr, minuteStr, secondStr, msStr] = dateMatch;
  
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12 arasında
  const day = parseInt(dayStr, 10);
  const hour = parseInt(hourStr, 10);
  const minute = parseInt(minuteStr, 10);
  const second = parseInt(secondStr, 10);
  const ms = msStr ? parseInt(msStr, 10) : 0;
  
  // Yerel tarih oluştur
  return createLocalDatetime(year, month, day, hour, minute, second, ms);
}
