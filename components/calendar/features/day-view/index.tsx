"use client"

import { getDay, format } from "date-fns"
import { Card } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { Appointment, AllowedUser } from "@/types"
import { useMobile } from "@/components/calendar/shared/hooks/useMobile"
import { generateTimeSlots, maskName as maskNameUtil } from "./utils/day-view-utils"
import { useDayView } from "./hooks/useDayView"
import { DayViewHeader } from "./components/day-view-header"
import { DayViewTitle } from "./components/day-view-title"
import { UserColumn } from "./components/user-column"
import { DayViewDialogs } from "./components/day-view-dialogs"
import { AppointmentForm } from "../appointment-form"

interface DayViewProps {
  date: Date
  appointments: Appointment[]
  users: AllowedUser[]
  onBack: () => void
  onRefresh: () => void
}

export function DayView({ date, appointments, users, onBack, onRefresh }: DayViewProps) {
  const { isAuthenticated } = useAuth()
  const { isMobile, isBreakpoint } = useMobile()
  const isSunday = getDay(date) === 0
  const timeSlots = generateTimeSlots(date)
  
  const {
    closedSlots,
    selectedAppointment,
    isCreating,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedUserId,
    closeDayDialogOpen,
    setCloseDayDialogOpen,
    isAppointmentFormOpen,
    selectedSlotTime,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCreate,
    handleCloseTimeSlot,
    handleCloseDay,
    confirmCloseDay,
    handleOpenSlot,
    handleCloseAppointmentForm
  } = useDayView({ date, onRefresh })

  // İsim gizleme fonksiyonu - wrapper
  const maskName = (fullname: string): string => {
    return maskNameUtil(fullname, isAuthenticated())
  }

  return (
    <div className="space-y-4">
      <DayViewHeader 
        date={date} 
        onBack={onBack} 
        isBreakpoint={isBreakpoint} 
      />

      <Card className="p-2 sm:p-4">
        <DayViewTitle date={date} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {users.map(user => (
            <UserColumn
              key={user.id}
              user={user}
              date={date}
              timeSlots={timeSlots}
              appointments={appointments}
              closedSlots={closedSlots}
              isAuthenticated={isAuthenticated()}
              isSunday={isSunday}
              isBreakpoint={isBreakpoint}
              maskName={maskName}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onCreate={handleCreate}
              onCloseTimeSlot={handleCloseTimeSlot}
              onOpenSlot={handleOpenSlot}
              onCloseDay={handleCloseDay}
            />
          ))}
        </div>
      </Card>

      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={handleCloseAppointmentForm}
        onSuccess={onRefresh}
        appointment={selectedAppointment}
        selectedDate={date}
        userId={selectedUserId || 1}
        isCreating={isCreating}
        selectedTime={selectedAppointment 
          ? format(new Date(selectedAppointment.date), "HH:mm") 
          : selectedSlotTime 
            ? format(selectedSlotTime, "HH:mm") 
            : undefined}
      />

      <DayViewDialogs
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        confirmDelete={confirmDelete}
        closeDayDialogOpen={closeDayDialogOpen}
        setCloseDayDialogOpen={setCloseDayDialogOpen}
        confirmCloseDay={confirmCloseDay}
      />
    </div>
  )
} 