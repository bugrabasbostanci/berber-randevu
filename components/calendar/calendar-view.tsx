"use client"

import { useState, useEffect } from "react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay,
  addDays,
  getDay,
} from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, ChevronRight, Info, Ban } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { useMobile } from "@/lib/use-mobile"
import { MAX_APPOINTMENTS_PER_DAY, getCurrentDate, isDayFullyClosed, getAllowedUsers } from "@/lib/data"
import { DayView } from "./day-view"
import { useAuth } from "@/lib/auth-context"
import { Appointment, AllowedUser } from "@/types"
import { getAppointmentsForDateRange } from "@/lib/data"
import { toast } from "sonner"

type ViewMode = "month" | "day"

export function CalendarView() {
  const isMobile = useMobile()
  const { isAuthenticated } = useAuth()
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [currentMonth, setCurrentMonth] = useState<Date>(getCurrentDate())
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentDate())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [users, setUsers] = useState<AllowedUser[]>([])

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

  // Bugünden itibaren 7 günlük aralık
  const today = startOfDay(getCurrentDate())
  const maxDate = endOfDay(addDays(today, 6)) // Bugün + 6 gün = 7 günlük aralık

  // Ay değiştiğinde veya refreshTrigger değiştiğinde randevuları getir
  useEffect(() => {
    const fetchAppointments = async () => {
      setLoading(true)
      try {
        const start = startOfMonth(currentMonth)
        const end = endOfMonth(currentMonth)
        console.log("Takvim görünümü - Randevular getiriliyor...", {
          currentMonth: currentMonth.toISOString(),
          start: start.toISOString(),
          end: end.toISOString()
        })
        const monthlyAppointments = await getAppointmentsForDateRange(start, end)
        console.log("Takvim görünümü - Alınan randevular:", monthlyAppointments)
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

  // Belirli bir gün için tüm randevuları filtrele
  const getAppointmentsForDay = (day: Date) => {
    // Giriş yapılmamışsa ve gün 7 günlük periyot dışındaysa boş dizi döndür
    if (!isAuthenticated() && (isBefore(day, today) || isAfter(day, maxDate))) {
      return []
    }

    return appointments.filter((appointment) =>
      format(new Date(appointment.date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
    ).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  // Belirli bir gün için randevu doluluk oranını hesapla
  const getAppointmentFullnessForDay = (day: Date): number => {
    const appointments = getAppointmentsForDay(day)
    return appointments.length / MAX_APPOINTMENTS_PER_DAY
  }

  type DayStatus = "empty" | "low" | "medium" | "full" | "closed"

  // Günün kapalı olup olmadığını kontrol et
  function isDayClosed(date: Date): boolean {
    return date.getDay() === 0 // Sadece Pazar günleri kapalı
  }

  // Günün doluluk durumunu belirle
  const getDayStatus = (day: Date): DayStatus => {
    if (isDayClosed(day)) return "closed"
    if (isDayFullyClosed(day)) return "closed"

    const fullness = getAppointmentFullnessForDay(day)
    if (fullness === 0) return "empty"
    if (fullness < 0.5) return "low"
    if (fullness < 1) return "medium"
    return "full"
  }

  // Günün doluluk durumuna göre renk sınıfını belirle
  const getDayStatusClass = (day: Date): string => {
    const status = getDayStatus(day)
    switch (status) {
      case "empty":
        return "bg-white"
      case "low":
        return "bg-green-50"
      case "medium":
        return "bg-yellow-50"
      case "full":
        return "bg-red-50"
      case "closed":
        return "bg-gray-100"
    }
  }

  // Günün doluluk durumuna göre gösterge rengi
  const getDayIndicatorClass = (day: Date): string => {
    const status = getDayStatus(day)
    switch (status) {
      case "empty":
        return "hidden"
      case "low":
        return "bg-green-400"
      case "medium":
        return "bg-yellow-400"
      case "full":
        return "bg-red-400"
      case "closed":
        return "bg-gray-400"
    }
  }

  // İsim gizleme fonksiyonu
  const maskName = (fullname: string): string => {
    if (isAuthenticated()) {
      return fullname
    }
    // İsim ve soyisim baş harflerini al
    const [name, surname] = fullname.split(" ")
    return `${name?.charAt(0) || ""}. ${surname?.charAt(0) || ""}.`
  }

  // Takvim günlerini oluştur
  const getDaysToDisplay = (): Date[] => {
    return eachDayOfInterval({
      start: startOfMonth(currentMonth),
      end: endOfMonth(currentMonth),
    })
  }

  const daysToDisplay = getDaysToDisplay()

  // Takvim başlangıcı için boş günler (önceki aydan)
  const getEmptyDaysAtStart = (): number => {
    const startDay = getDay(startOfMonth(currentMonth))
    return startDay === 0 ? 6 : startDay - 1 // Pazartesi başlangıç için
  }

  const emptyDaysAtStart = getEmptyDaysAtStart()

  // Günün aktif olup olmadığını kontrol et
  const isDayActive = (day: Date): boolean => {
    if (isAuthenticated()) {
      return !isDayClosed(day)
    } else {
      return !isBefore(day, today) && !isAfter(day, maxDate) && !isDayClosed(day)
    }
  }

  // Günün görünür olup olmadığını kontrol et
  const isDayVisible = (day: Date): boolean => {
    if (isAuthenticated()) {
      return true
    } else {
      return !isBefore(day, today) && !isAfter(day, maxDate)
    }
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

    if (!isAuthenticated() && (isBefore(day, today) || isAfter(day, maxDate))) {
      return
    }

    setSelectedDate(day)
    setViewMode("day")
  }

  // Gün görünümünden aylık görünüme dön
  const backToMonthView = (): void => {
    setViewMode("month")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Randevular yükleniyor...</p>
      </div>
    )
  }

  if (viewMode === "day") {
    return (
      <DayView
        date={selectedDate}
        appointments={getAppointmentsForDay(selectedDate)}
        users={users}
        onBack={() => setViewMode("month")}
        onRefresh={refreshCalendar}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl md:text-2xl font-bold">Randevu Takvimi</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Önceki Ay</span>
          </Button>
          <span className="text-sm font-medium">
            {format(currentMonth, "MMMM yyyy", { locale: tr })}
          </span>
          <Button variant="outline" size="icon" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Sonraki Ay</span>
          </Button>
        </div>
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm mb-4">
        <p className="font-medium">Randevu Bilgisi</p>
        <p className="text-muted-foreground">
          Sadece bugünden itibaren 7 gün içerisinde ({format(today, "d MMM", { locale: tr })} -{" "}
          {format(maxDate, "d MMM", { locale: tr })}) randevu alabilirsiniz. Tüm randevular 45 dakika sürer.
        </p>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2">
          {/* Haftanın günleri başlıkları */}
          {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, index) => (
            <div key={day} className="text-center font-medium p-2">
              {day}
            </div>
          ))}

          {/* Önceki aydan boş günler */}
          {Array.from({ length: emptyDaysAtStart }).map((_, index) => (
            <div key={`empty-start-${index}`} className="h-24" />
          ))}

          {/* Takvim günleri */}
          {daysToDisplay.map((day, index) => {
            const dayAppointments = getAppointmentsForDay(day)
            const isActive = isDayActive(day)
            const isSelected = isSameDay(day, selectedDate)
            const isCurrentDay = isToday(day)
            const isInCurrentMonth = isSameMonth(day, currentMonth)
            const dayStatus = getDayStatus(day)
            const isVisible = isDayVisible(day)

            if (!isVisible && !isAuthenticated()) {
              return (
                <div
                  key={index}
                  className="h-24 p-2 border rounded-md bg-gray-50 opacity-50"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">
                      {format(day, "d")}
                    </span>
                  </div>
                </div>
              )
            }

            return (
              <TooltipProvider key={index}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "relative h-24 p-2 border rounded-md cursor-pointer transition-colors overflow-hidden",
                        !isInCurrentMonth && "text-muted-foreground",
                        isSelected && "ring-2 ring-blue-500",
                        isCurrentDay && "bg-blue-50",
                        !isActive && "opacity-50 cursor-not-allowed",
                        getDayStatusClass(day)
                      )}
                      onClick={() => handleDayClick(day)}
                    >
                      <div className="flex justify-between items-start">
                        <span className={cn(
                          "text-sm font-medium",
                          isCurrentDay && "text-blue-600"
                        )}>
                          {format(day, "d")}
                        </span>
                        <div className="flex items-center gap-1">
                          {dayStatus !== "empty" && (
                            <div className={cn(
                              "w-2 h-2 rounded-full",
                              getDayIndicatorClass(day)
                            )} />
                          )}
                          <span className="text-[10px] text-muted-foreground">
                            {dayAppointments.length > 0 && `${dayAppointments.length} randevu`}
                          </span>
                        </div>
                      </div>

                      <div className="mt-1 space-y-1">
                        {dayAppointments.slice(0, 2).map((appointment, idx) => (
                          <div
                            key={idx}
                            className="text-xs p-1.5 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-2 transition-colors"
                          >
                            <span className="text-xs font-medium text-muted-foreground min-w-[36px]">
                              {format(new Date(appointment.date), "HH:mm")}
                            </span>
                            <span className="truncate flex-1">
                              {isAuthenticated()
                                ? appointment.fullname
                                : maskName(appointment.fullname)}
                            </span>
                          </div>
                        ))}
                        {dayAppointments.length > 2 && (
                          <div className="text-[10px] text-muted-foreground bg-white/90 py-0.5 text-center">
                            +{dayAppointments.length - 2} randevu daha
                          </div>
                        )}
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[350px] p-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between border-b pb-2">
                        <div className="font-medium">
                          {format(day, "d MMMM yyyy", { locale: tr })}
                        </div>
                        <div className={cn(
                          "text-xs px-2 py-1 rounded-full",
                          dayStatus === "low" && "bg-green-100 text-green-700",
                          dayStatus === "medium" && "bg-yellow-100 text-yellow-700",
                          dayStatus === "full" && "bg-red-100 text-red-700",
                          dayStatus === "closed" && "bg-gray-100 text-gray-700"
                        )}>
                          {dayAppointments.length} randevu
                        </div>
                      </div>
                      {dayAppointments.length > 0 ? (
                        <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2">
                          {dayAppointments.map((appointment) => (
                            <div 
                              key={appointment.id} 
                              className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                            >
                              <div className="text-sm font-medium min-w-[45px]">
                                {format(new Date(appointment.date), "HH:mm")}
                              </div>
                              <div className="flex-1">
                                <div className="text-sm">
                                  {isAuthenticated()
                                    ? appointment.fullname
                                    : maskName(appointment.fullname)}
                                </div>
                                {isAuthenticated() && (
                                  <div className="text-xs text-muted-foreground">
                                    {appointment.phone}
                                  </div>
                                )}
                              </div>
                              {isAuthenticated() && appointment.user && (
                                <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full whitespace-nowrap">
                                  {appointment.user.name}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-sm text-muted-foreground py-2">
                          Bu gün için randevu bulunmuyor
                        </div>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )
          })}
        </div>
      </Card>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <Info className="h-4 w-4 text-blue-500" />
          <span>
            {isAuthenticated() 
              ? "Tüm randevuları görüntüleyebilirsiniz"
              : `Aktif tarih aralığı: ${format(today, "d MMM", { locale: tr })} - ${format(maxDate, "d MMM", { locale: tr })}`}
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
            <span>Az Dolu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <span>Orta Dolu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <span>Tamamen Dolu</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-400"></div>
            <span>Kapalı</span>
          </div>
        </div>
      </div>
    </div>
  )
} 