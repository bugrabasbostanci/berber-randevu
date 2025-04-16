# Berber Randevu Sistemi

Modern ve kullanıcı dostu bir berber randevu yönetim sistemi. Bu uygulama, berberlerin randevu yönetimini kolaylaştırmak, müşteri deneyimini iyileştirmek ve işletme verimliliğini artırmak amacıyla geliştirilmiştir.

![Berber Randevu Sistemi](/public/images/screenshot.png)

## 🎯 Proje Amacı

Bu proje, berber salonlarının ve müşterilerinin randevu süreçlerini dijitalleştirmek için geliştirilmiştir:

- 🔄 Kolay randevu oluşturma ve yönetimi
- 🕒 Zaman kaybını önleme
- 👤 İzin verilen hesaplar için özel erişim
- 📆 Randevu takvimini etkili yönetme
- 🚫 Kapalı zaman dilimlerini işaretleme

## ✨ Özellikler

- 🔐 Google hesabı ile güvenli kimlik doğrulama
- 📱 Responsive tasarım ile her cihazdan erişim
- 📅 Interaktif takvim arayüzü
- 📞 Müşteri iletişim ve geri bildirim sistemi
- ⏰ Randevu oluşturma ve düzenleme
- 🔒 Yalnızca izin verilen kullanıcılar için erişim
- 📊 Randevu istatistikleri görüntüleme

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS 4, Shadcn UI (Radix UI)
- **Backend**: Next.js API Routes, Next Auth 5
- **Veritabanı**: PostgreSQL (Supabase)
- **ORM**: Prisma 6
- **Kimlik Doğrulama**: Google OAuth

## 💾 Veritabanı Modelleri

- **Appointment**: Randevu bilgilerini tutar
- **AllowedUser**: Sisteme giriş yapabilen kullanıcıları yönetir
- **ClosedSlot**: Randevu alınamayacak zaman dilimlerini tutar
- **Contact**: Müşteri geri bildirimlerini saklar

## 🚀 Kurulum ve Çalıştırma

### Ön Koşullar

- Node.js 18+ ve npm
- PostgreSQL veritabanı (veya Supabase hesabı)
- Google Cloud hesabı (OAuth için)

### Adımlar

1. Projeyi klonlayın:
```bash
git clone https://github.com/kullaniciadi/berber-randevu-sistemi.git
cd berber-randevu-sistemi
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. `.env` dosyasını oluşturun ve aşağıdaki değişkenleri ayarlayın:
```
DATABASE_URL=postgresql://kullaniciadi:sifre@localhost:5432/berber_randevu
DIRECT_URL=postgresql://kullaniciadi:sifre@localhost:5432/berber_randevu
AUTH_SECRET=your-secure-secret-key
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

4. Veritabanı şemasını senkronize edin:
```bash
npm run db:push
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

6. Tarayıcınızda `http://localhost:3000` adresine giderek uygulamayı görüntüleyin.

## 📱 Kullanım Kılavuzu

### Berber/Çalışan Kullanımı
1. Google hesabınız ile giriş yapın (hesabınızın AllowedUser tablosunda kayıtlı olması gerekir)
2. Ana sayfadaki takvim görünümünden tarih seçin
3. Boş zaman dilimlerine randevu ekleyin veya mevcut randevuları düzenleyin
4. İzin/tatil günlerinizi "Kapalı Zaman Dilimleri" seçeneği ile işaretleyin

### Müşteri Randevusu (Berber tarafından)
1. Berber, boş bir zaman dilimi seçer
2. Müşteri bilgilerini (ad-soyad, telefon) doldurur
3. Randevu oluştur butonuna tıklar

## 🔧 Geliştirme

### Kodlama Standartları
- TypeScript tip kontrolü
- ESLint ile kod kalitesi kontrolü
- Düzenli kod formatı için Prettier
- Component bazlı yapı

### Klasör Yapısı
- `/app`: Next.js sayfa route yapısı
- `/components`: UI bileşenleri
- `/prisma`: Veritabanı şeması ve migrations
- `/lib`: Yardımcı fonksiyonlar
- `/types`: TypeScript tip tanımlamaları

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Feature branch oluşturun (`git checkout -b feature/yeni-özellik`)
3. Değişikliklerinizi commit edin (`git commit -m 'Yeni özellik: Açıklama'`)
4. Branch'inizi push edin (`git push origin feature/yeni-özellik`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) altında lisanslanmıştır.

---

⭐ Berber Randevu Sistemi - Berber işletmenizin dijital dönüşümü için modern çözüm
