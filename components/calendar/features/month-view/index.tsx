"use client"

import { useAuth } from "@/lib/auth-context"
import { Appointment } from "@/types"
import { CalendarHeader } from "./components/calendar-header"
import { CalendarInfoNotice } from "./components/calendar-info-notice"
import { CalendarLegend } from "./components/calendar-legend"
import { MonthGrid } from "./components/month-grid"
import { useCalendar } from "./hooks/useCalendar"
import { DayView } from "../day-view"
import { useCalendarContext } from "@/components/calendar/shared/context/calendar-context"
import {
  getDaysToDisplay,
  getEmptyDaysAtStart,
  getAppointmentsForDay as getAppointmentsForDayUtil,
  getDayStatus as getDayStatusUtil,
  getDayStatusClass as getDayStatusClassUtil,
  getDayIndicatorClass as getDayIndicatorClassUtil,
  isDayActive as isDayActiveUtil,
  isDayVisible as isDayVisibleUtil,
  maskName as maskNameUtil
} from "./utils/calendar-utils"

export function MonthView() {
  const { isAuthenticated } = useAuth()
  const { viewMode, refreshCalendar } = useCalendarContext()
  
  const {
    currentMonth,
    selectedDate,
    appointments,
    users,
    loading,
    today,
    maxDate,
    goToPreviousMonth,
    goToNextMonth,
    handleDayClick,
    backToMonthView,
    goToDate
  } = useCalendar(isAuthenticated())

  // İsim gizleme fonksiyonu - wrapper
  const maskName = (fullname: string): string => {
    return maskNameUtil(fullname, isAuthenticated())
  }

  // Gün durumu fonksiyonları - wrapper
  const getDayStatus = (day: Date) => {
    return getDayStatusUtil(day, appointments)
  }

  const getDayStatusClass = (day: Date) => {
    return getDayStatusClassUtil(day, appointments)
  }

  const getDayIndicatorClass = (day: Date) => {
    return getDayIndicatorClassUtil(day, appointments)
  }

  // Gün aktifliği fonksiyonları - wrapper
  const isDayActive = (day: Date) => {
    return isDayActiveUtil(day, isAuthenticated())
  }

  const isDayVisible = (day: Date) => {
    return isDayVisibleUtil(day, isAuthenticated(), today, maxDate)
  }

  // Gün randevuları fonksiyonu - wrapper
  const getAppointmentsForDayWrapper = (day: Date) => {
    return getAppointmentsForDayUtil(appointments, day, isAuthenticated(), today, maxDate)
  }

  if (loading) {
    return <div className="flex justify-center py-8">Yükleniyor...</div>
  }

  if (viewMode === "day") {
    return (
      <DayView
        date={selectedDate}
        appointments={getAppointmentsForDayWrapper(selectedDate)}
        users={users}
        onBack={backToMonthView}
        onRefresh={refreshCalendar}
      />
    )
  }

  // Takvim için gerekli verileri hesapla
  const daysToDisplay = getDaysToDisplay(currentMonth)
  const emptyDaysAtStart = getEmptyDaysAtStart(currentMonth)

  return (
    <div className="space-y-4">
      <CalendarHeader
        currentMonth={currentMonth}
        onPreviousMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
      />

      <CalendarInfoNotice
        startDate={today}
        endDate={maxDate}
      />

      <MonthGrid
        daysToDisplay={daysToDisplay}
        emptyDaysAtStart={emptyDaysAtStart}
        currentMonth={currentMonth}
        selectedDate={selectedDate}
        appointments={appointments}
        isAuthenticated={isAuthenticated()}
        today={today}
        maxDate={maxDate}
        onDayClick={handleDayClick}
        getDayStatus={getDayStatus}
        getDayStatusClass={getDayStatusClass}
        getDayIndicatorClass={getDayIndicatorClass}
        isDayActive={isDayActive}
        isDayVisible={isDayVisible}
        getAppointmentsForDay={getAppointmentsForDayWrapper}
        maskName={maskName}
      />

      <CalendarLegend
        isAuthenticated={isAuthenticated()}
        today={today}
        maxDate={maxDate}
      />
    </div>
  )
}