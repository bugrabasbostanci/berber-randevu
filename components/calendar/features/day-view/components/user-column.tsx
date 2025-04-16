import { CalendarX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AllowedUser, Appointment, ClosedSlot } from "@/types"
import { TimeSlotItem } from "./time-slot-item"
import { isSlotClosed, findAppointmentForSlot } from "../utils/day-view-utils"

interface UserColumnProps {
  user: AllowedUser
  date: Date
  timeSlots: Array<{
    time: Date
    formattedTime: string
  }>
  appointments: Appointment[]
  closedSlots: ClosedSlot[]
  isAuthenticated: boolean
  isSunday: boolean
  isMobile: boolean
  isBreakpoint: { sm: boolean }
  maskName: (fullname: string) => string
  onEdit: (appointment: Appointment) => void
  onDelete: (appointmentId: string) => void
  onCreate: (userId: number, time: Date) => void
  onCloseTimeSlot: (userId: number, time: Date) => void
  onOpenSlot: (userId: number, time: Date) => void
  onCloseDay: (userId: number) => void
}

export const UserColumn = ({
  user,
  timeSlots,
  appointments,
  closedSlots,
  isAuthenticated,
  isSunday,
  isMobile,
  maskName,
  onEdit,
  onDelete,
  onCreate,
  onCloseTimeSlot,
  onOpenSlot,
  onCloseDay
}: UserColumnProps) => {
  return (
    <div className="space-y-1 sm:space-y-3">
      <div className="flex items-center justify-between sticky top-0 bg-background p-1 sm:p-2 border-b z-10">
        <h3 className="text-[11px] sm:text-lg font-semibold truncate">
          {user.name}
        </h3>
        {isAuthenticated && !isSunday && !isMobile && (
          <div className="flex gap-1 sm:gap-2">
            <Button 
              onClick={() => onCloseDay(user.id)} 
              size="sm"
              variant="destructive"
              className="whitespace-nowrap h-8 text-xs sm:text-sm"
            >
              <CalendarX className="h-3.5 w-3.5 sm:h-4 sm:w-4 sm:mr-2" />
              <span className={cn("transition-opacity", isMobile ? "opacity-0 hidden" : "opacity-100")}>
                Günü Kapat
              </span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-1 sm:space-y-3">
        {timeSlots.map(slot => {
          const appointment = findAppointmentForSlot(
            user.id, 
            slot.formattedTime, 
            appointments
          )

          const slotClosed = isSlotClosed(
            user.id, 
            slot.formattedTime, 
            closedSlots
          )

          return (
            <TimeSlotItem
              key={`${user.id}-${slot.formattedTime}`}
              userId={user.id}
              slot={slot}
              appointment={appointment}
              isSlotClosed={slotClosed}
              closedSlots={closedSlots}
              isAuthenticated={isAuthenticated}
              isMobile={isMobile}
              maskName={maskName}
              onEdit={onEdit}
              onDelete={onDelete}
              onCreate={onCreate}
              onCloseTimeSlot={onCloseTimeSlot}
              onOpenSlot={onOpenSlot}
            />
          )
        })}
      </div>
    </div>
  )
} 