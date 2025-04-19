import { toast } from "sonner";

/**
 * Kapalı slotları getiren servis
 */
export const ClosedSlotService = {
  /**
   * Belirli bir gün için kapalı slotları getirir
   */
  async getClosedSlots(date: Date) {
    try {
      console.log("Kapalı slotları getirme isteği yapılıyor...");
      
      // Zaman dilimi sorunlarını önlemek için tarih normalleştirme
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // Gün ortasında bir saat kullanarak zaman dilimi sorunlarını minimize et
        0,
        0,
        0
      );
      
      console.log(`Normalize edilmiş tarih: ${normalizedDate.toISOString()}`);
      
      // Önbellek parametreleri ile isteği gönder
      const response = await fetch(`/api/appointments/closed-slots?date=${normalizedDate.toISOString()}`, {
        method: 'GET',
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        console.error(`Kapalı slotlar getirilemedi. Status: ${response.status}, Text: ${response.statusText}`);
        throw new Error(`Kapalı slotlar getirilemedi. Status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`${data.length} kapalı slot alındı.`);
      
      if (data.length > 0) {
        // İlk üç slotu örnek olarak göster
        const sampleSlots = data.slice(0, 3);
        console.log('Örnek kapalı slotlar:', sampleSlots);
      }
      
      return data;
    } catch (error) {
      console.error("Kapatılan zaman dilimleri getirilirken hata oluştu:", error);
      return [];
    }
  },

  /**
   * Bir zaman dilimini kapatır
   */
  async closeSlot(userId: number, date: Date, reason: string) {
    try {
      // Saat dilimi sorunlarını önlemek için gelen tarihi normalize et
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        date.getHours(),
        date.getMinutes(),
        0,
        0
      );
      
      console.log(`Zaman dilimi kapatma isteği gönderiliyor:`, {
        userId,
        date: normalizedDate.toISOString(),
        saat: `${normalizedDate.getHours()}:${normalizedDate.getMinutes()}`
      });
      
      const response = await fetch('/api/appointments/close-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date: normalizedDate,
          reason: reason || 'Berber/Çalışan tarafından kapatıldı'
        })
      });

      if (!response.ok) {
        throw new Error('Zaman dilimi kapatılamadı');
      }

      toast.success('Zaman dilimi başarıyla kapatıldı');
      return true;
    } catch (error) {
      console.error('Zaman dilimi kapatılırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Zaman dilimi kapatılamadı');
      return false;
    }
  },

  /**
   * Bir günün tamamını kapatır
   */
  async closeDay(userId: number, date: Date, reason: string) {
    try {
      // Saat dilimi sorunlarını önlemek için tarihi normalize et
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // Gün ortasındaki bir saat kullanarak saat dilimi sorunlarından kaçın
        0,
        0,
        0
      );
      
      console.log("Gün kapatma isteği gönderiliyor:", {
        userId,
        date: normalizedDate.toISOString(),
        reason
      });
      
      const response = await fetch('/api/appointments/close-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date: normalizedDate,
          reason: reason || 'Berber/Çalışan tarafından tüm gün kapatıldı'
        })
      });

      if (!response.ok) {
        throw new Error('Gün kapatılamadı');
      }

      const data = await response.json();
      console.log("Gün kapatma başarılı, cevap:", data);
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Gün kapatılırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Gün kapatılamadı');
      return false;
    }
  },

  /**
   * Bir zaman dilimini açar
   */
  async openSlot(userId: number, date: Date) {
    try {
      const response = await fetch('/api/appointments/open-slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date
        })
      });

      if (!response.ok) {
        throw new Error('Zaman dilimi açılamadı');
      }

      toast.success('Zaman dilimi başarıyla açıldı');
      return true;
    } catch (error) {
      console.error('Zaman dilimi açılırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Zaman dilimi açılamadı');
      return false;
    }
  },

  /**
   * Bir günün tamamını açar
   */
  async openDay(userId: number, date: Date) {
    try {
      // Zaman dilimi sorunlarını önlemek için tarihi normalize et
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, // Gün ortasındaki bir saat kullanarak saat dilimi sorunlarından kaçın
        0,
        0,
        0
      );
      
      console.log("Gün açma isteği gönderiliyor:", {
        userId,
        date: normalizedDate.toISOString()
      });
      
      const response = await fetch('/api/appointments/open-day', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          date: normalizedDate
        })
      });

      if (!response.ok) {
        throw new Error('Gün açılamadı');
      }

      const data = await response.json();
      console.log("Gün açma başarılı, cevap:", data);
      toast.success(data.message);
      return true;
    } catch (error) {
      console.error('Gün açılırken hata oluştu:', error);
      toast.error(error instanceof Error ? error.message : 'Gün açılamadı');
      return false;
    }
  }
}; 