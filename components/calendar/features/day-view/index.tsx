"use client"

import { useState } from "react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { useAuth } from "@/lib/auth-context"
import { Appointment, AllowedUser } from "@/types"
import { generateTimeSlots, maskName as maskNameUtil } from "./utils/day-view-utils"
import { useDayView } from "./hooks/useDayView"
import { DayViewDialogs } from "./components/day-view-dialogs"
import { AppointmentForm } from "../appointment-form"
import { Button } from "@/components/ui/button"
import { ChevronLeft, User, Phone, Clock, Calendar, Pencil, Trash2, Lock, Plus } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { SkeletonLoader } from "../../shared/skeleton-loader"
import {  formatTimeFromDate } from "@/lib/utils"
import { 
  getTimeString, 
  findAppointment, 
  isTimeSlotClosed, 
  getClosedSlotReason,
  isDayClosed as isAllDayClosed
} from "./utils/slot-helpers";

interface DayViewProps {
  date: Date
  appointments: Appointment[]
  users: AllowedUser[]
  onBack: () => void
  onRefresh: () => void
  isLoading?: boolean
}

export function DayView({ 
  date, 
  appointments, 
  users, 
  onBack, 
  onRefresh,
  isLoading = false
}: DayViewProps) {
  const { isAuthenticated } = useAuth()
  const timeSlots = generateTimeSlots(date)
  const [selectedSlotInfo, setSelectedSlotInfo] = useState<{
    isOpen: boolean,
    appointment?: Appointment,
    isSlotClosed: boolean,
    userId: number,
    slotTime: Date,
    formattedTime: string
  }>({
    isOpen: false,
    appointment: undefined,
    isSlotClosed: false,
    userId: 0,
    slotTime: new Date(),
    formattedTime: ''
  })
  
  const {
    closedSlots,
    selectedAppointment,
    isCreating,
    deleteDialogOpen,
    setDeleteDialogOpen,
    selectedUserId,
    closeDayDialogOpen,
    setCloseDayDialogOpen,
    closeDayReason,
    setCloseDayReason,
    closeSlotDialogOpen,
    setCloseSlotDialogOpen,
    closeSlotReason,
    setCloseSlotReason,
    isAppointmentFormOpen,
    selectedSlotTime,
    handleEdit,
    handleDelete,
    confirmDelete,
    handleCreate,
    handleCloseTimeSlot,
    confirmCloseTimeSlot,
    handleCloseDay,
    confirmCloseDay,
    handleOpenSlot,
    handleOpenDay,
    handleCloseAppointmentForm
  } = useDayView({ date, onRefresh })

  // İsim gizleme fonksiyonu - wrapper
  const maskName = (fullname: string): string => {
    return maskNameUtil(fullname, isAuthenticated())
  }

  // Kullanıcı için günün tamamen kapalı olup olmadığını kontrol eder
  const isUserDayClosed = (userId: number): boolean => {
    const workingHours = timeSlots.map(slot => slot.formattedTime);
    return isAllDayClosed(userId, workingHours, closedSlots);
  }

  // Zaman dilimi durumuna göre sınıf belirleme
  const getStatusClass = (userId: number, formattedTime: string) => {
    // Randevu kontrolü
    const appointment = findAppointment(userId, formattedTime, appointments);
    
    // Kapalı slot kontrolü
    const slotClosed = isTimeSlotClosed(userId, formattedTime, closedSlots);

    if (slotClosed) {
      return "bg-red-100 text-red-700 border-red-200 hover:bg-red-200 md:hover:bg-red-200";
    } else if (appointment) {
      return "bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 md:hover:bg-blue-200";
    } else {
      return "bg-green-100 text-green-700 border-green-200 hover:bg-green-200 md:hover:bg-green-200";
    }
  }

  
  // Telefon numarasını formatlama (5XX XXX XX XX)
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';
    
    // Sadece rakamları al
    const numbersOnly = phone.replace(/\D/g, '');
    
    // Son 10 haneyi formatla (5XX XXX XX XX)
    if (numbersOnly.length >= 10) {
      const last10 = numbersOnly.slice(-10);
      return `${last10.slice(0, 3)} ${last10.slice(3, 6)} ${last10.slice(6, 8)} ${last10.slice(8, 10)}`;
    }
    
    return numbersOnly;
  };

  // Modal açma fonksiyonu
  const openSlotModal = (userId: number, slotTime: Date, formattedTime: string) => {
    // Randevu bulma
    const appointment = findAppointment(userId, formattedTime, appointments);
    
    // Kapalı slot kontrolü
    const isSlotClosed = isTimeSlotClosed(userId, formattedTime, closedSlots);
    
    setSelectedSlotInfo({
      isOpen: true,
      appointment,
      isSlotClosed,
      userId,
      slotTime,
      formattedTime
    });
  }

  // Modal kapatma fonksiyonu
  const closeSlotModal = () => {
    setSelectedSlotInfo(prev => ({...prev, isOpen: false}))
  }

  if (isLoading) {
    return (
      <div className="flex flex-col bg-gray-50 min-h-screen">
        <div className="bg-white border-b border-gray-200 rounded-md shadow-sm max-w-3xl md:max-w-4xl mx-auto w-full">
          <div className="flex items-center justify-between p-2 md:p-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center justify-center rounded-md h-8 w-8 hover:bg-gray-100 active:bg-gray-200 border border-gray-300" 
              onClick={onBack}
              aria-label="Takvime Dön"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="sr-only">Takvime Dön</span>
            </Button>
            
            <div className="flex flex-col items-center">
              <h2 className="text-base md:text-lg font-semibold text-gray-800">
                {format(date, "d MMMM", { locale: tr })}
              </h2>
              <p className="text-xs text-gray-500">
                {format(date, "EEEE", { locale: tr })}
              </p>
            </div>
            
            <div className="w-8"></div>
          </div>
        </div>

        <main className="flex-1 px-2 pb-4 pt-2 md:px-4 md:pb-8 md:pt-4 max-w-3xl md:max-w-4xl mx-auto w-full">
          <SkeletonLoader type="day" count={10} />
        </main>
      </div>
    )
  }

  return (
    <div className="flex flex-col bg-gray-50 min-h-screen">
      {/* Üst Bar - Yeni Tasarım */}
      <div className="bg-white border-b border-gray-200 rounded-md shadow-sm max-w-3xl md:max-w-4xl mx-auto w-full">
        <div className="flex items-center justify-between p-2 md:p-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center justify-center rounded-md h-8 w-8 hover:bg-gray-100 active:bg-gray-200 border border-gray-300" 
            onClick={onBack}
            aria-label="Takvime Dön"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="sr-only">Takvime Dön</span>
          </Button>
          
          <div className="flex flex-col items-center">
            <h2 className="text-base md:text-lg font-semibold text-gray-800">
              {format(date, "d MMMM", { locale: tr })}
            </h2>
            <p className="text-xs text-gray-500">
              {format(date, "EEEE", { locale: tr })}
            </p>
          </div>
          
          <div className="w-8"></div> {/* Denge için boş alan */}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-2 pb-4 pt-2 md:px-4 md:pb-8 md:pt-4 max-w-3xl md:max-w-4xl mx-auto w-full">
        {/* Time Slots Container */}
        <div className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm">
          {/* Column Headers */}
          <div className="grid grid-cols-2 md:grid-cols-2 border-b border-gray-200 bg-gray-50 rounded-t-md">
            {users.map(user => (
              <div key={user.id} className="flex flex-col items-center py-3 md:py-4">
                <div className="flex items-center justify-center font-medium text-gray-800 md:text-base mb-1">
                  <User className="w-4 h-4 md:w-5 md:h-5 mr-1.5 text-gray-600" />
                  <span>{user.name}</span>
                  {isUserDayClosed(user.id) && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded-full">Kapalı</span>
                  )}
                </div>
                {isAuthenticated() && (
                  <div className="flex gap-1">
                    {!isUserDayClosed(user.id) ? (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 text-xs h-7 px-2.5 rounded-md"
                        onClick={() => handleCloseDay(user.id)}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        <span>Kapat</span>
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-green-600 border-green-300 hover:bg-green-50 hover:text-green-700 text-xs h-7 px-2.5 rounded-md"
                        onClick={() => handleOpenDay(user.id)}
                      >
                        <Lock className="w-3 h-3 mr-1" />
                        <span>Aç</span>
                      </Button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Time Slots */}
          <div className="divide-y divide-gray-100">
            {timeSlots.map((slot, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-2 py-1 md:py-2">
                {users.map(user => {
                  const appointment = findAppointment(user.id, slot.formattedTime, appointments);
                  const isSlotClosed = isTimeSlotClosed(user.id, slot.formattedTime, closedSlots);
                  
                  const handleClick = () => {
                    openSlotModal(user.id, slot.time, slot.formattedTime)
                  }

                  return (
                    <div key={user.id} className="flex px-1 md:px-2">
                      <div
                        className={cn(
                          "flex-1 py-2 px-2 md:py-3 md:px-4 rounded-md border text-sm md:text-base font-medium cursor-pointer shadow-sm transition-all active:scale-95 active:translate-y-px",
                          getStatusClass(user.id, slot.formattedTime),
                          isAuthenticated() ? "" : "opacity-80"
                        )}
                        onClick={handleClick}
                      >
                        {/* Mobil Öncelikli Tasarım: Yeniden Düzenlenmiş İçerik */}
                        <div className="flex items-start">
                          {/* Saat Gösterimi - Sol Taraf */}
                          <div className="flex-shrink-0 bg-white bg-opacity-50 rounded-md p-1 md:p-2 text-center mr-1.5 md:mr-3">
                            <span className="text-gray-800 font-semibold text-sm md:text-lg leading-none block">
                              {format(slot.time, "HH:mm")}
                            </span>
                          </div>
                          
                          {/* İçerik Kısmı - Orta */}
                          <div className="flex-1 min-w-0">
                            {isSlotClosed ? (
                              <div>
                                <div className="flex items-center">
                                  <Lock className="w-3 h-3 mr-1 text-red-700 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-medium text-red-700 truncate">
                                    Kapalı
                                  </span>
                                </div>
                                {/* Kapatma nedeni gösterimi */}
                                {getClosedSlotReason(user.id, slot.formattedTime, closedSlots) && (
                                  <div className="mt-1">
                                    <span className="text-[10px] md:text-xs text-red-600 italic line-clamp-2">
                                      {getClosedSlotReason(user.id, slot.formattedTime, closedSlots)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : appointment ? (
                              <div>
                                <div className="flex items-center">
                                  <User className="w-3 h-3 mr-1 text-blue-700 flex-shrink-0" />
                                  <span className="text-xs md:text-sm font-semibold truncate">
                                    {isAuthenticated() ? appointment.fullname : maskName(appointment.fullname)}
                                  </span>
                                </div>
                                {isAuthenticated() && (
                                  <div className="flex items-center mt-1">
                                    <Phone className="w-2.5 h-2.5 mr-1 text-blue-700 flex-shrink-0" />
                                    <span className="text-xs truncate">
                                      {formatPhoneNumber(appointment.phone)}
                                    </span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex items-center h-full">
                                <span className="text-xs md:text-sm font-medium text-green-700">
                                  Müsait
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Dialogs */}
      <DayViewDialogs
        deleteDialogOpen={deleteDialogOpen}
        setDeleteDialogOpen={setDeleteDialogOpen}
        confirmDelete={confirmDelete}
        closeDayDialogOpen={closeDayDialogOpen}
        setCloseDayDialogOpen={setCloseDayDialogOpen}
        confirmCloseDay={confirmCloseDay}
        closeDayReason={closeDayReason}
        setCloseDayReason={setCloseDayReason}
        closeSlotDialogOpen={closeSlotDialogOpen}
        setCloseSlotDialogOpen={setCloseSlotDialogOpen}
        closeSlotReason={closeSlotReason}
        setCloseSlotReason={setCloseSlotReason}
        confirmCloseTimeSlot={confirmCloseTimeSlot}
      />

      {/* Appointment Form */}
      <AppointmentForm
        isOpen={isAppointmentFormOpen}
        onClose={handleCloseAppointmentForm}
        onSuccess={onRefresh}
        appointment={selectedAppointment}
        selectedDate={date}
        userId={selectedUserId || 0}
        isCreating={isCreating}
        selectedTime={selectedSlotTime ? format(selectedSlotTime, "HH:mm") : undefined}
      />

      {/* Randevu Slot Modalı */}
      <Dialog open={selectedSlotInfo.isOpen} onOpenChange={isOpen => {
        if (!isOpen) closeSlotModal();
      }}>
        <DialogContent className="w-[calc(100%-24px)] max-w-md mx-auto p-4 rounded-md sm:p-6">
          <DialogHeader className="pb-2 space-y-1">
            <DialogTitle className="text-center text-base sm:text-lg">
              {format(selectedSlotInfo.slotTime, "d MMMM", { locale: tr })} - {selectedSlotInfo.formattedTime}
            </DialogTitle>
            {selectedSlotInfo.appointment && (
              <DialogDescription className="text-center text-xs sm:text-sm pt-1">
                {isAuthenticated() ? selectedSlotInfo.appointment.fullname : maskName(selectedSlotInfo.appointment.fullname)}
              </DialogDescription>
            )}
          </DialogHeader>
          
          <div className="my-2">
            {selectedSlotInfo.isSlotClosed ? (
              <div className="bg-red-50 p-3 sm:p-4 rounded-md border border-red-200 mb-3">
                <div className="flex items-center mb-2">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-red-600" />
                  <h3 className="text-sm sm:text-base font-medium text-red-700">Bu zaman dilimi kapalı</h3>
                </div>
                
                {isAuthenticated() && (
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white rounded-md h-9 sm:h-11 text-sm"
                    onClick={() => {
                      handleOpenSlot(selectedSlotInfo.userId, selectedSlotInfo.slotTime);
                      closeSlotModal();
                    }}
                  >
                    <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                    Zaman Dilimini Aç
                  </Button>
                )}
              </div>
            ) : selectedSlotInfo.appointment ? (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 sm:p-4 rounded-md border border-blue-200">
                  <h3 className="text-sm sm:text-base font-medium text-blue-800 mb-2 border-b border-blue-200 pb-1 sm:pb-2">Randevu Bilgileri</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-700 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-900">İsim</p>
                        <p className="text-sm sm:text-base">
                          {isAuthenticated() ? selectedSlotInfo.appointment.fullname : maskName(selectedSlotInfo.appointment.fullname)}
                        </p>
                      </div>
                    </div>
                    
                    {isAuthenticated() && (
                      <div className="flex items-start">
                        <Phone className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-700 mt-0.5" />
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-blue-900">Telefon</p>
                          <p className="text-sm sm:text-base">
                            {formatPhoneNumber(selectedSlotInfo.appointment.phone)}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-start">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-700 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-900">Tarih</p>
                        <p className="text-sm sm:text-base">
                          {format(selectedSlotInfo.slotTime, "d MMMM, EEEE", { locale: tr })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3 text-blue-700 mt-0.5" />
                      <div>
                        <p className="text-xs sm:text-sm font-medium text-blue-900">Saat</p>
                        <p className="text-sm sm:text-base">
                          {selectedSlotInfo.formattedTime}
                        </p>
                      </div>
                    </div>
                    
                    {isAuthenticated() && selectedSlotInfo.appointment && selectedSlotInfo.appointment.createdAt && (
                      <div className="pt-1 sm:pt-2 text-[10px] sm:text-xs text-gray-500 border-t border-blue-100">
                        <p>Oluşturulma: {format(new Date(selectedSlotInfo.appointment.createdAt), "dd.MM.yyyy HH:mm")}</p>
                        {selectedSlotInfo.appointment.updatedAt && selectedSlotInfo.appointment.createdAt !== selectedSlotInfo.appointment.updatedAt && (
                          <p>Güncelleme: {format(new Date(selectedSlotInfo.appointment.updatedAt), "dd.MM.yyyy HH:mm")}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                
                {isAuthenticated() && (
                  <div className="flex flex-col gap-2">
                    <Button
                      className="bg-blue-600 hover:bg-blue-700 text-white w-full rounded-md h-9 sm:h-11 text-sm"
                      onClick={() => {
                        if (selectedSlotInfo.appointment) {
                          handleEdit(selectedSlotInfo.appointment);
                        }
                        closeSlotModal();
                      }}
                    >
                      <Pencil className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Randevuyu Düzenle
                    </Button>
                    <Button
                      variant="destructive"
                      className="w-full rounded-md h-9 sm:h-11 text-sm"
                      onClick={() => {
                        if (selectedSlotInfo.appointment) {
                          handleDelete(selectedSlotInfo.appointment.id);
                        }
                        closeSlotModal();
                      }}
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Randevuyu Sil
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-green-50 p-3 sm:p-4 rounded-md border border-green-200 mb-3">
                <div className="flex items-center mb-2">
                  <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full mr-2"></div>
                  <h3 className="text-sm sm:text-base font-medium text-green-700">Bu zaman dilimi müsait</h3>
                </div>
                
                {isAuthenticated() && (
                  <div className="flex flex-col gap-2 pt-1 sm:pt-2">
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white w-full rounded-md h-9 sm:h-11 text-sm"
                      onClick={() => {
                        handleCreate(selectedSlotInfo.userId, selectedSlotInfo.slotTime);
                        closeSlotModal();
                      }}
                    >
                      <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Yeni Randevu Oluştur
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full border-red-300 text-red-700 hover:bg-red-50 hover:text-red-800 rounded-md h-9 sm:h-11 text-sm"
                      onClick={() => {
                        closeSlotModal();
                        handleCloseTimeSlot(selectedSlotInfo.userId, selectedSlotInfo.slotTime);
                      }}
                    >
                      <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                      Zaman Dilimini Kapat
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <DialogFooter className="mt-2">
            <Button
              variant="outline"
              className="w-full rounded-md h-9 sm:h-11 text-sm"
              onClick={closeSlotModal}
            >
              Kapat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 