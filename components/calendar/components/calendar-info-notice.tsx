import { format } from "date-fns"
import { tr } from "date-fns/locale"

interface CalendarInfoNoticeProps {
  startDate: Date
  endDate: Date
}

export const CalendarInfoNotice = ({
  startDate,
  endDate,
}: CalendarInfoNoticeProps) => {
  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-md text-sm mb-4">
      <p className="font-medium">Randevu Bilgisi</p>
      <p className="text-muted-foreground">
        Sadece bugünden itibaren 7 gün içerisinde ({format(startDate, "d MMM", { locale: tr })} -{" "}
        {format(endDate, "d MMM", { locale: tr })}) randevu alabilirsiniz. Tüm randevular 45 dakika sürer.
      </p>
    </div>
  )
} 