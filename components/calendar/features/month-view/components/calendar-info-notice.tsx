import { formatShortDate } from "@/components/calendar/shared/utils/date-utils"
import { Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CalendarInfoNoticeProps {
  startDate: Date
  endDate: Date
}

export const CalendarInfoNotice = ({
  startDate,
  endDate,
}: CalendarInfoNoticeProps) => {
  return (
    <Alert className="mb-4 bg-blue-50 border-blue-200 text-blue-800">
      <Info className="h-4 w-4 mr-2 text-blue-500" />
      <AlertDescription className="text-sm">
        Bugünden itibaren <span className="font-semibold">7 gün</span> içerisindeki ({formatShortDate(startDate)} -{" "}
        {formatShortDate(endDate)}) randevuları görüntüleyebilirsiniz. Tüm randevular <span className="font-semibold">45 dakikadır.</span>
      </AlertDescription>
    </Alert>
  )
} 