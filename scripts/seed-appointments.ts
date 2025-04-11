import { prisma } from '../lib/prisma'

async function seedAppointments() {
  try {
    // Önce mevcut randevuları temizle
    await prisma.appointment.deleteMany()

    // Örnek randevuları ekle
    const appointments = [
      {
        fullname: "İbrahim Çelik",
        date: new Date(),
        telefon: "555-123-4567",
        mail: "ibrahim@example.com"
      },
      {
        fullname: "Mustafa Demir",
        date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Yarın
        telefon: "555-234-5678",
        mail: "mustafa@example.com"
      },
      {
        fullname: "Ali Yılmaz",
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 gün sonra
        telefon: "555-345-6789",
        mail: "ali@example.com"
      },
      {
        fullname: "Veli Şahin",
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 gün sonra
        telefon: "555-456-7890",
        mail: "veli@example.com"
      },
      {
        fullname: "Mehmet Kaya",
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 gün sonra
        telefon: "555-567-8901",
        mail: "mehmet@example.com"
      },
      {
        fullname: "Ahmet Yıldız",
        date: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 gün sonra
        telefon: "555-678-9012",
        mail: "ahmet@example.com"
      },
      {
        fullname: "Hasan Öztürk",
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 gün sonra
        telefon: "555-789-0123",
        mail: "hasan@example.com"
      }
    ]

    for (const appointment of appointments) {
      await prisma.appointment.create({
        data: appointment
      })
    }

    console.log('Örnek randevular başarıyla eklendi!')
  } catch (error) {
    console.error('Randevular eklenirken hata oluştu:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedAppointments() 