import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.client";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp, Loader2 } from "lucide-react";

const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "BDT",
    maximumFractionDigits: 0,
  }).format(amount);
};

export default function DailySpendingChart({ month, year }) {
  const { data, isLoading } = useQuery({
    queryKey: ["dailySpending", year, month],
    queryFn: async () => {
      const response = await api.get(`/analytics/daily-spending?year=${year}&month=${month}`);
      return response.data;
    },
  });

  // Use the passed month and year to create a date object for the label
  const dateObj = new Date(year, month - 1, 1);
  const monthName = dateObj.toLocaleString("default", { month: "long" });

  if (isLoading) {
    return (
      <div className="p-6 rounded-xl border border-border/50 bg-card/50">
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const chartData = data?.data || [];
  const totalMonth = chartData.reduce((sum, d) => sum + d.total, 0);

  return (
    <div className="p-6 rounded-xl border border-border/50 bg-card/50">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-medium">Daily Spending</h3>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">{monthName} {year}</p>
          <p className="text-sm font-medium">{formatCurrency(totalMonth)} total</p>
        </div>
      </div>

      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `৳${v}`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              formatter={(value) => [formatCurrency(value), "Spent"]}
              labelFormatter={(label) => `Day ${label}`}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              fill="url(#spendGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
