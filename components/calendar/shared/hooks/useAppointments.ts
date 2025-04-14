import { useState } from "react"
import { toast } from "sonner"
import { Appointment } from "@/types"

interface UseAppointmentsResult {
  isLoading: boolean
  createAppointment: (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "user">) => Promise<boolean>
  updateAppointment: (id: string, appointmentData: Partial<Appointment>) => Promise<boolean>
  deleteAppointment: (id: string) => Promise<boolean>
}

export const useAppointments = (): UseAppointmentsResult => {
  const [isLoading, setIsLoading] = useState(false)

  // Yeni randevu oluştur
  const createAppointment = async (appointmentData: Omit<Appointment, "id" | "createdAt" | "updatedAt" | "user">): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Randevu oluşturulurken bir hata oluştu")
      }

      toast.success("Randevu başarıyla oluşturuldu")
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Randevu oluşturulurken bir hata oluştu")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Mevcut randevuyu güncelle
  const updateAppointment = async (id: string, appointmentData: Partial<Appointment>): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Randevu güncellenirken bir hata oluştu")
      }

      toast.success("Randevu başarıyla güncellendi")
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Randevu güncellenirken bir hata oluştu")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Randevuyu sil
  const deleteAppointment = async (id: string): Promise<boolean> => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Randevu silinirken bir hata oluştu")
      }

      toast.success("Randevu başarıyla silindi")
      return true
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Randevu silinirken bir hata oluştu")
      return false
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    createAppointment,
    updateAppointment,
    deleteAppointment
  }
} 