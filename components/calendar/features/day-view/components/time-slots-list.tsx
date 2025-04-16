import { Appointment, ClosedSlot } from "@/types"
import { TimeSlotItem } from "./time-slot-item"
import { findAppointmentForSlot, isSlotClosed, maskName } from "../utils/day-view-utils"

interface TimeSlotsListProps {
  userId: number
  slots: {
    time: Date
    formattedTime: string
  }[]
  appointments: Appointment[]
  closedSlots: ClosedSlot[]
  isAuthenticated: boolean
  isMobile: boolean
  onEdit: (appointment: Appointment) => void
  onDelete: (appointmentId: string) => void
  onCreate: (userId: number, time: Date) => void
  onCloseTimeSlot: (userId: number, time: Date) => void
  onOpenSlot: (userId: number, time: Date) => void
}

export const TimeSlotsList = ({
  userId,
  slots,
  appointments,
  closedSlots,
  isAuthenticated,
  isMobile,
  onEdit,
  onDelete,
  onCreate,
  onCloseTimeSlot,
  onOpenSlot
}: TimeSlotsListProps) => {
  return (
    <div className="space-y-2 sm:space-y-3">
      {slots.map((slot) => {
        const appointment = findAppointmentForSlot(userId, slot.formattedTime, appointments)
        const slotClosed = isSlotClosed(userId, slot.formattedTime, closedSlots)
        
        return (
          <TimeSlotItem
            key={slot.formattedTime}
            userId={userId}
            slot={slot}
            appointment={appointment}
            isSlotClosed={slotClosed}
            closedSlots={closedSlots}
            isAuthenticated={isAuthenticated}
            isMobile={isMobile}
            maskName={(fullname: string) => maskName(fullname, isAuthenticated)}
            onEdit={onEdit}
            onDelete={onDelete}
            onCreate={onCreate}
            onCloseTimeSlot={onCloseTimeSlot}
            onOpenSlot={onOpenSlot}
          />
        )
      })}
    </div>
  )
} 