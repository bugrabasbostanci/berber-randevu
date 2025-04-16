import { ChevronLeft, ChevronRight, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatMonth } from "@/components/calendar/shared/utils/date-utils"
import { Loader } from "@/components/ui/loader"

interface CalendarHeaderProps {
  currentMonth: Date
  onPreviousMonth: () => void
  onNextMonth: () => void
  isLoading?: boolean
}

export const CalendarHeader = ({
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  isLoading = false
}: CalendarHeaderProps) => {
  return (
    <div className="bg-white border-b border-gray-200 mb-4 py-3 rounded-t-lg">
      <div className="flex items-center justify-between mx-auto">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold text-gray-800">Randevu Takvimi</h2>
        </div>
        <div className="flex items-center space-x-1 bg-gray-50 rounded-lg border border-gray-200 p-1 shadow-sm">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 active:bg-gray-200" 
            onClick={onPreviousMonth}
            disabled={isLoading}
            aria-label="Önceki Ay"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Önceki Ay</span>
          </Button>
          <span className="px-3 py-1 text-sm font-medium text-gray-700 min-w-20 text-center">
            {isLoading ? (
              <div className="flex justify-center">
                <Loader size="sm" />
              </div>
            ) : (
              formatMonth(currentMonth)
            )}
          </span>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-md text-gray-500 hover:bg-gray-100 active:bg-gray-200" 
            onClick={onNextMonth}
            disabled={isLoading}
            aria-label="Sonraki Ay"
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Sonraki Ay</span>
          </Button>
        </div>
      </div>
    </div>
  )
} 