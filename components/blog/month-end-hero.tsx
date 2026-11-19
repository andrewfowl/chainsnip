import { cn } from "@/lib/utils"

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

function monthLayout(year: number, month: number) {
  const mondayFirstOffset = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return { mondayFirstOffset, daysInMonth }
}

function MonthCalendar({ year, month }: { year: number; month: number }) {
  const { mondayFirstOffset, daysInMonth } = monthLayout(year, month)

  return (
    <div className="flex flex-col gap-1.5">
      <span className="font-display text-[0.7rem] tracking-wider text-[#f7f6f2] sm:text-sm">{MONTHS[month]}</span>
      <div className="grid grid-cols-7 gap-[2px] sm:gap-[3px]">
        {Array.from({ length: mondayFirstOffset }, (_, i) => (
          <span key={`pad-${i}`} className="aspect-square" />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const isLastDay = i === daysInMonth - 1
          return (
            <span
              key={i}
              className={cn(
                "relative aspect-square rounded-[1px]",
                isLastDay ? "bg-[#f5f28e]" : "border border-[#f7f6f2]/35",
              )}
            >
              {isLastDay && (
                <span className="pointer-events-none absolute -inset-[3px] sm:-inset-1">
                  <span className="absolute left-0 top-0 size-1.5 border-l border-t border-[#f5f28e] sm:size-2" />
                  <span className="absolute right-0 top-0 size-1.5 border-r border-t border-[#f5f28e] sm:size-2" />
                  <span className="absolute bottom-0 left-0 size-1.5 border-b border-l border-[#f5f28e] sm:size-2" />
                  <span className="absolute bottom-0 right-0 size-1.5 border-b border-r border-[#f5f28e] sm:size-2" />
                </span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export function MonthEndHero({
  alt,
  year = 2026,
  className,
  id,
}: {
  alt: string
  year?: number
  className?: string
  id?: string
}) {
  return (
    <div
      id={id}
      role="img"
      aria-label={alt}
      className={cn(
        "flex aspect-[1200/630] w-full items-center gap-[5%] overflow-hidden rounded-xl bg-[#070607] px-[5%]",
        className,
      )}
    >
      <div aria-hidden="true" className="flex w-[42%] flex-col gap-[6%]">
        <p className="font-display text-[clamp(1.5rem,6.2vw,4.75rem)] uppercase leading-[0.95] text-[#f7f6f2]">
          Month-End Snapshots on Schedule
        </p>
        <span className="h-1 w-full bg-[#fc5000]" />
      </div>
      <div aria-hidden="true" className="grid flex-1 grid-cols-4 gap-x-[6%] gap-y-[4%]">
        {MONTHS.map((_, month) => (
          <MonthCalendar key={month} year={year} month={month} />
        ))}
      </div>
    </div>
  )
}
