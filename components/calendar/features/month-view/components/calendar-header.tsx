import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonth } from "@/components/calendar/shared/utils/date-utils"

interface CalendarHeaderProps {
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
}

export const CalendarHeader = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
}: CalendarHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h1 className="text-xl md:text-2xl font-bold">Randevu Takvimi</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={onPreviousMonth}>
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Önceki Ay</span>
        </Button>
        <span className="text-sm font-medium">
          {formatMonth(currentMonth)}
        </span>
        <Button variant="outline" size="icon" onClick={onNextMonth}>
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Sonraki Ay</span>
        </Button>
      </div>
    </div>
  )
} 