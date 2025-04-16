import { isSameDay } from "date-fns"
import { Card, CardContent } from "@/components/ui/card"
import { Appointment } from "@/types"
import { DayStatus } from "./calendar-day"
import { useMobile } from "@/components/calendar/shared/hooks/useMobile"
import { cn } from "@/lib/utils"

// Takvim günü arayüzü
interface CalendarDay {
  day: number | null
  date: Date | null
  appointments: Appointment[]
  isCurrentMonth: boolean
  isToday: boolean
  isActive: boolean
}

interface MonthGridProps {
  daysToDisplay: Date[]
  emptyDaysAtStart: number
  currentMonth: Date
  selectedDate: Date
  appointments: Appointment[]
  isAuthenticated: boolean
  today: Date
  maxDate: Date
  onDayClick: (day: Date) => void
  getDayStatus: (day: Date) => DayStatus
  getDayStatusClass: (day: Date) => string
  getDayIndicatorClass: (day: Date) => string
  isDayActive: (day: Date) => boolean
  isDayVisible: (day: Date) => boolean
  getAppointmentsForDay: (day: Date) => Appointment[]
  maskName: (fullname: string) => string
}

export const MonthGrid = ({
  currentMonth,
  selectedDate,
  isAuthenticated,
  today,
  onDayClick,
  getDayStatus,
  isDayActive,
  isDayVisible,
  getAppointmentsForDay,
  maskName,
}: MonthGridProps) => {
  const { isMobile } = useMobile()
  const weekDays = isMobile 
    ? ["Pt", "S", "Ç", "P", "C", "Ct", "P"] 
    : ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

  // Aylık takvim grid'ini oluştur
  const calendarGrid = generateCalendarGrid(currentMonth, today)

  // Gün içeriğini render et
  const renderDayContent = (day: CalendarDay) => {
    if (day.day === null) return null

    // Pazar günü mü kontrol et (TR'de haftanın 7. günü)
    const isSunday = day.date ? day.date.getDay() === 0 : false
    
    // Günün durumunu belirle
    const getDayStatusIndicator = (day: CalendarDay) => {
      if (!day.date || !day.isActive || !day.isCurrentMonth) return null;
      if (isSunday) return null;
      
      const status = getDayStatus(day.date);
      
      // Status için tooltip içeriği
      const getStatusText = (status: DayStatus) => {
        switch(status) {
          case "empty":
            return "Randevu Yok";
          case "low":
            return "Az Dolu";
          case "medium":
            return "Orta Dolu";
          case "full":
            return "Tamamen Dolu";
          case "closed":
            return "Kapalı";
          default:
            return "";
        }
      };
      
      // Status rengi ve doluluk göstergesi
      let statusColor = "";
      const statusText = getStatusText(status);
      let statusIcon = null;
      
      switch (status) {
        case "empty":
          statusColor = "bg-blue-50 border border-blue-200";
          statusIcon = (
            <div className="flex items-center justify-center w-full h-full">
              <svg className="w-2 h-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="4" />
              </svg>
            </div>
          );
          break;
        case "low":
          statusColor = "bg-green-500";
          break;
        case "medium":
          statusColor = "bg-yellow-500";
          break;
        case "full":
          statusColor = "bg-red-500";
          break;
        case "closed":
          statusColor = "bg-gray-400";
          break;
        default:
          return null;
      }
      
      return (
        <div className="absolute top-1 right-1 sm:top-2 sm:right-2 group">
          <div className={`w-2 h-2 sm:w-3 sm:h-3 ${statusColor} rounded-full flex items-center justify-center`}>
            {statusIcon}
          </div>
          <div className="absolute hidden group-hover:block right-0 top-full mt-1 bg-black bg-opacity-80 text-white text-xs py-1 px-2 rounded whitespace-nowrap z-10">
            {statusText}
          </div>
        </div>
      );
    };
    
    // Mobil ve Desktop için farklı içerikler
    if (isMobile) {
      return (
        <>
          {/* Status indicator (doluluk oranı) */}
          {getDayStatusIndicator(day)}
          
          {/* Gün numarası */}
          <div className={cn(
            "text-sm font-medium",
            day.isToday ? "text-blue-600" : "",
            !day.isCurrentMonth ? "text-gray-400" : "",
            isSunday ? "text-red-500" : ""
          )}>
            {day.day}
          </div>

          {/* Mobil için sadece randevu sayısı göster */}
          {day.appointments.length > 0 && !isSunday && (
            <div className="absolute bottom-1 right-1">
              <div className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs font-medium">
                {day.appointments.length}
              </div>
            </div>
          )}
        </>
      )
    }
    
    // Desktop görünüm
    return (
      <>
        {/* Status indicator (doluluk oranı) */}
        {getDayStatusIndicator(day)}
        
        {/* Gün numarası */}
        <div className={cn(
          "text-sm font-medium",
          day.isToday ? "text-blue-600" : "",
          !day.isCurrentMonth ? "text-gray-400" : "",
          isSunday ? "text-red-500" : ""
        )}>
          {day.day}
        </div>

        {/* Randevu bilgileri - Pazar günlerinde gösterme */}
        {day.appointments.length > 0 && !isSunday && (
          <div className="absolute bottom-1 left-1 right-1">
            <div className="bg-white rounded px-1.5 py-1 shadow-sm border border-gray-300">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-800 font-medium truncate">
                  {new Date(day.appointments[0].date).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
                </span>
                {day.appointments.length > 1 && (
                  <span className="bg-blue-100 text-blue-700 rounded-full px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ml-1">
                    +{day.appointments.length - 1}
                  </span>
                )}
              </div>
              
              {/* İlk randevunun sahibi */}
              <div className="text-xs text-gray-600 truncate mt-0.5">
                {isAuthenticated 
                  ? day.appointments[0].fullname 
                  : maskName(day.appointments[0].fullname)
                }
              </div>
            </div>
          </div>
        )}
      </>
    )
  }

  // Ay takvimi için grid verilerini oluştur
  function generateCalendarGrid(currentMonth: Date, today: Date): CalendarDay[] {
    const firstDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDayOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    
    // Ayın ilk gününün haftanın hangi günü olduğunu bul (0: Pazar, 1: Pazartesi, ...)
    // Türkiye'de haftanın ilk günü Pazartesi olduğu için ayarlama yapıyoruz
    let firstDayIndex = firstDayOfMonth.getDay() - 1
    if (firstDayIndex === -1) firstDayIndex = 6 // Pazar günü için

    // Bugünden itibaren 7 günlük aktif pencereyi kontrol et (Pazar günleri hariç)
    const isWithinActiveWindow = (date: Date) => {
      // Pazar günlerini aktif saymıyoruz
      if (date.getDay() === 0) return false
      
      const currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0) // Günün başlangıcına ayarla
      
      const nextWeek = new Date(currentDate)
      nextWeek.setDate(currentDate.getDate() + 7) // 7 gün sonrası
      
      return date >= currentDate && date < nextWeek
    }

    // Grid'i oluştur
    const calendarDays: CalendarDay[] = []

    // Önceki aydan kalan günler
    for (let i = 0; i < firstDayIndex; i++) {
      calendarDays.push({
        day: null,
        date: null,
        appointments: [],
        isCurrentMonth: false,
        isToday: false,
        isActive: false
      })
    }

    // Mevcut ayın günleri
    for (let day = 1; day <= lastDayOfMonth.getDate(); day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
      const isToday = isSameDay(date, today)
      const dayAppointments = getAppointmentsForDay(date)
      const isActive = isDayActive(date) && isWithinActiveWindow(date)
      const isVisible = isDayVisible(date)

      calendarDays.push({
        day: day,
        date: date,
        appointments: isVisible ? dayAppointments : [],
        isCurrentMonth: true,
        isToday: isToday,
        isActive: isActive
      })
    }

    
    // Eğer takvim 6 satır gerektiriyorsa, son satırı dahil et
    const numberOfRows = Math.ceil((firstDayIndex + lastDayOfMonth.getDate()) / 7)
    const adjustedTotalDays = numberOfRows <= 5 ? 35 : 42
    
    const remainingDays = adjustedTotalDays - calendarDays.length
    
    // Sadece gerektiğinde sonraki aydan günleri ekle
    if (remainingDays > 0) {
      for (let i = 0; i < remainingDays; i++) {
        calendarDays.push({
          day: null,
          date: null,
          appointments: [],
          isCurrentMonth: false,
          isToday: false,
          isActive: false
        })
      }
    }

    return calendarDays
  }
  
  return (
    <Card className="border-gray-300 shadow-sm overflow-hidden">
      <CardContent className="p-0">
        {/* Haftanın günleri başlıkları */}
        <div className="grid grid-cols-7 bg-gray-50">
          {weekDays.map((day, index) => (
            <div key={day} className={cn(
              "py-1 sm:py-2 text-center text-xs sm:text-sm font-medium border-b border-gray-300",
              index === 6 ? "text-red-500 bg-red-50" : "text-gray-700" // Pazar günü (son gün) kırmızı
            )}>
              {day}
              {/* Sadece Pazar günü için kapalı bilgisi */}
              {index === 6 && (
                <div className="text-xs font-normal whitespace-nowrap">(Kapalı)</div>
              )}
            </div>
          ))}
        </div>

        {/* Takvim ızgarası */}
        <div className="grid grid-cols-7 border-b border-gray-300">
          {calendarGrid.map((day, index) => {
            const isSelected = day.date && isSameDay(day.date, selectedDate);
            const rowIndex = Math.floor(index / 7);
            const totalRows = Math.ceil(calendarGrid.length / 7);
            const isLastRow = rowIndex === totalRows - 1;
            const isLastColumn = (index + 1) % 7 === 0;
            const isSunday = day.date && day.date.getDay() === 0;
            
            // Hücre arkaplan rengi
            let cellBgColor = "bg-white";
            if (!day.isCurrentMonth) {
              cellBgColor = "bg-gray-50";
            } else if (isSunday) {
              cellBgColor = "bg-red-100"; // Daha belirgin kırmızı arka plan
            } else if (day.isActive || day.isToday) {
              // Hem aktif günler hem de bugün için aynı arka plan rengi
              cellBgColor = "bg-blue-100 hover:bg-blue-200";
            }
            
            return (
              <div 
                key={index} 
                className={cn(
                  "relative",
                  isMobile ? "min-h-14" : "min-h-24", 
                  isMobile ? "p-1" : "p-2",
                  // Güncel gün dışındaki günler için normal border
                  !day.isToday && "border-r border-gray-300",
                  !day.isToday && !isLastRow && "border-b",
                  !day.isToday && isLastColumn && "border-r-0",
                  cellBgColor,
                  (day.isActive || day.isToday) && !isSunday ? "cursor-pointer" : "",
                  isSunday ? "cursor-not-allowed" : "",
                  // Sadece güncel gün değilse ring efekti uygula
                  !day.isToday && isSelected ? "ring-2 ring-inset ring-blue-500" : ""
                )}
                onClick={() => day.date && (day.isActive || day.isToday) && !isSunday && onDayClick(day.date)}
              >
                {/* Sadece güncel gün için üst kenarlık */}
                {day.isToday && !isSunday && (
                  <div className={cn(
                    "absolute top-0 left-0 w-full", 
                    isMobile ? "h-0.5" : "h-1", 
                    "bg-blue-500"
                  )} />
                )}
                {renderDayContent(day)}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
} 