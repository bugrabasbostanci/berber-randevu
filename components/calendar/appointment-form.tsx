"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Appointment } from "@/types"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft } from "lucide-react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

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

// Çalışma saatleri: 09:30 - 21:00, 45 dakikalık aralıklarla
const WORKING_HOURS = {
  start: 9.5, // 09:30
  end: 21,    // 21:00
  interval: 0.75 // 45 dakika
}

// Saat dilimlerini oluştur
const generateTimeSlots = (date: Date) => {
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
  const [formData, setFormData] = useState({
    fullname: "",
    date: typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "yyyy-MM-dd"),
    time: selectedTime || format(new Date(selectedDate), "HH:mm"),
    phone: "",
    userId: userId
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [bookedSlots, setBookedSlots] = useState<string[]>([])

  // Form verilerini sıfırla
  const resetForm = () => {
    setFormData({
      fullname: "",
      date: typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "yyyy-MM-dd"),
      time: selectedTime || format(new Date(selectedDate), "HH:mm"),
      phone: "",
      userId: userId
    })
    setIsSubmitting(false)
  }

  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!isOpen) {
      resetForm()
    }
  }, [isOpen])

  // Form verilerini appointment veya isCreating değiştiğinde güncelle
  useEffect(() => {
    if (appointment) {
      setFormData({
        fullname: appointment.fullname,
        date: format(new Date(appointment.date), "yyyy-MM-dd"),
        time: format(new Date(appointment.date), "HH:mm"),
        phone: appointment.phone,
        userId: userId
      })
    } else if (isCreating) {
      setFormData(prev => ({
        ...prev,
        time: selectedTime || format(new Date(selectedDate), "HH:mm")
      }))
    }
  }, [appointment, isCreating, selectedDate, userId, selectedTime])

  useEffect(() => {
    // Seçilen tarih için saat dilimlerini oluştur
    const slots = generateTimeSlots(selectedDate as Date)
    setTimeSlots(slots)

    // Seçilen tarihteki mevcut randevuları getir
    const fetchBookedSlots = async () => {
      try {
        const response = await fetch(`/api/appointments/date/${format(selectedDate as Date, "yyyy-MM-dd")}`)
        if (response.ok) {
          const appointments = await response.json()
          const bookedTimes = appointments.map((app: Appointment) => 
            format(new Date(app.date), "HH:mm")
          )
          setBookedSlots(bookedTimes)
        }
      } catch (error) {
        console.error("Randevular getirilirken hata oluştu:", error)
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
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`)
      const formattedTime = format(selectedDateTime, "HH:mm")
      
      // Yeni randevu oluşturulurken dolu saat kontrolü
      if (!appointment && bookedSlots.includes(formattedTime)) {
        toast.error("Bu saat dilimi dolu. Lütfen başka bir saat seçin.")
        setIsSubmitting(false)
        return
      }

      // Kapatılmış saat dilimi kontrolü
      const isSlotClosed = await fetch(`/api/appointments/check-closed-slot?date=${formData.date}T${formData.time}&userId=${userId}`)
        .then(res => res.json())
        .then(data => data.isClosed)
        .catch(() => false)

      if (!appointment && isSlotClosed) {
        toast.error("Bu saat dilimi kapatılmış. Lütfen başka bir saat seçin.")
        setIsSubmitting(false)
        return
      }

      const method = appointment ? "PUT" : "POST"
      const endpoint = appointment 
        ? `/api/appointments/${appointment.id}`
        : "/api/appointments"

      const response = await fetch(endpoint, {
        method,
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
          toast.error("Bu saat diliminde zaten bir randevu bulunmaktadır. Lütfen başka bir saat seçin.")
        } else {
          throw new Error(errorData.error || "Randevu kaydedilemedi")
        }
        setIsSubmitting(false)
        return
      }

      toast.success(
        appointment 
          ? "Randevu başarıyla güncellendi"
          : "Randevu başarıyla oluşturuldu"
      )
      onSuccess()
      onClose()
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time">Saat</Label>
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
              disabled={!!appointment} // Eğer randevu düzenleniyorsa saat seçimi devre dışı
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
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Kaydediliyor..." : appointment ? "Güncelle" : "Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 