import { startOfDay, endOfDay, startOfMonth, endOfMonth } from "date-fns"
import { Appointment, AllowedUser } from "@/types"
import { addHours, format, isSunday } from "date-fns"

// Günlük maksimum randevu sayısı
export const MAX_APPOINTMENTS_PER_DAY = 20

// Özel kapalı günler (örneğin bayramlar)
const FULLY_CLOSED_DATES: string[] = [
  "2024-04-10", // Ramazan Bayramı
  "2024-04-11",
  "2024-04-12",
  "2024-06-16", // Kurban Bayramı
  "2024-06-17",
  "2024-06-18",
  "2024-06-19"
]

// Özel kapalı günler (tarih formatı: YYYY-MM-DD)
const SPECIAL_CLOSED_DAYS = [
  "2025-01-01", // Yılbaşı
  "2025-04-23", // Ulusal Egemenlik ve Çocuk Bayramı
  "2025-05-01", // Emek ve Dayanışma Günü
  "2025-05-19", // Atatürk'ü Anma, Gençlik ve Spor Bayramı
  "2025-07-15", // Demokrasi ve Milli Birlik Günü
  "2025-08-30", // Zafer Bayramı
  "2025-10-29", // Cumhuriyet Bayramı
]

// Şu anki tarihi al
export function getCurrentDate(): Date {
  return new Date()
}

// Belirli bir günün tamamen kapalı olup olmadığını kontrol et
export function isDayFullyClosed(date: Date): boolean {
  const dateString = date.toISOString().split("T")[0]
  return FULLY_CLOSED_DATES.includes(dateString)
}

// Belirli bir gün için randevuları getir
export async function getAppointmentsForDate(date: Date): Promise<{
  appointments: Appointment[]
  users: AllowedUser[]
}> {
  try {
    // Kullanıcıları getir
    const usersResponse = await fetch('/api/users')
    if (!usersResponse.ok) throw new Error('Kullanıcılar getirilemedi')
    const users = await usersResponse.json()

    // O günün başlangıcı ve sonu
    const start = startOfDay(date)
    const end = endOfDay(date)

    // Randevuları getir
    const appointmentsResponse = await fetch(
      `/api/appointments/range?start=${start.toISOString()}&end=${end.toISOString()}`
    )
    if (!appointmentsResponse.ok) throw new Error('Randevular getirilemedi')
    const appointments = await appointmentsResponse.json()

    return { appointments, users }
  } catch (error) {
    console.error("Randevular getirilirken hata oluştu:", error)
    throw error
  }
}

// Belirli bir ay için randevuları getir
export async function getAppointmentsForMonth(date: Date) {
  try {
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const response = await fetch(
      `/api/appointments/range?start=${start.toISOString()}&end=${end.toISOString()}`
    )

    if (!response.ok) {
      throw new Error("Randevular getirilemedi")
    }

    const appointments = await response.json()
    return appointments
  } catch (error) {
    console.error("Aylık randevular getirilirken hata oluştu:", error)
    return []
  }
}

// Belirli bir tarih aralığı için randevuları getir
export async function getAppointmentsForDateRange(start: Date, end: Date): Promise<Appointment[]> {
  try {
    const response = await fetch(
      `/api/appointments/range?start=${start.toISOString()}&end=${end.toISOString()}`
    )
    
    if (!response.ok) {
      throw new Error("Randevular getirilemedi")
    }

    const appointments = await response.json()
    return appointments
  } catch (error) {
    console.error("Randevular getirilirken hata oluştu:", error)
    return []
  }
}

// Günün durumunu getir
export async function getDayStatus(date: Date) {
  const { appointments } = await getAppointmentsForDate(date)
  
  // Tüm randevuları say
  const fullness = appointments.length / MAX_APPOINTMENTS_PER_DAY

  if (isDayFullyClosed(date)) {
    return "closed"
  } else if (fullness === 0) {
    return "empty"
  } else if (fullness < 0.5) {
    return "low"
  } else if (fullness < 1) {
    return "medium"
  } else {
    return "full"
  }
}

// Kullanıcıları getiren fonksiyon
export async function getAllowedUsers(): Promise<AllowedUser[]> {
  try {
    const response = await fetch('/api/users')
    
    if (!response.ok) {
      throw new Error("Kullanıcılar getirilemedi")
    }

    const users = await response.json()
    return users
  } catch (error) {
    console.error("Kullanıcılar getirilirken hata oluştu:", error)
    return []
  }
} 