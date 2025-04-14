import { format, isSameDay, isToday, isSameMonth } from "date-fns"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Appointment } from "@/types"
import { tr } from "date-fns/locale"

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
  onDayClick: (day: Date) => void
  getDayStatusClass: (day: Date) => string
  getDayIndicatorClass: (day: Date) => string
  maskName: (fullname: string) => string
}

export const CalendarDay = ({
  day,
  appointments,
  isActive,
  isSelected,
  isInCurrentMonth,
  isVisible,
  dayStatus,
  isAuthenticated,
  onDayClick,
  getDayStatusClass,
  getDayIndicatorClass,
  maskName,
}: CalendarDayProps) => {
  if (!isVisible && !isAuthenticated) {
    return (
      <div className="h-24 p-2 border rounded-md bg-gray-50 opacity-50">
        <div className="flex justify-between items-start">
          <span className="text-sm font-medium text-muted-foreground">
            {format(day, "d")}
          </span>
        </div>
      </div>
    )
  }

  const isCurrentDay = isToday(day)

  return (
    <TooltipProvider>
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
            onClick={() => onDayClick(day)}
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
                  {appointments.length > 0 && `${appointments.length} randevu`}
                </span>
              </div>
            </div>

            <div className="mt-1 space-y-1">
              {appointments.slice(0, 2).map((appointment, idx) => (
                <div
                  key={idx}
                  className="text-xs p-1.5 rounded bg-gray-100 hover:bg-gray-200 flex items-center gap-2 transition-colors"
                >
                  <span className="text-xs font-medium text-muted-foreground min-w-[36px]">
                    {format(new Date(appointment.date), "HH:mm")}
                  </span>
                  <span className="truncate flex-1">
                    {isAuthenticated
                      ? appointment.fullname
                      : maskName(appointment.fullname)}
                  </span>
                </div>
              ))}
              {appointments.length > 2 && (
                <div className="text-[10px] text-muted-foreground bg-white/90 py-0.5 text-center">
                  +{appointments.length - 2} randevu daha
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
                {appointments.length} randevu
              </div>
            </div>
            {appointments.length > 0 ? (
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-2">
                {appointments.map((appointment) => (
                  <div 
                    key={appointment.id} 
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    <div className="text-sm font-medium min-w-[45px]">
                      {format(new Date(appointment.date), "HH:mm")}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm">
                        {isAuthenticated
                          ? appointment.fullname
                          : maskName(appointment.fullname)}
                      </div>
                      {isAuthenticated && (
                        <div className="text-xs text-muted-foreground">
                          {appointment.phone}
                        </div>
                      )}
                    </div>
                    {isAuthenticated && appointment.user && (
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
} 