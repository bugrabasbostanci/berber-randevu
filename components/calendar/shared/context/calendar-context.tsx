"use client"

import { createContext, useContext, ReactNode, useState, } from "react"
import { getCurrentDate } from "@/lib/data"
import { addDays, startOfDay, endOfDay } from "date-fns"

type ViewMode = "month" | "day"

interface CalendarContextType {
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  today: Date
  maxDate: Date
  refreshTrigger: number
  refreshCalendar: () => void
}

const CalendarContext = createContext<CalendarContextType | undefined>(undefined)

export function CalendarProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>("month")
  const [selectedDate, setSelectedDate] = useState<Date>(getCurrentDate())
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  // Bugünden itibaren 7 günlük aralık
  const today = startOfDay(getCurrentDate())
  const maxDate = endOfDay(addDays(today, 6)) // Bugün + 6 gün = 7 günlük aralık

  const refreshCalendar = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <CalendarContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedDate,
        setSelectedDate,
        today,
        maxDate,
        refreshTrigger,
        refreshCalendar
      }}
    >
      {children}
    </CalendarContext.Provider>
  )
}

export function useCalendarContext() {
  const context = useContext(CalendarContext)
  if (context === undefined) {
    throw new Error("useCalendarContext must be used within a CalendarProvider")
  }
  return context
} 