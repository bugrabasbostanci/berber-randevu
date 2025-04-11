# Berber Randevu Sistemi 🪒

Bu proje, Google OAuth entegrasyonu ile güvenli bir şekilde giriş yapılabilen ve berberler için randevu yönetim sistemi sunan bir web uygulamasıdır.

## 🚀 Özellikler

- **Güvenli Kimlik Doğrulama**
  - Google OAuth 2.0 entegrasyonu
  - NextAuth.js ile oturum yönetimi
  - Supabase veritabanı entegrasyonu

- **Randevu Yönetimi**
  - Aylık ve günlük takvim görünümü
  - Randevu oluşturma, düzenleme ve iptal etme
  - Çakışan randevuları önleme sistemi
  - Kapalı gün ve saat yönetimi

- **Kullanıcı Dostu Arayüz**
  - Responsive tasarım (mobil uyumlu)
  - Modern ve şık kullanıcı arayüzü
  - Kolay kullanılabilir takvim sistemi

## 🛠️ Teknoloji Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Veritabanı**: Supabase (PostgreSQL)
- **Kimlik Doğrulama**: NextAuth.js, Google OAuth
- **Stil**: Tailwind CSS, Shadcn UI

## 🚀 Başlangıç

1. Projeyi klonlayın:
```bash
git clone [repo-url]
cd berber-randevu-sistemi
```

2. Bağımlılıkları yükleyin:
```bash
npm install
```

3. Gerekli ortam değişkenlerini ayarlayın:
```env
DATABASE_URL="your-supabase-url"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

4. Veritabanı şemasını senkronize edin:
```bash
npx prisma db push
```

5. Geliştirme sunucusunu başlatın:
```bash
npm run dev
```

Uygulama http://localhost:3000 adresinde çalışmaya başlayacaktır.

## 📱 Kullanım

1. Google hesabınızla giriş yapın
2. Takvimden uygun bir gün seçin
3. Boş zaman dilimlerinden birini seçerek randevu oluşturun
4. Randevularınızı takvim üzerinden yönetin

## 🤝 Katkıda Bulunma

1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'feat: add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Bir Pull Request oluşturun

## 📝 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Daha fazla bilgi için `LICENSE` dosyasına bakın.

## 👥 İletişim

Proje Sahibi - [@your-github-username](https://github.com/your-github-username)

Proje Linki: [https://github.com/your-username/berber-randevu-sistemi](https://github.com/your-username/berber-randevu-sistemi)
