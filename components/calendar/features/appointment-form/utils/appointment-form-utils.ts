// Çalışma saatleri: 09:30 - 20:45, 45 dakikalık aralıklarla
export const WORKING_HOURS = {
  start: 9.5, // 09:30
  end: 20.75,    // 20:45
  interval: 0.75 // 45 dakika
}

// Saat dilimlerini dizgi olarak oluştur
export const generateTimeSlots = (): string[] => {
  const slots = []
  let currentTime = WORKING_HOURS.start

  while (currentTime < WORKING_HOURS.end) {
    const hours = Math.floor(currentTime)
    const minutes = Math.round((currentTime % 1) * 60)
    const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
    slots.push(timeString)
    currentTime += WORKING_HOURS.interval
  }

  return slots
}

// Tarih ve saati birleştirerek ISO string formatında döndür
export const combineDateAndTime = (date: string, time: string): string => {
  return `${date}T${time}`
}

// Randevu nesnesi oluştur (form verilerinden)
export const createAppointmentData = (
  fullname: string, 
  date: string, 
  time: string, 
  phone: string,
  userId: number
) => {
  return {
    fullname,
    date: combineDateAndTime(date, time),
    phone,
    userId
  }
} 