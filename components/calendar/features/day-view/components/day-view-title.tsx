import { getDay } from "date-fns"
import { formatMediumDate, formatDayName } from "@/components/calendar/shared/utils/date-utils"

interface DayViewTitleProps {
  date: Date
}

export const DayViewTitle = ({ date }: DayViewTitleProps) => {
  const isSunday = getDay(date) === 0

  return (
    <h2 className="text-lg sm:text-xl font-bold mb-4 px-2">
      {formatMediumDate(date)}
      {", "}
      {formatDayName(date)}
      {isSunday && (
        <span className="ml-2 text-sm font-normal text-red-500">
          (Kapalı)
        </span>
      )}
    </h2>
  )
} 