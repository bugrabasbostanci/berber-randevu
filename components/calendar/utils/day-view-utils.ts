import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Appointment, ClosedSlot } from "@/types"

export const WORKING_HOURS = {
  start: 9.5, // 09:30
  end: 21,    // 21:00
  interval: 0.75 // 45 dakika
}

// Zaman dilimlerini oluşturan yardımcı fonksiyon
export const generateTimeSlots = (date: Date) => {
  const slots = []
  let currentTime = WORKING_HOURS.start

  while (currentTime < WORKING_HOURS.end) {
    const hours = Math.floor(currentTime)
    const minutes = Math.round((currentTime % 1) * 60)
    
    const slotDate = new Date(date)
    slotDate.setHours(hours, minutes, 0, 0)
    
    slots.push({
      time: slotDate,
      formattedTime: format(slotDate, "HH:mm")
    })
    
    currentTime += WORKING_HOURS.interval
  }
  
  return slots
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

// Bir zaman diliminin kapalı olup olmadığını kontrol et
export const isSlotClosed = (
  userId: number, 
  formattedTime: string, 
  closedSlots: ClosedSlot[]
): boolean => {
  return closedSlots.some(
    closedSlot => 
      closedSlot.userId === userId && 
      format(new Date(closedSlot.date), "HH:mm") === formattedTime
  )
}

// Bir zaman dilimi için randevu bul
export const findAppointmentForSlot = (
  userId: number, 
  formattedTime: string, 
  appointments: Appointment[]
): Appointment | undefined => {
  return appointments.find(
    app => app.userId === userId && 
          format(new Date(app.date), "HH:mm") === formattedTime
  )
}

// Bir zaman dilimi için kapanış nedeni bul
export const findClosedSlotReason = (
  userId: number, 
  formattedTime: string, 
  closedSlots: ClosedSlot[]
): string | undefined => {
  return closedSlots.find(
    closedSlot => 
      closedSlot.userId === userId && 
      format(new Date(closedSlot.date), "HH:mm") === formattedTime
  )?.reason
} 