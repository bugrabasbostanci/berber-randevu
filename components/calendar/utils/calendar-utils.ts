import { isBefore, isAfter, add } from "date-fns"
import { MAX_APPOINTMENTS_PER_DAY, isDayFullyClosed } from "@/lib/data"
import type { Appointment } from "@/types"

// DayStatus tipi
export type DayStatus = "empty" | "low" | "medium" | "full" | "closed"

// Takvim görünümü özellikleri
export const DAYS_IN_WEEK = 7
export const CALENDAR_WEEK_COUNT = 6
export const MONTH_NAMES = [
  "Ocak",
  "Şubat",
  "Mart",
  "Nisan",
  "Mayıs",
  "Haziran",
  "Temmuz",
  "Ağustos",
  "Eylül",
  "Ekim",
  "Kasım",
  "Aralık",
]

// Günün kapalı olup olmadığını kontrol et
export const isDayClosed = (date: Date): boolean => {
  return date.getDay() === 0 // Sadece Pazar günleri kapalı
}

// Ay içindeki günleri oluştur
export const getDaysInMonth = (month: number, year: number): Date[] => {
  const date = new Date(year, month, 1)
  const days: Date[] = []
  const lastDayOfMonth = new Date(year, month + 1, 0).getDate()

  // Ayın ilk gününden önceki günleri ekle
  const firstDayOfWeek = date.getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push(add(date, { days: i - firstDayOfWeek }))
  }

  // Ayın günlerini ekle
  for (let i = 1; i <= lastDayOfMonth; i++) {
    days.push(new Date(year, month, i))
  }

  // Son haftayı tamamlamak için sonraki ayın günlerini ekle
  const lastDay = new Date(year, month, lastDayOfMonth)
  const remainingDays = 7 - ((firstDayOfWeek + lastDayOfMonth) % 7)
  if (remainingDays < 7) {
    for (let i = 1; i <= remainingDays; i++) {
      days.push(add(lastDay, { days: i }))
    }
  }

  return days
}

// Günün doluluk durumunu belirle
export const getDayStatus = (
  day: Date,
  appointments: Appointment[]
): DayStatus => {
  if (isDayClosed(day)) return "closed"
  if (isDayFullyClosed(day)) return "closed"

  const fullness = getAppointmentFullnessForDay(appointments, day)
  if (fullness === 0) return "empty"
  if (fullness < 0.5) return "low"
  if (fullness < 1) return "medium"
  return "full"
}

// Bir gün için randevu doluluk oranını getir
export const getAppointmentFullnessForDay = (
  appointments: Appointment[],
  date: Date
): number => {
  const appointmentsForDay = appointments.filter((appointment) => {
    const appointmentDate = new Date(appointment.date)
    return (
      appointmentDate.getDate() === date.getDate() &&
      appointmentDate.getMonth() === date.getMonth() &&
      appointmentDate.getFullYear() === date.getFullYear()
    )
  })

  return appointmentsForDay.length / MAX_APPOINTMENTS_PER_DAY
}

// Etkin ay içinde olup olmadığını kontrol et
export const isInActiveMonth = (day: Date, activeMonth: number): boolean => {
  return day.getMonth() === activeMonth
}

// Kullanıcı için uygun günleri formatla
export const formatDaysForUser = async (
  days: Date[],
  activeMonth: number
): Promise<{ day: Date; status: DayStatus; isActiveMonth: boolean }[]> => {
  // Günleri ve durumlarını hazırla
  const formattedDays = await Promise.all(
    days.map(async (day) => {
      const { appointments } = await import("@/lib/data").then(module => 
        module.getAppointmentsForDate(day)
      )
      return {
        day,
        status: getDayStatus(day, appointments),
        isActiveMonth: isInActiveMonth(day, activeMonth),
      }
    })
  )

  return formattedDays
}

// Günün aktif olup olmadığını kontrol et
export const isDayActive = (day: Date, isAuthenticated: boolean): boolean => {
  if (isAuthenticated) {
    return !isDayClosed(day) && !isDayFullyClosed(day)
  } else {
    const today = new Date()
    const sixDaysLater = new Date(today.getTime() + 6 * 24 * 60 * 60 * 1000)
    
    return !isBefore(day, today) && 
           !isAfter(day, sixDaysLater) && 
           !isDayClosed(day) && 
           !isDayFullyClosed(day)
  }
}

// İsim-soyismi kısaltma
export const abbreviateFullname = (fullname: string): string => {
  if (!fullname) return ""
  const [name, surname] = fullname.split(" ")
  return `${name?.charAt(0) || ""}. ${surname?.charAt(0) || ""}.`
} 