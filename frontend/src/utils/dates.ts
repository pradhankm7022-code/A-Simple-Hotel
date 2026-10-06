import { format, parseISO, differenceInCalendarDays, eachDayOfInterval } from 'date-fns'

export function formatDate(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM yyyy')
}

export function formatDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'dd MMM')
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

export function countNights(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))
}

export function getNightDates(checkIn: string, checkOut: string): string[] {
  const start = parseISO(checkIn)
  const end = parseISO(checkOut)
  // nights = [checkIn, checkOut) exclusive of checkOut
  const days = eachDayOfInterval({ start, end })
  return days.slice(0, -1).map((d) => format(d, 'yyyy-MM-dd'))
}

export function isValidDateRange(checkIn: string, checkOut: string): boolean {
  return countNights(checkIn, checkOut) >= 1
}

export function today(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function minCheckOut(checkIn: string): Date {
  const d = parseISO(checkIn)
  d.setDate(d.getDate() + 1)
  return d
}
