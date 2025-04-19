import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import { Appointment, ClosedSlot } from "@/types"
import { ClosedSlotService } from "@/components/calendar/services/closed-slot-service"

interface UseDayViewProps {
  date: Date
  onRefresh: () => void
}

export const useDayView = ({ date, onRefresh }: UseDayViewProps) => {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | undefined>(undefined)
  const [isCreating, setIsCreating] = useState(false)
  const [appointmentToDelete, setAppointmentToDelete] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null)
  const [closedSlots, setClosedSlots] = useState<ClosedSlot[]>([])
  const [closeDayDialogOpen, setCloseDayDialogOpen] = useState(false)
  const [dayToClose, setDayToClose] = useState<{ userId: number; date: Date } | null>(null)
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false)
  const [selectedSlotTime, setSelectedSlotTime] = useState<Date | null>(null)
  const [closeSlotDialogOpen, setCloseSlotDialogOpen] = useState(false)
  const [slotToClose, setSlotToClose] = useState<{ userId: number; time: Date } | null>(null)
  const [closeSlotReason, setCloseSlotReason] = useState('')
  const [closeDayReason, setCloseDayReason] = useState('')

  // Kapalı slotları getiren fonksiyon
  const fetchClosedSlots = useCallback(async () => {
    try {
      console.log("Kapalı slotları getirme isteği yapılıyor...");
      console.log("Kullanılan tarih:", date.toISOString());
      
      // Sadece tarih bilgisini içeren yeni bir tarih oluşturalım (zaman dilimi sorunlarını önlemek için)
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // Ortada bir saat kullanarak zaman dilimi sorunlarını minimize edelim
        0,
        0,
        0
      );
      
      console.log("Normalize edilmiş tarih:", normalizedDate.toISOString());
      
      const response = await fetch(`/api/appointments/closed-slots?date=${normalizedDate.toISOString()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`${data.length} kapalı slot alındı.`);
        if (data.length > 0) {
          console.log("Alınan kapalı slotlar:", data);
        }
        setClosedSlots(data);
      } else {
        console.error("Kapalı slotları getirme isteği başarısız:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Kapatılan zaman dilimleri getirilirken hata oluştu:", error);
    }
  }, [date]);

  // Komponent mount olduğunda ve date değiştiğinde kapalı slotları getir
  useEffect(() => {
    fetchClosedSlots();
  }, [fetchClosedSlots]);

  // Randevu düzenleme
  const handleEdit = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setSelectedUserId(appointment.userId);
    setIsCreating(false);
    setIsAppointmentFormOpen(true);
  };

  // Randevu silme
  const handleDelete = async (appointmentId: string) => {
    setAppointmentToDelete(appointmentId);
    setDeleteDialogOpen(true);
  };

  // Randevu silme onayı
  const confirmDelete = async () => {
    if (!appointmentToDelete) return;

    try {
      const response = await fetch(`/api/appointments/${appointmentToDelete}`, {
        method: "DELETE"
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Randevu silinemedi");
      }

      toast.success("Randevu başarıyla silindi");
      onRefresh();
    } catch (error) {
      console.error("Randevu silinirken hata oluştu:", error);
      toast.error(error instanceof Error ? error.message : "Randevu silinirken bir hata oluştu");
    } finally {
      setDeleteDialogOpen(false);
      setAppointmentToDelete(null);
    }
  };

  // Yeni randevu oluşturma
  const handleCreate = (userId: number, slotTime: Date) => {
    setSelectedAppointment(undefined);
    setSelectedUserId(userId);
    setSelectedSlotTime(slotTime);
    setIsCreating(true);
    setIsAppointmentFormOpen(true);
  };

  // Zaman dilimi kapatma
  const handleCloseTimeSlot = async (userId: number, time: Date) => {
    setSlotToClose({ userId, time });
    setCloseSlotReason('');
    setCloseSlotDialogOpen(true);
  };

  // Zaman dilimi kapatma onayı
  const confirmCloseTimeSlot = async () => {
    if (!slotToClose) return;
    
    const success = await ClosedSlotService.closeSlot(
      slotToClose.userId, 
      slotToClose.time,
      closeSlotReason
    );
    
    if (success) {
      await fetchClosedSlots();
      onRefresh();
    }
    
    setCloseSlotDialogOpen(false);
    setSlotToClose(null);
    setCloseSlotReason('');
  };

  // Gün kapatma
  const handleCloseDay = async (userId: number) => {
    setDayToClose({ userId, date });
    setCloseDayReason('');
    setCloseDayDialogOpen(true);
  };

  // Gün kapatma onayı
  const confirmCloseDay = async () => {
    if (!dayToClose) return;

    try {
      const success = await ClosedSlotService.closeDay(
        dayToClose.userId,
        dayToClose.date,
        closeDayReason
      );
      
      if (success) {
        console.log("Gün kapatma başarılı, kapalı slotlar yeniden getiriliyor...");
        
        // Veritabanı işlemlerinin tamamlanması için kısa bir bekleme süresi ekleyelim
        // Bu, race condition'ları önleyecektir
        setTimeout(async () => {
          await fetchClosedSlots();
          onRefresh();
        }, 500);
      }
    } catch (error) {
      console.error("Gün kapatma işlemi sırasında hata:", error);
      toast.error("Gün kapatma işlemi sırasında bir hata oluştu");
    } finally {
      setCloseDayDialogOpen(false);
      setDayToClose(null);
      setCloseDayReason('');
    }
  };

  // Zaman dilimi açma
  const handleOpenSlot = async (userId: number, time: Date) => {
    const success = await ClosedSlotService.openSlot(userId, time);
    
    if (success) {
      await fetchClosedSlots();
      onRefresh();
    }
  };

  // Gün açma
  const handleOpenDay = async (userId: number) => {
    try {
      console.log("Gün açma işlemi başlatılıyor:", userId, date.toISOString());
      const success = await ClosedSlotService.openDay(userId, date);
      
      if (success) {
        console.log("Gün açma başarılı, kapalı slotlar yeniden getiriliyor...");
        
        // Veritabanı işlemlerinin tamamlanması için kısa bir bekleme süresi ekleyelim
        // Bu, race condition'ları önleyecektir
        setTimeout(async () => {
          await fetchClosedSlots();
          onRefresh();
        }, 500);
      }
    } catch (error) {
      console.error("Gün açma işlemi sırasında hata:", error);
      toast.error("Gün açma işlemi sırasında bir hata oluştu");
    }
  };

  // Randevu formunu kapatma
  const handleCloseAppointmentForm = () => {
    setIsAppointmentFormOpen(false);
    setSelectedUserId(null);
    setSelectedAppointment(undefined);
    setIsCreating(false);
    setSelectedSlotTime(null);
  };

  return {
    fetchClosedSlots,
    closedSlots,
    selectedAppointment,
    isCreating,
    appointmentToDelete,
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
  }
} 