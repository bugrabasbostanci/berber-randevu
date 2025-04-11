"use client"

import { format, getDay } from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, Pencil, Trash2, Plus, Ban, Lock, CalendarX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Appointment, AllowedUser, ClosedSlot } from "@/types"
import { useState, useEffect } from "react"
import { AppointmentForm } from "./appointment-form"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useMobile } from "@/lib/use-mobile"

interface DayViewProps {
  date: Date
  appointments: Appointment[]
  users: AllowedUser[]
  onBack: () => void
  onRefresh: () => void
}

const WORKING_HOURS = {
  start: 9.5, // 09:30
  end: 21,    // 21:00
  interval: 0.75 // 45 dakika
}

// Zaman dilimlerini oluşturan yardımcı fonksiyon
const generateTimeSlots = (date: Date) => {
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

export function DayView({ date, appointments, users, onBack, onRefresh }: DayViewProps) {
  const { isAuthenticated } = useAuth()
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
  const { isMobile, isBreakpoint } = useMobile()

  const isSunday = getDay(date) === 0
  const timeSlots = generateTimeSlots(date)

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

  // İsim gizleme fonksiyonu
  const maskName = (fullname: string): string => {
    if (isAuthenticated()) {
      return fullname
    }
    // İsim ve soyisim baş harflerini al
    const [name, surname] = fullname.split(" ")
    return `${name?.charAt(0) || ""}. ${surname?.charAt(0) || ""}.`
  }

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="sm:px-4 px-2"
        >
          <ChevronLeft className="h-4 w-4 sm:mr-2" />
          <span className={cn("transition-opacity", isBreakpoint.sm ? "opacity-0 hidden" : "opacity-100")}>
            Takvime Dön
          </span>
        </Button>
      </div>

      <Card className="p-2 sm:p-4">
        <h2 className="text-lg sm:text-xl font-bold mb-4 px-2">
          {format(date, "d MMMM", { locale: tr })}
          {", "}
          {format(date, "EEEE", { locale: tr })}
          {isSunday && (
            <span className="ml-2 text-sm font-normal text-red-500">
              (Kapalı)
            </span>
          )}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map(user => (
            <div key={user.id} className="space-y-3">
              <div className="flex items-center justify-between sticky top-0 bg-background p-2 border-b">
                <h3 className="text-base sm:text-lg font-semibold">
                  {user.name}
                </h3>
                {isAuthenticated() && !isSunday && (
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleCloseDay(user.id)} 
                      size={isBreakpoint.sm ? "sm" : "default"}
                      variant="destructive"
                      className="whitespace-nowrap"
                    >
                      <CalendarX className="h-4 w-4 sm:mr-2" />
                      <span className={cn("transition-opacity", isBreakpoint.sm ? "opacity-0 hidden" : "opacity-100")}>
                        Günü Kapat
                      </span>
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2 px-2">
                {timeSlots.map(slot => {
                  const appointment = appointments.find(
                    app => app.userId === user.id && 
                          format(new Date(app.date), "HH:mm") === slot.formattedTime
                  )

                  const isSlotClosed = closedSlots.some(
                    closedSlot => 
                      closedSlot.userId === user.id && 
                      format(new Date(closedSlot.date), "HH:mm") === slot.formattedTime
                  )

                  return (
                    <div
                      key={`${user.id}-${slot.formattedTime}`}
                      className={cn(
                        "flex items-center justify-between p-2 sm:p-3 border rounded-lg",
                        appointment ? "bg-gray-50" : "hover:bg-gray-50",
                        isSlotClosed && "bg-red-50 border-red-200"
                      )}
                    >
                      <div className="min-w-[45px] sm:min-w-[60px] font-medium text-sm sm:text-base">
                        {slot.formattedTime}
                      </div>
                      
                      {isSlotClosed ? (
                        <div className="flex-1 ml-3">
                          <div className="text-sm text-red-600 font-medium">
                            Kapalı
                          </div>
                          <div className="text-xs text-red-500 hidden sm:block">
                            {closedSlots.find(
                              closedSlot => 
                                closedSlot.userId === user.id && 
                                format(new Date(closedSlot.date), "HH:mm") === slot.formattedTime
                            )?.reason}
                          </div>
                        </div>
                      ) : appointment ? (
                        <div className="flex-1 ml-3">
                          <div className="text-sm sm:text-base">
                            {maskName(appointment.fullname)}
                          </div>
                          {isAuthenticated() && (
                            <div className="text-xs sm:text-sm text-muted-foreground">
                              {appointment.phone}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex-1 ml-3 text-sm text-muted-foreground">
                          Müsait
                        </div>
                      )}

                      {isAuthenticated() && (
                        <div className="flex gap-1 sm:gap-2">
                          {isSlotClosed ? (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenSlot(user.id, slot.time)}
                              title="Zaman Dilimini Aç"
                              className="h-8 w-8 sm:h-9 sm:w-9"
                            >
                              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                            </Button>
                          ) : appointment ? (
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEdit(appointment)}
                                title="Randevuyu Düzenle"
                                className="h-8 w-8 sm:h-9 sm:w-9"
                              >
                                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(appointment.id)}
                                title="Randevuyu Sil"
                                className="h-8 w-8 sm:h-9 sm:w-9"
                              >
                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex gap-1 sm:gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCreate(user.id, slot.time)}
                                title="Yeni Randevu Ekle"
                                className="h-8 w-8 sm:h-9 sm:w-9"
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleCloseTimeSlot(user.id, slot.time)}
                                title="Zaman Dilimini Kapat"
                                className="h-8 w-8 sm:h-9 sm:w-9"
                              >
                                <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={() => {
          setIsAppointmentFormOpen(false)
          setSelectedUserId(null)
          setSelectedAppointment(undefined)
          setIsCreating(false)
          setSelectedSlotTime(null)
        }}
        onSuccess={onRefresh}
        appointment={selectedAppointment}
        selectedDate={date}
        userId={selectedUserId || 1}
        isCreating={isCreating}
        selectedTime={selectedAppointment ? format(new Date(selectedAppointment.date), "HH:mm") : selectedSlotTime ? format(selectedSlotTime, "HH:mm") : undefined}
      />

      <AlertDialog open={closeDayDialogOpen} onOpenChange={setCloseDayDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Günü Kapat</AlertDialogTitle>
            <AlertDialogDescription>
              Bu günü kapatmak istediğinizden emin misiniz? Bu işlem tüm zaman dilimlerini kapatacak ve randevu alınmasını engelleyecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmCloseDay}>Kapat</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Randevuyu Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu randevuyu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Sil</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 