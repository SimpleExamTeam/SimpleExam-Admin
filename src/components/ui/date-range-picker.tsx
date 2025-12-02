import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DateRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateRange?: DateRange
  onDateRangeChange?: (dateRange: DateRange | undefined) => void
  placeholder?: string
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
  placeholder = "选择日期范围",
  className,
}: DateRangePickerProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(dateRange)

  React.useEffect(() => {
    setDate(dateRange)
  }, [dateRange])

  const handleDateRangeChange = (newDateRange: DateRange | undefined) => {
    setDate(newDateRange)
    if (onDateRangeChange) {
      onDateRangeChange(newDateRange)
    }
  }

  const handleClear = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    handleDateRangeChange(undefined)
  }

  // 格式化日期显示
  const formatDateDisplay = (date: Date) => {
    return format(date, "yyyy-MM-dd")
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal overflow-hidden px-2",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-1 h-4 w-4 shrink-0" />
            <span className="truncate text-xs">
              {date?.from ? (
                date.to ? (
                  <>
                    {formatDateDisplay(date.from)} ~ {formatDateDisplay(date.to)}
                  </>
                ) : (
                  formatDateDisplay(date.from)
                )
              ) : (
                placeholder
              )}
            </span>
            {date?.from && (
              <div 
                className="h-5 w-5 p-0 ml-1 shrink-0 inline-flex items-center justify-center rounded-md text-sm opacity-70 hover:opacity-100 cursor-pointer" 
                onClick={handleClear}
                aria-label="清除日期"
              >
                <span className="text-xs">✕</span>
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[9999]" align="center" sideOffset={4}>
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
} 