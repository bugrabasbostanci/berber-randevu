import { useState, useEffect } from "react"
import {
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfDay,
  endOfDay,
  addDays,
  isBefore,
  isAfter,
  parseISO
} from "date-fns"
import { toast } from "sonner"
import { getCurrentDate, getAllowedUsers, getAppointmentsForDateRange } from "@/lib/data"
import { Appointment, AllowedUser } from "@/types"
import { isDayClosed } from "@/components/calendar/shared/utils/date-utils"
import { useCalendarContext } from "@/components/calendar/shared/context/calendar-context"

export const useCalendar = (isAuthenticated: boolean) => {
  const {
    viewMode,
    setViewMode,
    selectedDate,
    setSelectedDate,
    today,
    maxDate,
    refreshTrigger
  } = useCalendarContext()

  const [currentMonth, setCurrentMonth] = useState<Date>(getCurrentDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [loading, setLoading] = useState(true)

  // Kullanıcıları getir
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await getAllowedUsers()
        setUsers(users)
      } catch (error) {
        console.error("Kullanıcılar getirilirken hata oluştu:", error)
        toast.error("Kullanıcılar getirilirken bir hata oluştu")
      }
    }

    fetchUsers()
  }, [])

  // Ay değiştiğinde veya refreshTrigger değiştiğinde randevuları getir
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        const monthlyAppointments = await getAppointmentsForDateRange(start, end)
        setAppointments(monthlyAppointments)
      } catch (error) {
        console.error("Randevular getirilirken hata oluştu:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [currentMonth, refreshTrigger])

  // Görünüm değiştiğinde seçili günü güncelle
  useEffect(() => {
    if (viewMode === "month") {
      if (isBefore(selectedDate, today) || isAfter(selectedDate, maxDate)) {
        setSelectedDate(today)
      }
    }
  }, [viewMode, selectedDate, today, maxDate, setSelectedDate])

  // Önceki aya git
  const goToPreviousMonth = (): void => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  // Sonraki aya git
  const goToNextMonth = (): void => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Takvimi yenile
  const refreshCalendar = () => {
    // Context içindeki refresh fonksiyonu kullanılacak
  }

  // Bir güne tıklandığında
  const handleDayClick = (day: Date): void => {
    if (isDayClosed(day)) {
      toast.error("Pazar günleri hizmet verilmemektedir")
      return
    }

    if (!isAuthenticated && (isBefore(day, today) || isAfter(day, maxDate))) {
      return
    }

    setSelectedDate(day)
    setViewMode("day")
  }

  // Gün görünümünden aylık görünüme dön
  const backToMonthView = (): void => {
    setViewMode("month")
  }

  // Belirli bir tarihe git (day-view'dan gelen istekler için)
  const goToDate = (dateStr: string): void => {
    try {
      const date = parseISO(dateStr)
      if (!isDayClosed(date)) {
        setSelectedDate(date)
        setViewMode("day")
      } else {
        toast.error("Pazar günleri hizmet verilmemektedir")
      }
    } catch (error) {
      console.error("Tarih ayrıştırılırken hata oluştu:", error)
    }
  }

  return {
    viewMode,
    currentMonth,
    selectedDate,
    appointments,
    users,
    loading,
    today,
    maxDate,
    goToPreviousMonth,
    goToNextMonth,
    refreshCalendar,
    handleDayClick,
    backToMonthView,
    goToDate
  }
} 