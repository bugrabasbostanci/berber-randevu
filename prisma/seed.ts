import { PrismaClient } from '@prisma/client';
import { addDays, setHours, setMinutes } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Veritabanı seed işlemi başlatılıyor...');

  // Mevcut verileri temizle
  console.log('Mevcut verileri temizleniyor...');
  await prisma.appointment.deleteMany();
  await prisma.allowedUser.deleteMany();

  // Berber ve çalışanı ekle
  console.log('Berber ve çalışan ekleniyor...');
  const berber = await prisma.allowedUser.create({
    data: {
      email: 'berber@example.com',
      name: 'Berber'
    }
  });

  const calisan = await prisma.allowedUser.create({
    data: {
      email: 'calisan@example.com',
      name: 'Çalışan'
    }
  });

  // Örnek randevular ekle
  console.log('Örnek randevular ekleniyor...');
  const today = new Date();
  
  // Berber için randevular
  await prisma.appointment.create({
    data: {
      fullname: 'Ahmet Yılmaz',
      date: setMinutes(setHours(today, 10), 30),
      phone: '5551234567',
      userId: berber.id
    }
  });

  await prisma.appointment.create({
    data: {
      fullname: 'Mehmet Kaya',
      date: setMinutes(setHours(today, 14), 0),
      phone: '5559876543',
      userId: berber.id
    }
  });

  // Çalışan için randevular
  await prisma.appointment.create({
    data: {
      fullname: 'Ali Demir',
      date: setMinutes(setHours(today, 11), 30),
      phone: '5554567890',
      userId: calisan.id
    }
  });

  await prisma.appointment.create({
    data: {
      fullname: 'Veli Şahin',
      date: setMinutes(setHours(today, 15), 30),
      phone: '5553456789',
      userId: calisan.id
    }
  });

  // Yarın için randevular
  const tomorrow = addDays(today, 1);

  await prisma.appointment.create({
    data: {
      fullname: 'Can Öztürk',
      date: setMinutes(setHours(tomorrow, 9), 30),
      phone: '5552345678',
      userId: berber.id
    }
  });

  console.log('Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('Seed işlemi sırasında hata oluştu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 