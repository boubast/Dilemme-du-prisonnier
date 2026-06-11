import type { Couts } from "@/type"

interface PayoffMatrixProps {
  payoffs: Couts
}

const COLOR_LINE = "#a6a6a6"

export function PayoffMatrix({ payoffs }: PayoffMatrixProps) {
  return (
    <div className="flex flex-col gap-2">
      <table className="w-full border-collapse border border-border text-center text-sm select-none">
        <thead>
          <tr>
            {/* Top-left cell with diagonal split */}
            <th className="relative h-10 w-24 border border-border p-0 font-medium">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  className="stroke-border"
                  strokeWidth="0.5"
                  style={{ stroke: COLOR_LINE }}
                />
              </svg>
              <span className="dark:text-blue-450 absolute top-1.5 right-2 font-bold text-blue-600">
                B
              </span>
              <span className="absolute bottom-1.5 left-2 font-bold text-emerald-600 dark:text-emerald-500">
                A
              </span>
            </th>
            <th className="w-24 border border-border px-1 py-1.5 font-semibold">
              B coopère
            </th>
            <th className="w-24 border border-border px-1 py-1.5 font-semibold">
              B trahit
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="h-12 w-24 border border-border px-1 py-2 font-semibold">
              A coopère
            </td>
            {/* Cell A coopère, B coopère (R, R) */}
            <td className="relative h-12 border border-border bg-card p-0">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  className="stroke-border"
                  strokeWidth="0.5"
                  style={{ stroke: COLOR_LINE }}
                />
              </svg>
              <span className="dark:text-blue-450 absolute top-1 right-2.5 font-mono font-bold text-blue-600">
                {payoffs.recompense}
              </span>
              <span className="absolute bottom-1 left-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-500">
                {payoffs.recompense}
              </span>
            </td>
            {/* Cell A coopère, B trahit (S, T) */}
            <td className="relative h-12 border border-border bg-card p-0">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  className="stroke-border"
                  strokeWidth="0.5"
                  style={{ stroke: COLOR_LINE }}
                />
              </svg>
              <span className="dark:text-blue-450 absolute top-1 right-2.5 font-mono font-bold text-blue-600">
                {payoffs.tentation}
              </span>
              <span className="absolute bottom-1 left-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-500">
                {payoffs.dupe}
              </span>
            </td>
          </tr>
          <tr>
            <td className="h-12 w-24 border border-border px-1 py-2 font-semibold">
              A trahit
            </td>
            {/* Cell A trahit, B coopère (T, S) */}
            <td className="relative h-12 border border-border bg-card p-0">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  className="stroke-border"
                  strokeWidth="0.5"
                  style={{ stroke: COLOR_LINE }}
                />
              </svg>
              <span className="dark:text-blue-450 absolute top-1 right-2.5 font-mono font-bold text-blue-600">
                {payoffs.dupe}
              </span>
              <span className="absolute bottom-1 left-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-500">
                {payoffs.tentation}
              </span>
            </td>
            {/* Cell A trahit, B trahit (P, P) */}
            <td className="relative h-12 border border-border bg-card p-0">
              <svg
                className="pointer-events-none absolute inset-0 h-full w-full"
                preserveAspectRatio="none"
                viewBox="0 0 100 100"
              >
                <line
                  x1="0"
                  y1="0"
                  x2="100"
                  y2="100"
                  className="stroke-border"
                  strokeWidth="0.5"
                  style={{ stroke: COLOR_LINE }}
                />
              </svg>
              <span className="dark:text-blue-450 absolute top-1 right-2.5 font-mono font-bold text-blue-600">
                {payoffs.punition}
              </span>
              <span className="absolute bottom-1 left-2.5 font-mono font-bold text-emerald-600 dark:text-emerald-500">
                {payoffs.punition}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}
