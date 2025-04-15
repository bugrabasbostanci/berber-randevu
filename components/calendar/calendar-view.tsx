"use client"

import { MonthView } from "./features/month-view"
import { CalendarProvider } from "./shared/context/calendar-context"

export function CalendarView() {
  return (
    <CalendarProvider>
      <MonthView />
    </CalendarProvider>
  )
} 