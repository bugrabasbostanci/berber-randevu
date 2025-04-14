import { isSameDay, isSameMonth } from "date-fns"
import { Card } from "@/components/ui/card"
import { Appointment } from "@/types"
import { CalendarDay } from "./calendar-day"
import { DayStatus } from "./calendar-day"

interface MonthGridProps {
  daysToDisplay: Date[]
  emptyDaysAtStart: number
  currentMonth: Date
  selectedDate: Date
  appointments: Appointment[]
  isAuthenticated: boolean
  today: Date
  maxDate: Date
  onDayClick: (day: Date) => void
  getDayStatus: (day: Date) => DayStatus
  getDayStatusClass: (day: Date) => string
  getDayIndicatorClass: (day: Date) => string
  isDayActive: (day: Date) => boolean
  isDayVisible: (day: Date) => boolean
  getAppointmentsForDay: (day: Date) => Appointment[]
  maskName: (fullname: string) => string
}

export const MonthGrid = ({
  daysToDisplay,
  emptyDaysAtStart,
  currentMonth,
  selectedDate,
  appointments,
  isAuthenticated,
  today,
  maxDate,
  onDayClick,
  getDayStatus,
  getDayStatusClass,
  getDayIndicatorClass,
  isDayActive,
  isDayVisible,
  getAppointmentsForDay,
  maskName,
}: MonthGridProps) => {
  return (
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
          const isInCurrentMonth = isSameMonth(day, currentMonth)
          const isVisible = isDayVisible(day)
          const dayStatus = getDayStatus(day)

          return (
            <CalendarDay
              key={index}
              day={day}
              appointments={dayAppointments}
              isActive={isActive}
              isSelected={isSelected}
              isInCurrentMonth={isInCurrentMonth}
              isVisible={isVisible}
              dayStatus={dayStatus}
              isAuthenticated={isAuthenticated}
              onDayClick={onDayClick}
              getDayStatusClass={getDayStatusClass}
              getDayIndicatorClass={getDayIndicatorClass}
              maskName={maskName}
            />
          )
        })}
      </div>
    </Card>
  )
} 