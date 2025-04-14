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
} from "date-fns"
import { toast } from "sonner"
import { getCurrentDate, getAllowedUsers, getAppointmentsForDateRange } from "@/lib/data"
import { Appointment, AllowedUser } from "@/types"
import { isDayClosed } from "@/components/calendar/utils/calendar-utils"

type ViewMode = "month" | "day"

export const useCalendar = (isAuthenticated: boolean) => {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentMonth, setCurrentMonth] = useState<Date>(getCurrentDate())
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [users, setUsers] = useState<AllowedUser[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Bugünden itibaren 7 günlük aralık
  const today = startOfDay(getCurrentDate())
  const maxDate = endOfDay(addDays(today, 6)) // Bugün + 6 gün = 7 günlük aralık

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
  }, [viewMode, selectedDate, today, maxDate])

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
    setRefreshTrigger(prev => prev + 1)
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
    backToMonthView
  }
} 