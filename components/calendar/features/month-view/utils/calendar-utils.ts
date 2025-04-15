import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay,
  isBefore,
  isAfter,
  isSameDay 
} from "date-fns"
import { MAX_APPOINTMENTS_PER_DAY, isDayFullyClosed } from "@/lib/data"
import { Appointment } from "@/types"
import { isDayClosed } from "@/components/calendar/shared/utils/date-utils"

export type DayStatus = "empty" | "low" | "medium" | "full" | "closed"

// Tüm takvim günlerini getir
export const getDaysToDisplay = (currentMonth: Date): Date[] => {
  return eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })
}

// Takvim başlangıcı için boş günler (önceki aydan)
export const getEmptyDaysAtStart = (currentMonth: Date): number => {
  const startDay = getDay(startOfMonth(currentMonth))
  return startDay === 0 ? 6 : startDay - 1 // Pazartesi başlangıç için
}

// Belirli bir gün için tüm randevuları filtrele
export const getAppointmentsForDay = (
  appointments: Appointment[], 
  day: Date, 
  isAuthenticated: boolean, 
  today: Date,
  maxDate: Date
): Appointment[] => {
  // Giriş yapılmamışsa ve gün 7 günlük periyot dışındaysa boş dizi döndür
  if (!isAuthenticated && (isBefore(day, today) || isAfter(day, maxDate))) {
    return []
  }

  return appointments.filter((appointment) =>
    isSameDay(new Date(appointment.date), day)
  ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Belirli bir gün için randevu doluluk oranını hesapla
export const getAppointmentFullnessForDay = (
  appointments: Appointment[],
  day: Date
): number => {
  const dayAppointments = appointments.filter((appointment) =>
    isSameDay(new Date(appointment.date), day)
  )
  return dayAppointments.length / MAX_APPOINTMENTS_PER_DAY
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

// Günün doluluk durumuna göre renk sınıfını belirle
export const getDayStatusClass = (day: Date, appointments: Appointment[]): string => {
  const status = getDayStatus(day, appointments)
  switch (status) {
    case "empty":
      return "bg-white border-gray-200"
    case "low":
      return "bg-green-50 border-green-200 text-green-700"
    case "medium":
      return "bg-yellow-50 border-yellow-200 text-yellow-700"
    case "full":
      return "bg-red-50 border-red-200 text-red-700"
    case "closed":
      return "bg-gray-50 border-gray-200 text-gray-400"
  }
}

// Günün doluluk durumuna göre gösterge rengi
export const getDayIndicatorClass = (day: Date, appointments: Appointment[]): string => {
  const status = getDayStatus(day, appointments)
  switch (status) {
    case "empty":
      return "hidden"
    case "low":
      return "bg-green-500"
    case "medium":
      return "bg-yellow-500"
    case "full":
      return "bg-red-500"
    case "closed":
      return "bg-gray-400"
  }
}

// Günün aktif olup olmadığını kontrol et
export const isDayActive = (day: Date, isAuthenticated: boolean): boolean => {
  if (isAuthenticated) {
    return !isDayClosed(day) && !isDayFullyClosed(day)
  } else {
    return !isBefore(day, new Date()) && !isAfter(day, new Date(Date.now() + 6 * 24 * 60 * 60 * 1000)) && !isDayClosed(day) && !isDayFullyClosed(day)
  }
}

// Günün görünür olup olmadığını kontrol et
export const isDayVisible = (day: Date, isAuthenticated: boolean, today: Date, maxDate: Date): boolean => {
  if (isAuthenticated) {
    return true
  } else {
    return !isBefore(day, today) && !isAfter(day, maxDate)
  }
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