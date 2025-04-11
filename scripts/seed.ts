import { prisma } from "../lib/prisma"
import { sampleAppointments } from "../lib/data"

async function main() {
  try {
    // Önce mevcut randevuları temizle
    await prisma.appointment.deleteMany()

    // Örnek randevuları ekle
    const createdAppointments = await Promise.all(
      sampleAppointments.map(appointment => 
        prisma.appointment.create({
          data: {
            fullname: appointment.fullname,
            date: appointment.date,
            phone: appointment.phone
          }
        })
      )
    )

    console.log(`${createdAppointments.length} randevu başarıyla eklendi`)
  } catch (error) {
    console.error("Randevular eklenirken hata oluştu:", error)
  } finally {
    await prisma.$disconnect()
  }
}

main() 