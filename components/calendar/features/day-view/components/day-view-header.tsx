import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DayViewHeaderProps {
  date: Date
  onBack: () => void
  isBreakpoint: { sm: boolean }
}

export const DayViewHeader = ({ onBack, isBreakpoint }: DayViewHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <Button 
        variant="ghost" 
        onClick={onBack}
        className="sm:px-4 px-2"
      >
        <ChevronLeft className="h-4 w-4 sm:mr-2" />
        <span className={cn("transition-opacity", isBreakpoint.sm ? "opacity-0 hidden" : "opacity-100")}>
          Takvime Dön
        </span>
      </Button>
    </div>
  )
} 