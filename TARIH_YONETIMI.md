# Berber Randevu Sistemi - Tarih ve Saat Yönetimi Kılavuzu

Bu döküman, berber randevu sistemimizde tarih ve saat yönetimi için benimsediğimiz yaklaşımı açıklar.

## Temel Prensip: Yerel Saat Kullanımı

Randevu sistemimiz, **tamamen yerel saat** üzerinden çalışmaktadır. Berber dükkanı tek bir lokasyonda hizmet verdiği ve çalışma saatleri yerel zaman diliminde tanımlandığı için (09:30 - 20:45), sistemin tüm bileşenlerinde yerel saat kullanmak en uygun yaklaşımdır.

## Tarih/Saat İşleme Kuralları

1. **Tüm Date nesneleri yerel saat olarak ele alınır**
   - JavaScript Date nesneleri, iç veride UTC kullanır ancak biz görüntüleme ve karşılaştırma işlemlerinde daima yerel saati kullanırız

2. **Saat karşılaştırmalarında HH:MM formatı kullanılır**
   - Örnek: "09:30" === "09:30"
   - Bu format, zaman dilimi farklarını ortadan kaldırır

3. **Veritabanında tarihler ISO formatında saklanır**
   - Fakat bu tarihler daima yerel saat olarak yorumlanır
   - Kullanıcı arayüzünde daima yerel saat görüntülenir

## Kullanılan Yardımcı Fonksiyonlar

Tarih ve saat işlemleri için şu yardımcı fonksiyonlar kullanılır:

- `safeParseDate`: String olarak gelen tarihi güvenli bir şekilde Date'e çevirir
- `formatTimeFromDate`: Date nesnesini HH:MM formatına dönüştürür
- `createLocalDatetime`: Yerel saat olarak Date nesnesi oluşturur
- `parseISOAsLocalDate`: ISO formatındaki tarihi yerel saat olarak yorumlar

## Tipik Kullanım Senaryoları

### 1. Kapalı Slot Oluşturma

```typescript
// Gelen veriler
const date = "2025-04-25"; // YYYY-MM-DD
const time = "09:30";      // HH:MM
const userId = 1;

// Yıl, ay, gün, saat ve dakikayı ayrıştır
const [year, month, day] = date.split('-').map(Number);
const [hours, minutes] = time.split(':').map(Number);

// Yerel saat olarak tarih oluştur
const slotDate = createLocalDatetime(year, month, day, hours, minutes);

// Veritabanına kaydet
await prisma.closedSlot.create({
  data: {
    userId,
    date: slotDate,  // Yerel saat
    reason: "Öğle molası"
  }
});
```

### 2. Kapalı Slot Kontrolü

```typescript
// Gelen parametreler
const date = "2025-04-25";  // YYYY-MM-DD
const time = "09:30";       // HH:MM
const userId = 1;

// Yerel saat olarak tarih oluştur
const [year, month, day] = date.split('-').map(Number);
const [hours, minutes] = time.split(':').map(Number);

// İlgili günün tüm kapalı slotlarını getir
const closedSlots = await prisma.closedSlot.findMany({
  where: {
    userId,
    date: {
      gte: new Date(year, month-1, day, 0, 0, 0),    // Günün başlangıcı
      lte: new Date(year, month-1, day, 23, 59, 59)  // Günün sonu
    }
  }
});

// HH:MM formatında karşılaştır
const timeToCheck = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
const isSlotClosed = closedSlots.some(slot => {
  const slotHour = slot.date.getHours();
  const slotMinute = slot.date.getMinutes();
  const slotTime = `${slotHour.toString().padStart(2, '0')}:${slotMinute.toString().padStart(2, '0')}`;
  return slotTime === timeToCheck;
});
```

## Olası Sorunlar ve Çözümleri

1. **Yaz Saati Uygulaması Geçişleri**
   - Yaz saati geçişlerinde sorun yaşanabilir
   - Çözüm: Tüm tarihleri yerel saat olarak işlemek

2. **Zaman Dilimi Farklılıkları**
   - Sunucu ve istemci farklı zaman dilimlerinde olabilir
   - Çözüm: Zaman dilimi farklılıklarından kaynaklı sorunları önlemek için string olarak tarih alırken mutlaka `safeParseDate` kullanın.

3. **Veri Transferinde Yaşanan Sorunlar**
   - API yanıtlarında tarihler ISO formatında gönderilir
   - Çözüm: API yanıtlarında `formatDatesForApi` kullanıldığından, frontend'de `parseISOAsLocalDate` ile çevirme işlemi yapabilirsiniz.

## Sonuç

Bu yaklaşımla, UTC ve yerel saat arasındaki karışıklıkları önlemiş oluruz. Sistem, berber ve müşterilerin anlayacağı şekilde daima yerel saat üzerinden çalışır. 