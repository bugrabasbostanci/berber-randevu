import { format } from "date-fns"
import { tr } from "date-fns/locale"

// Günün kapalı olup olmadığını kontrol et (Pazar günleri kapalı)
export const isDayClosed = (date: Date): boolean => {
  return date.getDay() === 0 // 0 = Pazar günü
}

// Tarih formatı (kısa format): 01 Oca
export const formatShortDate = (date: Date): string => {
  return format(date, "d MMM", { locale: tr })
}

// Tarih formatı (orta format): 01 Ocak
export const formatMediumDate = (date: Date): string => {
  return format(date, "d MMMM", { locale: tr })
}

// Tarih formatı (uzun format): 01 Ocak 2023
export const formatLongDate = (date: Date): string => {
  return format(date, "d MMMM yyyy", { locale: tr })
}

// Tarih formatı (gün adı): Pazartesi
export const formatDayName = (date: Date): string => {
  return format(date, "EEEE", { locale: tr })
}

// Saat formatı: 09:30
export const formatTime = (date: Date): string => {
  return format(date, "HH:mm")
}

// Ay formatı: Ocak 2023
export const formatMonth = (date: Date): string => {
  return format(date, "MMMM yyyy", { locale: tr })
}

// UTC tarihini yerel tarihe çevir
export const utcToLocalDate = (utcDate: Date | string): Date => {
  const date = typeof utcDate === "string" ? new Date(utcDate) : utcDate
  return new Date(date)
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