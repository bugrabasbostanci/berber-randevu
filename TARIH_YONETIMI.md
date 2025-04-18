# Berber Randevu Uygulaması: Tarih Yönetimi

Bu döküman, Berber Randevu uygulamasındaki tarih-saat işlemleri için standartları ve kullanım şekillerini açıklar.

## Tarih İşlemleri İçin Standartlar

Projede tutarlı bir tarih formatı ve işleme yaklaşımı benimsenmesi için aşağıdaki standartlar belirlenmiştir:

### Tarih Formatları

`utils.ts` içinde tanımlanan sabit formatlar:

```typescript
export const DATE_FORMAT = {
  ISO_DATE: "yyyy-MM-dd", 
  ISO_TIME: "HH:mm",
  ISO_DATETIME: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  DISPLAY_DATE: "d MMMM yyyy",
  DISPLAY_TIME: "HH:mm",
  DISPLAY_DATETIME: "d MMMM yyyy HH:mm"
}
```

### Tarih İşleme Kütüphanesi

Proje genelinde `date-fns` kütüphanesi kullanılmaktadır. Ancak doğrudan bu kütüphaneyi kullanmak yerine, `lib/utils.ts` içinde tanımlı yardımcı fonksiyonları kullanın:

- `safeParseDate`: String olarak gelen tarihi güvenli bir şekilde Date'e çevirir
- `formatDate`: Tarihi belirli bir formatta görüntüler 
- `startOfDay` ve `endOfDay`: Gün başlangıcı ve sonunu belirler
- `formatDatesForApi`: Bir nesneyi API için formatlar, tüm Date alanlarını ISO String'e dönüştürür

## API Kullanımı

### Client tarafında API istekleri:

1. URL'de tarih parametresi geçerken:
   ```typescript
   // YYYY-MM-DD formatını kullan
   const dateStr = toISODateString(selectedDate);
   // Örnek: /api/appointments/date/2024-04-23
   ```

2. Query parametresi olarak tarih gönderirken:
   ```typescript
   // ISO String formatını kullan
   const isoDate = selectedDate.toISOString();
   // Örnek: /api/appointments/closed-slots?date=2024-04-23T14:30:00.000Z
   ```

3. POST body'de tarih gönderirken:
   ```typescript
   // Doğrudan Date nesnesi gönder, API tarafında formatlanacak
   const appointmentData = {
     date: selectedDate, // Date nesnesi
     fullname,
     // ...
   };
   ```

### Server tarafında API istekleri karşılarken:

1. Request'ten tarih değerlerini alırken:
   ```typescript
   const date = searchParams.get("date");
   // safeParseDate ile dönüştür
   const parsedDate = safeParseDate(date);
   ```

2. Gün başlangıcı ve bitişi için:
   ```typescript
   const start = startOfDay(date);
   const end = endOfDay(date);
   ```

3. Aynı günde belirli saatleri karşılaştırırken:
   ```typescript
   const time1 = formatDate(date1, DATE_FORMAT.ISO_TIME);
   const time2 = formatDate(date2, DATE_FORMAT.ISO_TIME);
   ```

4. API yanıtında tarih içeren nesneleri döndürürken:
   ```typescript
   return NextResponse.json(formatDatesForApi(resultObject));
   ```

## Önemli Notlar

1. Tarih, gün ve saat işlemlerinde manuel olarak `new Date()` ve `setHours()` gibi yöntemler yerine, util fonksiyonlarını kullanın.

2. Zaman dilimi farklılıklarından kaynaklı sorunları önlemek için string olarak tarih alırken mutlaka `safeParseDate` kullanın.

3. API yanıtlarında tutarlılık için `formatDatesForApi` fonksiyonu kullanılmalıdır.

## Sık Karşılaşılan Sorunlar ve Çözümleri

1. **Sorun**: Frontend'de seçilen bir tarih, backend'de farklı güne ait olarak görünebilir.
   
   **Çözüm**: Tarih seçimi yapıldığında önce `toISODateString` ile YYYY-MM-DD formatına, ya da Date nesnesini doğrudan `toISOString()` ile ISO formatına çevirip gönderin.

2. **Sorun**: Aynı saat için kontrol yaparken saatler eşleşmiyor.
   
   **Çözüm**: Her iki tarihten de saati `formatDate(date, DATE_FORMAT.ISO_TIME)` ile alıp karşılaştırın.

3. **Sorun**: API yanıtında tarihler string olarak alınıyor, tekrar Date'e çevrilemiyor.
   
   **Çözüm**: API yanıtlarında `formatDatesForApi` kullanıldığından, frontend'de `safeParseDate` ile çevirme işlemi yapabilirsiniz. 