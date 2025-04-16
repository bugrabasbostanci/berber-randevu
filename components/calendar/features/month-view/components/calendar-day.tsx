import { format, isToday} from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Appointment } from "@/types"
import { formatTime, formatLongDate } from "@/components/calendar/shared/utils/date-utils"

export type DayStatus = "empty" | "low" | "medium" | "full" | "closed"

interface CalendarDayProps {
  day: Date
  appointments: Appointment[]
  isActive: boolean
  isSelected: boolean
  isInCurrentMonth: boolean
  isVisible: boolean
  dayStatus: DayStatus
  isAuthenticated: boolean
  isMobile: boolean
  onDayClick: (day: Date) => void
  getDayStatusClass: (day: Date) => string
  getDayIndicatorClass: (day: Date) => string
  maskName: (fullname: string) => string
}

export const CalendarDay = ({
  day,
  appointments,
  isActive,
  isInCurrentMonth,
  isVisible,
  dayStatus,
  isAuthenticated,
  isMobile,
  getDayIndicatorClass,
  maskName,
}: CalendarDayProps) => {
  if (!isVisible && !isAuthenticated) {
    return (
      <div className="h-16 sm:h-24 p-1 sm:p-2 bg-gray-50 text-gray-400 border-b border-r border-gray-100">
        <div className="flex justify-between items-start">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground">
            {format(day, "d")}
          </span>
        </div>
      </div>
    )
  }

  const isCurrentDay = isToday(day)
  const maxAppointmentsToShow = isMobile ? 1 : 2

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              "h-16 sm:h-24 p-1 sm:p-2 w-full border-b border-r border-gray-100",
              !isInCurrentMonth && "text-muted-foreground bg-gray-50",
              isCurrentDay && "bg-blue-50",
              !isActive && "bg-gray-50 text-gray-400"
            )}
          >
            <div className="flex justify-between items-start">
              <span className={cn(
                "text-xs sm:text-sm font-medium",
                isCurrentDay && "text-blue-600"
              )}>
                {format(day, "d")}
              </span>
              <div className="flex items-center gap-0.5 sm:gap-1">
                {dayStatus === "low" && appointments.length > 0 && (
                  <div className={cn(
                    "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                    getDayIndicatorClass(day)
                  )} />
                )}
                {!isMobile && appointments.length > 0 && (
                  <span className="text-[8px] sm:text-[10px] text-muted-foreground">
                    {appointments.length} randevu
                  </span>
                )}
              </div>
            </div>

            <div className="mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1">
              {appointments.slice(0, maxAppointmentsToShow).map((appointment, idx) => (
                <div
                  key={idx}
                  className="text-[8px] sm:text-xs p-0.5 sm:p-1.5 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-1 sm:gap-2 transition-colors"
                >
                  <span className="text-[8px] sm:text-xs font-medium text-muted-foreground min-w-[28px] sm:min-w-[36px]">
                    {formatTime(new Date(appointment.date))}
                  </span>
                  <span className="truncate flex-1">
                    {isAuthenticated
                      ? appointment.fullname
                      : maskName(appointment.fullname)}
                  </span>
                </div>
              ))}
              {appointments.length > maxAppointmentsToShow && (
                <div className="text-[8px] sm:text-[10px] text-muted-foreground bg-white/90 py-0.5 text-center">
                  +{appointments.length - maxAppointmentsToShow} randevu daha
                </div>
              )}
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContent side={isMobile ? "bottom" : "right"} className="max-w-[90vw] sm:max-w-[350px] p-2 sm:p-3">
          <div className="space-y-1 sm:space-y-2">
            <div className="flex items-center justify-between border-b pb-1 sm:pb-2">
              <div className="text-sm sm:font-medium">
                {formatLongDate(day)}
              </div>
              <div className={cn(
                "text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full",
                dayStatus === "low" && "bg-green-100 text-green-700",
                dayStatus === "medium" && "bg-yellow-100 text-yellow-700",
                dayStatus === "full" && "bg-red-100 text-red-700",
                dayStatus === "closed" && "bg-gray-100 text-gray-700"
              )}>
                {appointments.length} randevu
              </div>
            </div>
            {appointments.length > 0 ? (
              <div className="space-y-1 sm:space-y-1.5 max-h-[150px] sm:max-h-[200px] overflow-y-auto pr-1 sm:pr-2">
                {appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="text-xs sm:text-sm font-medium min-w-[40px] sm:min-w-[45px]">
                      {formatTime(new Date(appointment.date))}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs sm:text-sm">
                        {isAuthenticated
                          ? appointment.fullname
                          : maskName(appointment.fullname)}
                      </div>
                      {isAuthenticated && (
                        <div className="text-[10px] sm:text-xs text-muted-foreground">
                          {appointment.phone}
                        </div>
                      )}
                    </div>
                    {isAuthenticated && appointment.user && (
                      <div className="text-[8px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-50 text-blue-700 rounded-full whitespace-nowrap">
                        {appointment.user.name}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs sm:text-sm text-muted-foreground py-1 sm:py-2">
                Bu gün için randevu bulunmuyor
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 