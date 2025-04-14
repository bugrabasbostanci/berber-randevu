import { format } from "date-fns"
import { Pencil, Trash2, Plus, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Appointment, ClosedSlot } from "@/types"
import { findClosedSlotReason } from "../utils/day-view-utils"

interface TimeSlotItemProps {
  userId: number
  slot: {
    time: Date
    formattedTime: string
  }
  appointment: Appointment | undefined
  isSlotClosed: boolean
  closedSlots: ClosedSlot[]
  isAuthenticated: boolean
  maskName: (fullname: string) => string
  onEdit: (appointment: Appointment) => void
  onDelete: (appointmentId: string) => void
  onCreate: (userId: number, time: Date) => void
  onCloseTimeSlot: (userId: number, time: Date) => void
  onOpenSlot: (userId: number, time: Date) => void
}

export const TimeSlotItem = ({
  userId,
  slot,
  appointment,
  isSlotClosed,
  closedSlots,
  isAuthenticated,
  maskName,
  onEdit,
  onDelete,
  onCreate,
  onCloseTimeSlot,
  onOpenSlot
}: TimeSlotItemProps) => {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-2 sm:p-3 border rounded-lg",
        appointment ? "bg-gray-50" : "hover:bg-gray-50",
        isSlotClosed && "bg-red-50 border-red-200"
      )}
    >
      <div className="min-w-[45px] sm:min-w-[60px] font-medium text-sm sm:text-base">
        {slot.formattedTime}
      </div>
      
      {isSlotClosed ? (
        <div className="flex-1 ml-3">
          <div className="text-sm text-red-600 font-medium">
            Kapalı
          </div>
          <div className="text-xs text-red-500 hidden sm:block">
            {findClosedSlotReason(userId, slot.formattedTime, closedSlots)}
          </div>
        </div>
      ) : appointment ? (
        <div className="flex-1 ml-3">
          <div className="text-sm sm:text-base">
            {maskName(appointment.fullname)}
          </div>
          {isAuthenticated && (
            <div className="text-xs sm:text-sm text-muted-foreground">
              {appointment.phone}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 ml-3 text-sm text-muted-foreground">
          Müsait
        </div>
      )}

      {isAuthenticated && (
        <div className="flex gap-1 sm:gap-2">
          {isSlotClosed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenSlot(userId, slot.time)}
              title="Zaman Dilimini Aç"
              className="h-8 w-8 sm:h-9 sm:w-9"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            </Button>
          ) : appointment ? (
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(appointment)}
                title="Randevuyu Düzenle"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(appointment.id)}
                title="Randevuyu Sil"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-1 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCreate(userId, slot.time)}
                title="Yeni Randevu Ekle"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCloseTimeSlot(userId, slot.time)}
                title="Zaman Dilimini Kapat"
                className="h-8 w-8 sm:h-9 sm:w-9"
              >
                <Lock className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 