import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { Info } from "lucide-react"

interface CalendarLegendProps {
  isAuthenticated: boolean
  today: Date
  maxDate: Date
}

export const CalendarLegend = ({
  isAuthenticated,
  today,
  maxDate,
}: CalendarLegendProps) => {
  return (
    <div className="mt-4 flex items-center justify-between">
      <div className="flex items-center gap-2 text-sm">
        <Info className="h-4 w-4 text-blue-500" />
        <span>
          {isAuthenticated 
            ? "Tüm randevuları görüntüleyebilirsiniz"
            : `Aktif tarih aralığı: ${format(today, "d MMM", { locale: tr })} - ${format(maxDate, "d MMM", { locale: tr })}`}
        </span>
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-green-400"></div>
          <span>Az Dolu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span>Orta Dolu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-red-400"></div>
          <span>Tamamen Dolu</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span>Kapalı</span>
        </div>
      </div>
    </div>
  )
} 