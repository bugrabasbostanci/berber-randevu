import { startOfDay } from "date-fns"

export const MAX_APPOINTMENTS_PER_DAY = 8

export const BARBERS = [
  { id: 1, name: "Ahmet Usta" },
  { id: 2, name: "Mehmet Usta" }
]

export const getCurrentDate = () => startOfDay(new Date())

export const isDayFullyClosed = (date: Date, barberId: number) => {
  // Pazar günleri kapalı
  if (date.getDay() === 0) return true
  return false
}

type AppointmentStatus = "confirmed" | "pending" | "cancelled"

export interface Appointment {
  id: number
  barberId: number
  customerName: string
  date: Date
  status: AppointmentStatus
}

// Örnek randevular
export const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: 1,
    barberId: 1,
    customerName: "İbrahim Çelik",
    date: new Date(2024, 3, 15, 10, 0), // 15 Nisan 2024, 10:00
    status: "confirmed"
  },
  {
    id: 2,
    barberId: 2,
    customerName: "Mustafa Demir",
    date: new Date(2024, 3, 15, 11, 0),
    status: "pending"
  },
  {
    id: 3,
    barberId: 1,
    customerName: "Ali Yılmaz",
    date: new Date(2024, 3, 16, 9, 0),
    status: "confirmed"
  },
  {
    id: 4,
    barberId: 2,
    customerName: "Veli Şahin",
    date: new Date(2024, 3, 17, 13, 0),
    status: "confirmed"
  }
] 