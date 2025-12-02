import * as React from "react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { IconCalendar } from "@tabler/icons-react"
import { DateRange } from "react-day-picker"

export interface DateTimeRange {
  from?: Date
  to?: Date
  fromTime?: string
  toTime?: string
}

interface DateTimeRangePickerProps extends React.HTMLAttributes<HTMLDivElement> {
  dateTimeRange?: DateTimeRange
  onDateTimeRangeChange?: (range: DateTimeRange) => void
  placeholder?: string
  align?: "center" | "start" | "end"
  className?: string
}

export function DateTimeRangePicker({
  dateTimeRange,
  onDateTimeRangeChange,
  placeholder = "选择日期时间范围",
  align = "center",
  className,
}: DateTimeRangePickerProps) {
  const [isPopoverOpen, setIsPopoverOpen] = React.useState(false)
  const [range, setRange] = React.useState<DateTimeRange>(dateTimeRange || {})

  React.useEffect(() => {
    if (dateTimeRange) {
      setRange(dateTimeRange)
    }
  }, [dateTimeRange])

  // 处理日期变更
  const handleDateRangeChange = (selectedRange: DateRange | undefined) => {
    if (!selectedRange) return
    
    const newRange = { 
      ...range, 
      from: selectedRange.from, 
      to: selectedRange.to,
      // 如果没有设置过时间，则默认设置为00:00:00
      fromTime: range.fromTime || "00:00:00",
      toTime: range.toTime || "23:59:59"
    }
    setRange(newRange)
    
    if (onDateTimeRangeChange) {
      onDateTimeRangeChange(newRange)
    }
  }

  // 处理开始时间变更
  const handleFromTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = { ...range, fromTime: e.target.value }
    setRange(newRange)
    
    if (onDateTimeRangeChange) {
      onDateTimeRangeChange(newRange)
    }
  }

  // 处理结束时间变更
  const handleToTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRange = { ...range, toTime: e.target.value }
    setRange(newRange)
    
    if (onDateTimeRangeChange) {
      onDateTimeRangeChange(newRange)
    }
  }

  // 格式化显示文本
  const formatDisplayText = () => {
    if (!range.from) return placeholder

    const fromDate = range.from ? format(range.from, "yyyy-MM-dd") : ""
    
    if (!range.to) {
      return fromDate
    }

    const toDate = format(range.to, "yyyy-MM-dd")

    return `${fromDate} 至 ${toDate}`
  }

  // 清除选择
  const handleClear = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
    const newRange = {}
    setRange(newRange)
    
    if (onDateTimeRangeChange) {
      onDateTimeRangeChange(newRange as DateTimeRange)
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !range.from && "text-muted-foreground"
            )}
          >
            <IconCalendar className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">{formatDisplayText()}</span>
            {(range.from || range.to) && (
              <div 
                className="h-6 w-6 p-0 ml-auto flex-shrink-0 inline-flex items-center justify-center rounded-md hover:bg-accent cursor-pointer" 
                onClick={handleClear}
                aria-label="清除日期"
              >
                ✕
              </div>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <div className="p-4 space-y-4">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={range.from}
              selected={{
                from: range.from,
                to: range.to,
              }}
              onSelect={handleDateRangeChange}
              numberOfMonths={2}
              className="border rounded-md"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">开始时间</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={range.fromTime?.substring(0, 5) || ""}
                    onChange={handleFromTimeChange}
                    className="w-full"
                    step="1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">结束时间</div>
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={range.toTime?.substring(0, 5) || ""}
                    onChange={handleToTimeChange}
                    className="w-full"
                    step="1"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button 
                onClick={() => setIsPopoverOpen(false)}
                className="w-20"
              >
                确定
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
} 