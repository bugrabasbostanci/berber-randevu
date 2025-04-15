import { formatShortDate } from "@/components/calendar/shared/utils/date-utils"
import { useMobile } from "@/components/calendar/shared/hooks/useMobile"
import { MAX_APPOINTMENTS_PER_DAY } from "@/lib/data"

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
  const { isMobile } = useMobile()
  
  return (
    <div className="mt-4 bg-white rounded-lg border border-gray-200 p-3">
      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
        <div className="text-sm font-medium text-gray-800 mb-1 sm:mb-0 sm:mr-4">Randevu Durumu:</div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded-full mr-2 flex items-center justify-center">
              <svg className="w-2 h-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <circle cx="10" cy="10" r="4" />
              </svg>
            </div>
            <span className="text-sm text-gray-600">Randevu Yok (0/{MAX_APPOINTMENTS_PER_DAY})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Az Dolu (1-{Math.floor(MAX_APPOINTMENTS_PER_DAY * 0.5) - 1}/{MAX_APPOINTMENTS_PER_DAY})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Orta Dolu ({Math.floor(MAX_APPOINTMENTS_PER_DAY * 0.5)}-{MAX_APPOINTMENTS_PER_DAY - 1}/{MAX_APPOINTMENTS_PER_DAY})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Tamamen Dolu ({MAX_APPOINTMENTS_PER_DAY}/{MAX_APPOINTMENTS_PER_DAY})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-sm text-gray-600">Kapalı</span>
          </div>
        </div>
      </div>
    </div>
  )
} 