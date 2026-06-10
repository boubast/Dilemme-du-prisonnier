import { cn } from "@/lib/utils"

interface PayoffInputProps {
  label: string
  sublabel: string
  value: number
  onChange: (v: number) => void
}

export function PayoffInput({
  label,
  sublabel,
  value,
  onChange,
}: PayoffInputProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-foreground">{label}</label>
      <div className="relative flex items-center">
        <input
          type="number"
          value={value}
          min={-10}
          max={20}
          onChange={(e) => onChange(Number(e.target.value))}
          className={cn(
            "w-full rounded-md border border-input bg-background px-2.5 py-1.5 pr-7 text-sm font-mono",
            "focus:outline-none focus:ring-2 focus:ring-ring/50 focus:border-ring",
            "transition-colors [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
          )}
        />
        <div className="absolute right-0 top-0 flex h-full flex-col border-l border-input">
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onChange(value + 1)}
            className="flex flex-1 items-center justify-center px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-tr-md text-[10px] cursor-pointer"
          >
            ▲
          </button>
          <button
            type="button"
            tabIndex={-1}
            onClick={() => onChange(value - 1)}
            className="flex flex-1 items-center justify-center px-1.5 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-br-md border-t border-input text-[10px] cursor-pointer"
          >
            ▼
          </button>
        </div>
      </div>
      <p className="text-[11px] text-muted-foreground">{sublabel}</p>
    </div>
  )
}
