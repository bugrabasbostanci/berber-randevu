import { Appointment } from "@/types"

export const sampleAppointments: Appointment[] = [
  {
    id: 1,
    customerName: "İbrahim",
    customerSurname: "Çelik",
    date: "2024-04-15T10:00:00",
    service: "Saç Kesimi",
    status: "confirmed",
    phone: "555-123-4567"
  },
  {
    id: 2,
    customerName: "Mustafa",
    customerSurname: "Demir",
    date: "2024-04-15T11:00:00",
    service: "Sakal Tıraşı",
    status: "pending",
    phone: "555-234-5678"
  },
  {
    id: 3,
    customerName: "Ali",
    customerSurname: "Yılmaz",
    date: "2024-04-16T09:00:00",
    service: "Saç Kesimi",
    status: "cancelled",
    phone: "555-345-6789"
  }
] 