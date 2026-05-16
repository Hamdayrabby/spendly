import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api.client";
import { useAuth } from "@/context/AuthContext";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet, 
  Activity, 
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  TrendingDown,
  Download
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip as RechartsTooltip 
} from "recharts";
import { motion } from "framer-motion";
import ExpenseHeatmap from "./ExpenseHeatmap";
import DailySpendingChart from "./DailySpendingChart";
import MonthYearPicker from "@/components/ui/MonthYearPicker";

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(amount);
};

// Fallback color palette so the chart never renders as all-grey
const CHART_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#82E0AA",
  "#F0B27A", "#AEB6BF"
];

/**
 * Generates a formatted HTML financial report and triggers a browser download.
 * Uses the data already fetched by the dashboard — no extra API call needed.
 */
function generateReport({ user, month, year, healthScore, insights, categoryChartData, netSavings }) {
  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const monthName = MONTHS[month - 1];
  const savingsRate = healthScore.summary.savingsRate;
  const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "BDT", maximumFractionDigits: 0 }).format(n);

  const insightRows = insights.map(ins => `
    <div class="insight insight-${ins.type}">
      <strong>${ins.title}</strong>
      <p>${ins.message}</p>
    </div>
  `).join("");

  const categoryRows = categoryChartData.map(c => `
    <tr>
      <td><span class="dot" style="background:${c.color}"></span>${c.name}</td>
      <td>${fmt(c.value)}</td>
      <td>${healthScore.summary.expenses > 0 ? ((c.value / healthScore.summary.expenses) * 100).toFixed(1) + "%" : "—"}</td>
    </tr>
  `).join("");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Spendly Report — ${monthName} ${year}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, sans-serif; color: #111; background: #fff; padding: 48px; max-width: 860px; margin: 0 auto; }
    header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 2px solid #111; }
    .brand { display: flex; align-items: center; gap: 10px; }
    .brand-box { width: 32px; height: 32px; background: #111; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .brand-box svg { width: 18px; height: 18px; stroke: #fff; fill: none; stroke-width: 2.5; stroke-linecap: round; stroke-linejoin: round; }
    .brand-name { font-size: 20px; font-weight: 700; letter-spacing: -0.5px; }
    .report-meta { text-align: right; }
    .report-meta h1 { font-size: 22px; font-weight: 700; }
    .report-meta p { font-size: 13px; color: #666; margin-top: 4px; }
    h2 { font-size: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #666; margin: 32px 0 16px; }
    .summary-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }
    .summary-card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; }
    .summary-card .label { font-size: 12px; color: #666; margin-bottom: 8px; }
    .summary-card .value { font-size: 24px; font-weight: 700; }
    .summary-card .sub { font-size: 12px; color: #888; margin-top: 4px; }
    .value.green { color: #059669; } .value.red { color: #dc2626; }
    table { width: 100%; border-collapse: collapse; margin-top: 8px; }
    th { text-align: left; font-size: 12px; font-weight: 600; color: #666; padding: 8px 12px; border-bottom: 1px solid #e5e7eb; }
    td { font-size: 13px; padding: 10px 12px; border-bottom: 1px solid #f3f4f6; vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
    .insight { padding: 14px 16px; border-radius: 10px; margin-bottom: 10px; border-left: 4px solid #d1d5db; background: #f9fafb; }
    .insight strong { font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px; }
    .insight p { font-size: 12px; color: #555; line-height: 1.5; }
    .insight-success { border-color: #059669; background: #f0fdf4; }
    .insight-warning, .insight-alert { border-color: #dc2626; background: #fef2f2; }
    .insight-prediction { border-color: #d97706; background: #fffbeb; }
    footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #999; display: flex; justify-content: space-between; }
    @media print { body { padding: 24px; } }
  </style>
</head>
<body>
  <header>
    <div class="brand">
      <div class="brand-box">
        <svg viewBox="0 0 24 24"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
      </div>
      <span class="brand-name">Spendly</span>
    </div>
    <div class="report-meta">
      <h1>Monthly Financial Report</h1>
      <p>${monthName} ${year} &nbsp;|&nbsp; Generated for ${user?.name || "Account Holder"}</p>
      <p style="margin-top:2px">Generated on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })}</p>
    </div>
  </header>

  <h2>Financial Summary</h2>
  <div class="summary-grid">
    <div class="summary-card">
      <div class="label">Total Income</div>
      <div class="value green">${fmt(healthScore.summary.income)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Total Expenses</div>
      <div class="value red">${fmt(healthScore.summary.expenses)}</div>
    </div>
    <div class="summary-card">
      <div class="label">Net Savings</div>
      <div class="value ${netSavings >= 0 ? "green" : "red"}">${fmt(netSavings)}</div>
      <div class="sub">${savingsRate > 0 ? savingsRate.toFixed(1) + "% savings rate" : "Overspending this month"}</div>
    </div>
  </div>

  <h2>Category Breakdown</h2>
  <table>
    <thead><tr><th>Category</th><th>Amount</th><th>% of Expenses</th></tr></thead>
    <tbody>${categoryRows || '<tr><td colspan="3" style="color:#888;text-align:center;padding:20px">No expense data for this period.</td></tr>'}</tbody>
  </table>

  <h2>Smart Insights</h2>
  ${insightRows || '<p style="color:#888;font-size:13px">No insights generated for this period.</p>'}

  <footer>
    <span>Spendly Personal Finance Dashboard</span>
    <span>This report is for personal reference only.</span>
  </footer>
  <script>
    window.onload = function() {
      setTimeout(() => {
        window.print();
      }, 300);
    }
  </script>
</body>
</html>`;

  const newWin = window.open('', '_blank');
  if (newWin) {
    newWin.document.write(html);
    newWin.document.close();
  } else {
    alert("Please allow popups to generate the PDF report.");
  }
}

export default function Dashboard() {
  const { user } = useAuth();
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboardData", selectedMonth, selectedYear],
    queryFn: async () => {
      const response = await api.get(`/analytics/dashboard?month=${selectedMonth}&year=${selectedYear}`);
      return response.data;
    },
  });

  // Fetch category metadata for colors and labels
  const { data: categoryMetadata } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const response = await api.get("/categories");
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center text-destructive">
        <AlertCircle className="w-12 h-12 mb-4" />
        <h2 className="text-xl font-semibold">Failed to load dashboard</h2>
        <p className="text-muted-foreground mt-2">{error.message}</p>
      </div>
    );
  }

  const { healthScore, insights, categories: breakdown } = data;
  const netSavings = healthScore.summary.income - healthScore.summary.expenses;

  // Prepare data for category breakdown
  // Use categoryMetadata colors if available, otherwise fall back to the palette
  const categoryChartData = (breakdown || []).map((item, idx) => {
    const meta = categoryMetadata?.expense?.find(c => c.key === item._id);
    return {
      name: meta?.label || item._id,
      value: item.value,
      color: meta?.color || CHART_COLORS[idx % CHART_COLORS.length]
    };
  }).filter(item => item.value > 0);

  const totalExpenses = categoryChartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Overview</h1>
          <p className="text-muted-foreground mt-1">Your Spendly financial report.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => generateReport({ user, month: selectedMonth, year: selectedYear, healthScore, insights, categoryChartData, netSavings })}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border border-border/60 bg-card hover:bg-secondary/80 rounded-md transition-colors"
            title="Generate and Print PDF Report"
          >
            <Download className="w-4 h-4" />
            Download Transaction Report
          </button>
          <MonthYearPicker 
            month={selectedMonth} 
            year={selectedYear} 
            onMonthChange={setSelectedMonth} 
            onYearChange={setSelectedYear} 
          />
        </div>
      </div>

      {/* Summary Metrics Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 rounded-xl border border-border/50 bg-card/50"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Income</h3>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(healthScore.summary.income)}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 rounded-xl border border-border/50 bg-card/50"
        >
          <div className="flex flex-row items-center justify-between pb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Expenses</h3>
            <ArrowDownRight className="h-4 w-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold">{formatCurrency(healthScore.summary.expenses)}</div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-6 rounded-xl border border-border/50 bg-card/50 relative overflow-hidden"
        >
          {/* Subtle glow for Net Savings */}
          <div 
            className="absolute -right-4 -top-4 w-24 h-24 pointer-events-none -z-10" 
            style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.2) 0%, transparent 70%)' }}
          />
          
          <div className="flex flex-row items-center justify-between pb-2 relative z-10">
            <h3 className="text-sm font-medium text-muted-foreground">Net Savings</h3>
            <Wallet className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold relative z-10">{formatCurrency(netSavings)}</div>
          <p className="text-xs text-muted-foreground mt-1 relative z-10">
            {healthScore.summary.savingsRate.toFixed(1)}% savings rate
          </p>
        </motion.div>
      </div>

      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Category Breakdown (Takes 3 columns) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-3 p-6 rounded-xl border border-border/50 bg-card/50 flex flex-col relative overflow-hidden"
        >
          <div className="mb-4">
            <h3 className="text-lg font-medium">Category Breakdown</h3>
            <p className="text-sm text-muted-foreground">Expense distribution</p>
          </div>

          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData.length > 0 ? categoryChartData : [{ name: "No data", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={categoryChartData.length > 0 ? 5 : 0}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryChartData.length > 0 ? (
                    categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  ) : (
                    <Cell fill="hsl(var(--secondary))" />
                  )}
                </Pie>
                {categoryChartData.length > 0 && (
                  <RechartsTooltip 
                    contentStyle={{ 
                      background: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value) => [formatCurrency(value), "Spent"]}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {categoryChartData.length > 0 ? (
                <>
                  <span className="text-xs text-muted-foreground">Total</span>
                  <span className="text-base font-bold">{formatCurrency(totalExpenses)}</span>
                </>
              ) : (
                <span className="text-xs text-muted-foreground text-center px-4">No expense data this month</span>
              )}
            </div>
          </div>

          <div className="mt-4 space-y-2 overflow-y-auto max-h-[120px] pr-2 scrollbar-thin">
            {categoryChartData.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Smart Insights Feed (Takes 4 columns) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="md:col-span-4 space-y-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-medium">Smart Insights</h3>
          </div>

          <div className="grid gap-3 h-[400px] overflow-y-auto pr-2 pb-4 scrollbar-thin">
            {insights.length === 0 ? (
              <div className="p-6 rounded-xl border border-border/50 bg-card/30 flex flex-col items-center justify-center text-center h-40">
                <Activity className="w-8 h-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Not enough data to generate insights yet.</p>
              </div>
            ) : (
              insights.map((insight, idx) => {
                let Icon = Lightbulb;
                let bgColor = "bg-card/50";
                let iconColor = "text-primary";
                let borderColor = "border-border/50";

                if (insight.type === "warning" || insight.type === "alert") {
                  Icon = TrendingDown;
                  bgColor = "bg-rose-500/5";
                  iconColor = "text-rose-500";
                  borderColor = "border-rose-500/20";
                } else if (insight.type === "prediction") {
                  Icon = AlertCircle;
                  bgColor = "bg-amber-500/5";
                  iconColor = "text-amber-500";
                  borderColor = "border-amber-500/20";
                } else if (insight.type === "success") {
                  Icon = CheckCircle2;
                  bgColor = "bg-emerald-500/5";
                  iconColor = "text-emerald-500";
                  borderColor = "border-emerald-500/20";
                }

                return (
                  <div 
                    key={idx}
                    className={`p-4 rounded-xl border flex gap-4 items-start ${bgColor} ${borderColor} transition-colors`}
                  >
                    <div className={`mt-0.5 p-2 rounded-full bg-background/50 ${iconColor}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {insight.message}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

      </div>

      {/* Analytics Second Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DailySpendingChart month={selectedMonth} year={selectedYear} />
        <ExpenseHeatmap year={selectedYear} />
      </div>
    </div>
  );
}
