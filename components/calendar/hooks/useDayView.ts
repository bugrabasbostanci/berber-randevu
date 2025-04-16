import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Appointment, ClosedSlot } from "@/types"

interface UseDayViewProps {
  date: Date
  onRefresh: () => void
}

export const useDayView = ({ date, onRefresh }: UseDayViewProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [closedSlots, setClosedSlots] = useState<ClosedSlot[]>([])
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false)
  const [dayToClose, setDayToClose] = useState<{ userId: number; date: Date } | null>(null)
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false)
  const [selectedSlotTime, setSelectedSlotTime] = useState<Date | null>(null)

  // Kapatılan zaman dilimlerini getir
  useEffect(() => {
    const fetchClosedSlots = async () => {
      try {
        const response = await fetch(`/api/appointments/closed-slots?date=${date.toISOString()}`)
        if (response.ok) {
          const data = await response.json()
          setClosedSlots(data)
        }
      } catch (error) {
        console.error("Kapatılan zaman dilimleri getirilirken hata oluştu:", error)
      }
    }

    fetchClosedSlots()
  }, [date])

  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setSelectedUserId(appointment.userId)
    setIsCreating(false)
    setIsAppointmentFormOpen(true)
  }

  const handleDelete = async (appointmentId: string) => {
    setAppointmentToDelete(appointmentId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!appointmentToDelete) return

    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: "DELETE"
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Randevu silinemedi")
      }

      toast.success("Randevu başarıyla silindi")
      onRefresh()
    } catch (error) {
      console.error("Randevu silinirken hata oluştu:", error)
      toast.error(error instanceof Error ? error.message : "Randevu silinirken bir hata oluştu")
    } finally {
      setDeleteDialogOpen(false)
      setAppointmentToDelete(null)
    }
  }

  const handleCreate = (userId: number, slotTime: Date) => {
    setSelectedAppointment(undefined)
    setSelectedUserId(userId)
    setSelectedSlotTime(slotTime)
    setIsCreating(true)
    setIsAppointmentFormOpen(true)
  }

  const handleCloseTimeSlot = async (userId: number, time: Date) => {
    try {
      const response = await fetch('/api/appointments/close-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date: time,
          reason: 'Berber/Çalışan tarafından kapatıldı'
        })
      })

      if (!response.ok) {
        throw new Error('Zaman dilimi kapatılamadı')
      }

      toast.success('Zaman dilimi başarıyla kapatıldı')
      onRefresh()
    } catch (error) {
      console.error('Zaman dilimi kapatılırken hata oluştu:', error)
      toast.error(error instanceof Error ? error.message : 'Zaman dilimi kapatılamadı')
    }
  }

  const handleCloseDay = async (userId: number) => {
    setDayToClose({ userId, date })
    setCloseDayDialogOpen(true)
  }

  const confirmCloseDay = async () => {
    if (!dayToClose) return

    try {
      const response = await fetch('/api/appointments/close-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: dayToClose.userId,
          date: dayToClose.date,
          reason: 'Berber/Çalışan tarafından tüm gün kapatıldı'
        })
      })

      if (!response.ok) {
        throw new Error('Gün kapatılamadı')
      }

      const data = await response.json()
      toast.success(data.message)
      onRefresh()
    } catch (error) {
      console.error('Gün kapatılırken hata oluştu:', error)
      toast.error(error instanceof Error ? error.message : 'Gün kapatılamadı')
    } finally {
      setCloseDayDialogOpen(false)
      setDayToClose(null)
    }
  }

  const handleOpenSlot = async (userId: number, time: Date) => {
    try {
      const response = await fetch('/api/appointments/open-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date: time
        })
      })

      if (!response.ok) {
        throw new Error('Zaman dilimi açılamadı')
      }

      toast.success('Zaman dilimi başarıyla açıldı')
      onRefresh()
    } catch (error) {
      console.error('Zaman dilimi açılırken hata oluştu:', error)
      toast.error(error instanceof Error ? error.message : 'Zaman dilimi açılamadı')
    }
  }

  const handleCloseAppointmentForm = () => {
    setIsAppointmentFormOpen(false)
    setSelectedUserId(null)
    setSelectedAppointment(undefined)
    setIsCreating(false)
    setSelectedSlotTime(null)
  }

  return {
    closedSlots,
    selectedAppointment,
    isCreating,
    appointmentToDelete,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedUserId,
    closeDayDialogOpen,
    setCloseDayDialogOpen,
    isAppointmentFormOpen,
    selectedSlotTime,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCreate,
    handleCloseTimeSlot,
    handleCloseDay,
    confirmCloseDay,
    handleOpenSlot,
    handleCloseAppointmentForm
  }
} 