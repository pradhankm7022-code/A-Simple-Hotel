import { clsx } from 'clsx'

interface BadgeProps {
  status: string
  className?: string
}

const COLORS: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled:  'bg-red-100 text-red-800 border-red-200',
}

export default function Badge({ status, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block border px-2 py-0.5 text-xs font-semibold uppercase tracking-wider',
        COLORS[status] ?? 'bg-neutral-100 text-neutral-700 border-neutral-200',
        className
      )}
    >
      {status}
    </span>
  )
}
