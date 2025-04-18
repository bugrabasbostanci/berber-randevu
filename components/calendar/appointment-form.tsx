"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Appointment } from "@/types"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader } from "@/components/ui/loader"
import { useCalendarContext } from "./shared/context/calendar-context"
import { 
  safeParseDate, 
  toISODateString, 
  formatTimeFromDate, 
} from "@/lib/utils"

interface AppointmentFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  appointment?: Appointment
  selectedDate: Date | string
  userId: number
  isCreating: boolean
  selectedTime?: string
}

// Çalışma saatleri: 09:30 - 20:45, 45 dakikalık aralıklarla
const WORKING_HOURS = {
  start: 9.5, // 09:30
  end: 20.75,    // 20:45
  interval: 0.75 // 45 dakika
}

// Saat dilimlerini oluştur
const generateTimeSlots = () => {
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

export function AppointmentForm({
  isOpen,
  onClose,
  onSuccess,
  appointment,
  selectedDate,
  userId,
  isCreating,
  selectedTime
}: AppointmentFormProps) {
  const { refreshCalendar } = useCalendarContext()
  const [formData, setFormData] = useState({
    fullname: "",
    date: typeof selectedDate === 'string' ? selectedDate : toISODateString(selectedDate),
    time: selectedTime || formatTimeFromDate(selectedDate),
    phone: "",
    userId: userId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!isOpen) {
      // Form verilerini sıfırla
      setFormData({
        fullname: "",
        date: typeof selectedDate === 'string' ? selectedDate : toISODateString(selectedDate),
        time: selectedTime || formatTimeFromDate(selectedDate),
        phone: "",
        userId: userId
      })
      setIsSubmitting(false)
    }
  }, [isOpen, selectedDate, selectedTime, userId])

  // Form verilerini appointment veya isCreating değiştiğinde güncelle
  useEffect(() => {
    if (appointment) {
      setFormData({
        fullname: appointment.fullname,
        date: toISODateString(appointment.date),
        time: formatTimeFromDate(appointment.date),
        phone: appointment.phone,
        userId: userId
      })
    } else if (isCreating) {
      setFormData(prev => ({
        ...prev,
        time: selectedTime || formatTimeFromDate(selectedDate)
      }))
    }
  }, [appointment, isCreating, selectedDate, userId, selectedTime])

  useEffect(() => {
    // Seçilen tarih için saat dilimlerini oluştur
    const slots = generateTimeSlots()
    setTimeSlots(slots)

    // Seçilen tarihteki mevcut randevuları getir
    const fetchBookedSlots = async () => {
      setIsLoadingSlots(true)
      try {
        const dateStr = toISODateString(selectedDate)
        const response = await fetch(`/api/appointments/date/${dateStr}`)
        if (response.ok) {
          const appointments = await response.json()
          const bookedTimes = appointments.map((app: Appointment) => 
            formatTimeFromDate(app.date)
          )
          setBookedSlots(bookedTimes)
        }
      } catch (error) {
        console.error("Randevular getirilirken hata oluştu:", error)
      } finally {
        setIsLoadingSlots(false)
      }
    }

    fetchBookedSlots()
  }, [selectedDate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Seçilen saat diliminin dolu olup olmadığını kontrol et
      const selectedDateTime = safeParseDate(`${formData.date}T${formData.time}`)
      const formattedTime = formatTimeFromDate(selectedDateTime)
      
      // Yeni randevu oluşturulurken dolu saat kontrolü
      if (!appointment && bookedSlots.includes(formattedTime)) {
        toast.error("Bu saat dilimi dolu. Lütfen başka bir saat seçin.")
        setIsSubmitting(false)
        return
      }

      // Optimistic UI güncelleme
      if (appointment) {
        // Mevcut randevunun güncellenmesi durumunda optimistic UI güncelleme
        toast.promise(
          async () => {
            // Kapatılmış saat dilimi kontrolü
            const checkSlotUrl = `/api/appointments/check-closed-slot?date=${formData.date}&time=${formData.time}&userId=${userId}`
            console.log(`Kapalı slot kontrolü için istek: ${checkSlotUrl}`)
            
            const checkResponse = await fetch(checkSlotUrl)
            const checkData = await checkResponse.json()
            
            console.log(`Kapalı slot kontrolü yanıtı:`, checkData)
            
            if (!appointment && checkData.isClosed) {
              throw new Error(`Bu saat dilimi kapatılmış: ${formData.time}. ${checkData.reason ? 'Sebep: ' + checkData.reason : ''}`)
            }

            const endpoint = `/api/appointments/${appointment.id}`
            const response = await fetch(endpoint, {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...formData,
                date: `${formData.date}T${formData.time}`,
                userId: userId
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              if (response.status === 400) {
                throw new Error("Bu saat diliminde zaten bir randevu bulunmaktadır.")
              }
              throw new Error(errorData.error || "Randevu kaydedilemedi")
            }

            const updatedAppointment = await response.json()
            // İşlem başarılı
            refreshCalendar() // Takvimi yenile
            onSuccess() // Callback'i çağır
            onClose() // Modalı kapat
            return updatedAppointment
          },
          {
            loading: 'Randevu güncelleniyor...',
            success: () => 'Randevu başarıyla güncellendi',
            error: (err) => err.message || 'Randevu güncellenirken bir hata oluştu'
          }
        )
      } else {
        // Yeni randevu oluşturma durumunda optimistic UI güncelleme
        toast.promise(
          async () => {
            // Kapatılmış saat dilimi kontrolü
            const checkSlotUrl = `/api/appointments/check-closed-slot?date=${formData.date}&time=${formData.time}&userId=${userId}`
            console.log(`Kapalı slot kontrolü için istek: ${checkSlotUrl}`)
            
            const checkResponse = await fetch(checkSlotUrl)
            const checkData = await checkResponse.json()
            
            console.log(`Kapalı slot kontrolü yanıtı:`, checkData)

            if (checkData.isClosed) {
              throw new Error(`Bu saat dilimi kapatılmış: ${formData.time}. ${checkData.reason ? 'Sebep: ' + checkData.reason : ''}`)
            }

            const endpoint = "/api/appointments"
            const response = await fetch(endpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                ...formData,
                date: `${formData.date}T${formData.time}`,
                userId: userId
              }),
            })

            if (!response.ok) {
              const errorData = await response.json()
              if (response.status === 400) {
                throw new Error("Bu saat diliminde zaten bir randevu bulunmaktadır.")
              }
              throw new Error(errorData.error || "Randevu oluşturulamadı")
            }

            const newAppointment = await response.json()
            // İşlem başarılı
            refreshCalendar() // Takvimi yenile
            onSuccess() // Callback'i çağır
            onClose() // Modalı kapat
            return newAppointment
          },
          {
            loading: 'Randevu oluşturuluyor...',
            success: () => 'Randevu başarıyla oluşturuldu',
            error: (err) => err.message || 'Randevu oluşturulurken bir hata oluştu'
          }
        )
      }
    } catch (error) {
      console.error("Randevu kaydedilirken hata oluştu:", error)
      toast.error(error instanceof Error ? error.message : "Randevu kaydedilemedi")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {appointment ? "Randevuyu Düzenle" : "Yeni Randevu"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullname">Ad Soyad</Label>
            <Input
              id="fullname"
              name="fullname"
              value={formData.fullname}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="Örn: Ahmet Yılmaz"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Tarih</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Saat</Label>
            {isLoadingSlots ? (
              <div className="h-9 flex items-center justify-center">
                <Loader size="sm" text="Uygun saatler yükleniyor..." />
              </div>
            ) : (
              <Select
                value={formData.time}
                onValueChange={(value) => {
                  // Seçilen saat dolu mu kontrol et
                  if (!appointment && bookedSlots.includes(value)) {
                    toast.error("Bu saat dilimi dolu. Lütfen başka bir saat seçin.")
                    return
                  }
                  setFormData(prev => ({ ...prev, time: value }))
                }}
                disabled={!!appointment || isSubmitting} // Eğer randevu düzenleniyorsa veya form gönderiliyorsa saat seçimi devre dışı
              >
                <SelectTrigger>
                  <SelectValue placeholder="Saat seçin" />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map((time) => (
                    <SelectItem
                      key={time}
                      value={time}
                      disabled={!appointment && bookedSlots.includes(time)}
                    >
                      {time} {!appointment && bookedSlots.includes(time) ? "(Dolu)" : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              placeholder="0555 444 33 22"
            />
          </div>
          <Button type="submit" disabled={isSubmitting || isLoadingSlots} className="w-full">
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader size="sm" />
                <span>{appointment ? "Güncelleniyor..." : "Oluşturuluyor..."}</span>
              </div>
            ) : (
              appointment ? "Güncelle" : "Kaydet"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 