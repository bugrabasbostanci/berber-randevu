import { cn } from "@/lib/utils"

interface SkeletonLoaderProps {
  type?: "calendar" | "appointments" | "day"
  count?: number
  className?: string
}

export function SkeletonLoader({ type = "calendar", count = 5, className }: SkeletonLoaderProps) {
  if (type === "calendar") {
    return (
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, index) => (
          <div
            key={index}
            className="h-12 bg-gray-100 animate-pulse rounded-md"
          />
        ))}
      </div>
    )
  }

  if (type === "day") {
    return (
      <div className={cn("grid gap-3", className)}>
        <div className="flex justify-between mb-3 animate-pulse">
          <div className="h-10 w-32 bg-gray-100 rounded-md"></div>
          <div className="h-10 w-28 bg-gray-100 rounded-md"></div>
        </div>
        {Array.from({ length: count }).map((_, index) => (
          <div key={index} className="bg-gray-100 h-16 rounded-lg animate-pulse"></div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-gray-100 h-12 rounded-md animate-pulse"
        />
      ))}
    </div>
  )
} 