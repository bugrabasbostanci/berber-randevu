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
  isMobile: boolean
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
  isMobile,
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
        "flex items-center justify-between p-1 sm:p-3 border rounded-lg",
        appointment ? "bg-gray-50" : "hover:bg-gray-50",
        isSlotClosed && "bg-red-50 border-red-200"
      )}
    >
      <div className="min-w-[30px] sm:min-w-[60px] font-medium text-[10px] sm:text-base">
        {slot.formattedTime}
      </div>
      
      {isSlotClosed ? (
        <div className="flex-1 ml-1 sm:ml-3">
          <div className="text-[10px] sm:text-sm text-red-600 font-medium">
            Kapalı
          </div>
          {!isMobile && (
            <div className="text-[10px] sm:text-xs text-red-500 hidden sm:block">
              {findClosedSlotReason(userId, slot.formattedTime, closedSlots)}
            </div>
          )}
        </div>
      ) : appointment ? (
        <div className="flex-1 ml-1 sm:ml-3">
          <div className="text-[10px] sm:text-base truncate max-w-[60px] sm:max-w-none">
            {maskName(appointment.fullname)}
          </div>
          {isAuthenticated && !isMobile && (
            <div className="text-[9px] sm:text-sm text-muted-foreground truncate hidden sm:block">
              {appointment.phone}
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 ml-1 sm:ml-3 text-[10px] sm:text-sm text-muted-foreground">
          {isMobile ? "" : "Müsait"}
        </div>
      )}

      {isAuthenticated && (
        <div className="flex gap-0 sm:gap-2">
          {isSlotClosed ? (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenSlot(userId, slot.time)}
              title="Zaman Dilimini Aç"
              className="h-6 w-6 sm:h-9 sm:w-9 p-0 sm:p-2"
            >
              <Lock className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
            </Button>
          ) : appointment ? (
            <div className="flex gap-0 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(appointment)}
                title="Randevuyu Düzenle"
                className="h-6 w-6 sm:h-9 sm:w-9 p-0 sm:p-2"
              >
                <Pencil className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(appointment.id)}
                title="Randevuyu Sil"
                className="h-6 w-6 sm:h-9 sm:w-9 p-0 sm:p-2"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-0 sm:gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCreate(userId, slot.time)}
                title="Yeni Randevu Ekle"
                className="h-6 w-6 sm:h-9 sm:w-9 p-0 sm:p-2"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onCloseTimeSlot(userId, slot.time)}
                title="Zaman Dilimini Kapat"
                className="h-6 w-6 sm:h-9 sm:w-9 p-0 sm:p-2"
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