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
  date,
  timeSlots,
  appointments,
  closedSlots,
  isAuthenticated,
  isSunday,
  isBreakpoint,
  maskName,
  onEdit,
  onDelete,
  onCreate,
  onCloseTimeSlot,
  onOpenSlot,
  onCloseDay
}: UserColumnProps) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between sticky top-0 bg-background p-2 border-b">
        <h3 className="text-base sm:text-lg font-semibold">
          {user.name}
        </h3>
        {isAuthenticated && !isSunday && (
          <div className="flex gap-2">
            <Button 
              onClick={() => onCloseDay(user.id)} 
              size={isBreakpoint.sm ? "sm" : "default"}
              variant="destructive"
              className="whitespace-nowrap"
            >
              <CalendarX className="h-4 w-4 sm:mr-2" />
              <span className={cn("transition-opacity", isBreakpoint.sm ? "opacity-0 hidden" : "opacity-100")}>
                Günü Kapat
              </span>
            </Button>
          </div>
        )}
      </div>
      
      <div className="space-y-2 sm:space-y-3">
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