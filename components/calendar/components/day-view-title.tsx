import { format, getDay } from "date-fns"
import { tr } from "date-fns/locale"

interface DayViewTitleProps {
  date: Date
}

export const DayViewTitle = ({ date }: DayViewTitleProps) => {
  const isSunday = getDay(date) === 0

  return (
    <h2 className="text-lg sm:text-xl font-bold mb-4 px-2">
      {format(date, "d MMMM", { locale: tr })}
      {", "}
      {format(date, "EEEE", { locale: tr })}
      {isSunday && (
        <span className="ml-2 text-sm font-normal text-red-500">
          (Kapalı)
        </span>
      )}
    </h2>
  )
} 