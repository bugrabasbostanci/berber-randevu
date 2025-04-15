"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Appointment } from "@/types"
import { format } from "date-fns"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { generateTimeSlots, createAppointmentData } from "./utils/appointment-form-utils"
import { useAppointments } from "../../shared/hooks/useAppointments"

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
  const { isLoading, createAppointment, updateAppointment } = useAppointments()
  const [formData, setFormData] = useState({
    fullname: "",
    date: typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "yyyy-MM-dd"),
    time: selectedTime || format(new Date(selectedDate), "HH:mm"),
    phone: "",
    userId: userId
  })
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
        fullname: "",
        phone: "",
        date: typeof selectedDate === 'string' ? selectedDate : format(selectedDate, "yyyy-MM-dd"),
        time: selectedTime || format(new Date(selectedDate), "HH:mm"),
        userId: userId
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

    try {
      // Seçilen saat diliminin dolu olup olmadığını kontrol et
      const selectedDateTime = new Date(`${formData.date}T${formData.time}`)
      const formattedTime = format(selectedDateTime, "HH:mm")
      
      // Yeni randevu oluşturulurken dolu saat kontrolü
      if (!appointment && bookedSlots.includes(formattedTime)) {
        toast.error("Bu saat dilimi dolu. Lütfen başka bir saat seçin.")
        return
      }

      // Kapatılmış saat dilimi kontrolü
      const isSlotClosed = await fetch(`/api/appointments/check-closed-slot?date=${formData.date}T${formData.time}&userId=${userId}`)
        .then(res => res.json())
        .then(data => data.isClosed)
        .catch(() => false)

      if (!appointment && isSlotClosed) {
        toast.error("Bu saat dilimi kapatılmış. Lütfen başka bir saat seçin.")
        return
      }

      const appointmentData = {
        fullname: formData.fullname,
        date: new Date(`${formData.date}T${formData.time}`),
        phone: formData.phone,
        userId: userId
      }

      let success = false

      if (appointment) {
        success = await updateAppointment(appointment.id, appointmentData)
      } else {
        success = await createAppointment(appointmentData)
      }

      if (success) {
        onSuccess()
        onClose()
      }
    } catch (error) {
      console.error("Randevu kaydedilirken hata oluştu:", error)
      toast.error(error instanceof Error ? error.message : "Randevu kaydedilemedi")
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
              disabled={!!appointment || isCreating} // Eğer randevu düzenleniyorsa veya yeni randevu oluşturuluyorsa saat seçimi devre dışı
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
            {isCreating && (
              <p className="text-xs text-muted-foreground mt-1">
                Seçtiğiniz saat: {formData.time}. Saati değiştirmek için geri dönüp farklı bir saat dilimi seçebilirsiniz.
              </p>
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
            />
          </div>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Kaydediliyor..." : appointment ? "Güncelle" : "Kaydet"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
} 