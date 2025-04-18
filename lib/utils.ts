import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO } from "date-fns"
import { tr } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Tarih formatlaması için standart fonksiyon
 * @param date Tarih (string veya Date nesnesi)
 * @param formatStr Format string (örn: "yyyy-MM-dd")
 * @returns Formatlanmış tarih string
 */
export function formatDate(date: Date | string, formatStr: string = "yyyy-MM-dd"): string {
  if (!date) return "";
  
  // Eğer string ise, önce Date'e çevir
  const dateObj = typeof date === "string" ? new Date(date) : date;
  
  try {
    return format(dateObj, formatStr, { locale: tr });
  } catch (error) {
    console.error("Tarih formatlanırken hata:", error);
    return "";
  }
}

/**
 * String tarih değerini güvenli şekilde Date nesnesine çevirir
 * @param dateStr Tarih string'i (örn: "2024-04-23")
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
 * Tarih nesnesinin saat kısmını standart formatta döndürür
 * @param date Tarih nesnesi
 * @returns Saat formatında string (HH:mm)
 */
export function formatTimeFromDate(date: Date | string): string {
  return formatDate(date, "HH:mm");
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
 * @param date Tarih nesnesi
 * @returns YYYY-MM-DD formatında string
 */
export function toISODateString(date: Date): string {
  // UTC göre değil, yerel tarihe göre ISO string oluştur
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // +1 çünkü aylar 0 indekslidir
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Belirli bir yıl ve gün için tarih oluşturur
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
 * Bir Date nesnesini YYYY-MM-DD formatında string olarak döndürür
 * Bu özellikle kapalı günlerin kontrolünde kullanılır
 * @param date Tarih nesnesi
 * @returns YYYY-MM-DD formatında string
 */
export function dateToYMD(date: Date): string {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
}
