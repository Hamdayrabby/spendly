import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.client";
import { Flame, Loader2 } from "lucide-react";

/**
 * GitHub-style contribution heatmap for daily spending.
 * Each cell = 1 day. Color intensity = spending amount.
 * 52 columns (weeks) × 7 rows (days) = 1 year.
 */
export default function ExpenseHeatmap({ year }) {

  const { data, isLoading } = useQuery({
    queryKey: ["heatmap", year],
    queryFn: async () => {
      const response = await api.get(`/analytics/heatmap?year=${year}`);
      return response.data;
    },
  });

  // Build the 52×7 grid from raw data
  const { grid, maxSpend, totalSpend } = useMemo(() => {
    if (!data?.data) return { grid: [], maxSpend: 0, totalSpend: 0 };

    // Create a lookup map: "2026-01-15" -> 450
    const map = {};
    let max = 0;
    let total = 0;
    data.data.forEach((d) => {
      map[d.date] = d.total;
      if (d.total > max) max = d.total;
      total += d.total;
    });

    // Build weeks array
    const jan1 = new Date(year, 0, 1);
    const dec31 = new Date(year, 11, 31);

    // Start from the Sunday of the week containing Jan 1
    const startDay = new Date(jan1);
    startDay.setDate(startDay.getDate() - startDay.getDay());

    const weeks = [];
    let current = new Date(startDay);

    while (current <= dec31 || weeks.length < 53) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const yStr = current.getFullYear();
        const mStr = String(current.getMonth() + 1).padStart(2, '0');
        const dStr = String(current.getDate()).padStart(2, '0');
        const dateStr = `${yStr}-${mStr}-${dStr}`;
        const isInYear = current.getFullYear() === year;
        week.push({
          date: dateStr,
          value: isInYear ? (map[dateStr] || 0) : -1, // -1 = outside current year
          dayOfWeek: d,
        });
        current.setDate(current.getDate() + 1);
      }
      weeks.push(week);
      if (weeks.length >= 53) break;
    }

    return { grid: weeks, maxSpend: max, totalSpend: total };
  }, [data, year]);

  // Map value to color intensity (4 levels like GitHub)
  const getCellColor = (value) => {
    if (value < 0) return "bg-transparent"; // outside year
    if (value === 0) return "bg-secondary/60";
    if (!maxSpend) return "bg-secondary/60";
    
    const ratio = value / maxSpend;
    if (ratio < 0.25) return "bg-primary/20";
    if (ratio < 0.5) return "bg-primary/40";
    if (ratio < 0.75) return "bg-primary/60";
    return "bg-primary";
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "BDT",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dayLabels = ["", "Mon", "", "Wed", "", "Fri", ""];

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border/50 bg-card/50">
        <div className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Expense Heatmap</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {formatCurrency(totalSpend)} total in {year}
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-flex gap-0.5">
          {/* Day labels column */}
          <div className="flex flex-col gap-0.5 mr-1 pt-5">
            {dayLabels.map((label, i) => (
              <div key={i} className="h-[13px] text-[10px] text-muted-foreground leading-[13px] text-right pr-1">
                {label}
              </div>
            ))}
          </div>

          {/* Week columns */}
          <div>
            {/* Month labels */}
            <div className="flex gap-0.5 mb-1">
              {grid.map((week, weekIdx) => {
                // Show month label on the first week that starts a new month
                const firstDayInYear = week.find((d) => d.value >= 0);
                if (!firstDayInYear) return <div key={weekIdx} className="w-[13px]" />;
                const monthNum = parseInt(firstDayInYear.date.split("-")[1]) - 1;
                const prevWeek = grid[weekIdx - 1];
                const prevMonth = prevWeek
                  ? parseInt((prevWeek.find((d) => d.value >= 0)?.date || "").split("-")[1] || "0") - 1
                  : -1;
                
                return (
                  <div key={weekIdx} className="w-[13px] text-[10px] text-muted-foreground leading-none">
                    {monthNum !== prevMonth ? monthLabels[monthNum] : ""}
                  </div>
                );
              })}
            </div>

            {/* Grid */}
            <div className="flex gap-0.5">
              {grid.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((cell, dayIdx) => (
                    <div
                      key={dayIdx}
                      className={`w-[13px] h-[13px] rounded-sm ${getCellColor(cell.value)} transition-colors`}
                      title={cell.value >= 0 ? `${cell.date}: ${formatCurrency(cell.value)}` : ""}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className="w-[13px] h-[13px] rounded-sm bg-secondary/60" />
        <div className="w-[13px] h-[13px] rounded-sm bg-primary/20" />
        <div className="w-[13px] h-[13px] rounded-sm bg-primary/40" />
        <div className="w-[13px] h-[13px] rounded-sm bg-primary/60" />
        <div className="w-[13px] h-[13px] rounded-sm bg-primary" />
        <span>More</span>
      </div>
    </div>
  );
}
