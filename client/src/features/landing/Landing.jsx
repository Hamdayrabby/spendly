import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { 
  BarChart3, 
  Target, 
  Zap, 
  Wallet,
  Flame,
  LayoutDashboard,
  PieChart,
  Calendar,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Code2,
  Database,
  Layers,
  Cpu,
  Globe
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/ui/Logo";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 }
};

export default function Landing() {
  const { user, loading } = useAuth();
  const currentYear = new Date().getFullYear();

  const techStack = [
    { name: "MongoDB", icon: Database, color: "text-emerald-500", desc: "Document store for flexible financial data with Mongoose schema validation." },
    { name: "Express.js", icon: Layers, color: "text-gray-400", desc: "REST API with per-route middleware, rate limiting, and structured error handling." },
    { name: "React", icon: Cpu, color: "text-blue-400", desc: "Component-driven UI with Tanstack Query for optimistic server state management." },
    { name: "Node.js", icon: Globe, color: "text-green-500", desc: "Async runtime with JWT-based authentication and HTTP-only refresh token cookies." }
  ];

  const features = [
    {
      icon: LayoutDashboard,
      title: "Overview Dashboard",
      desc: "Month-by-month income vs. expense summary with a savings rate metric and category breakdown donut chart.",
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      icon: Flame,
      title: "Expense Heatmap",
      desc: "GitHub-style yearly activity grid. Each cell maps to a day — color intensity represents spend volume.",
      color: "text-orange-400",
      bg: "bg-orange-500/10"
    },
    {
      icon: BarChart3,
      title: "Daily Spending Chart",
      desc: "Smooth area chart of daily expenses per month. Zero-fills missing days so the chart always renders completely.",
      color: "text-purple-400",
      bg: "bg-purple-500/10"
    },
    {
      icon: Zap,
      title: "Smart Insights",
      desc: "Rule-based behavioral analysis: weekend overspending detection, month-over-month spikes, and burn-rate prediction.",
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    },
    {
      icon: Wallet,
      title: "Budget Management",
      desc: "Monthly spending limits per category with real-time progress bars, overspend alerts, and visual risk indicators.",
      color: "text-teal-400",
      bg: "bg-teal-500/10"
    },
    {
      icon: Target,
      title: "Savings Goals",
      desc: "Define a name, target amount, and deadline. Contribute funds incrementally and track percentage completion.",
      color: "text-rose-400",
      bg: "bg-rose-500/10"
    },
    {
      icon: PieChart,
      title: "Category System",
      desc: "12 core expense categories and 5 income categories centralized in a utility shared by validation and UI.",
      color: "text-indigo-400",
      bg: "bg-indigo-500/10"
    },
    {
      icon: Calendar,
      title: "Transaction Log",
      desc: "Paginated, filterable transaction list with search by description, category filter, and date range picker.",
      color: "text-cyan-400",
      bg: "bg-cyan-500/10"
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Navigation ───────────────────── */}
      <nav className="fixed top-0 w-full z-50 border-b border-border/40 bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Logo href="/" />
          <div className="flex items-center gap-3">
            {!loading && (
              user ? (
                <Link to="/dashboard" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Login</Link>
                  <Link to="/register" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 transition-colors">Get Started</Link>
                </>
              )
            )}
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────── */}
      <section className="pt-36 pb-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-widest mb-6 inline-block border border-primary/20">
              Personal Finance Dashboard
            </span>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 leading-[1.05]">
              Know exactly where
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/50 bg-clip-text text-transparent">
                your money goes.
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-base md:text-lg text-muted-foreground leading-relaxed mb-10">
              Spendly combines transaction tracking, budget management, savings goals, and behavioral spending analysis in a clean, unified dashboard.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="w-full sm:w-auto px-7 py-3.5 bg-primary text-primary-foreground rounded-lg text-base font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2 group"
              >
                {user ? "Go to Dashboard" : "Create Free Account"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#features" className="w-full sm:w-auto px-7 py-3.5 border border-border bg-card text-foreground rounded-lg text-base font-semibold hover:bg-secondary/80 transition-all text-center">
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Dashboard Mock Preview */}
          <motion.div
            initial={{ opacity: 0, y: 48 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            className="mt-20"
          >
            <div className="p-1.5 rounded-2xl border border-border/60 bg-card/20 backdrop-blur-sm max-w-4xl mx-auto shadow-2xl shadow-black/20">
              <div className="bg-card/80 rounded-xl border border-border/30 overflow-hidden">
                {/* Fake browser chrome */}
                <div className="flex items-center gap-1.5 px-4 py-3 border-b border-border/30 bg-secondary/30">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <div className="ml-4 h-5 rounded-md bg-secondary/60 w-48" />
                </div>
                <div className="p-5 bg-background/60 grid grid-cols-12 gap-4 min-h-[240px]">
                  {/* Sidebar */}
                  <div className="col-span-2 hidden sm:flex flex-col gap-2">
                    {["Dashboard","Transactions","Budgets","Goals"].map((item, i) => (
                      <div key={item} className={`h-7 rounded-md text-[10px] flex items-center px-2 font-medium ${i === 0 ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}>{item}</div>
                    ))}
                  </div>
                  {/* Main content */}
                  <div className="col-span-12 sm:col-span-10 grid grid-cols-3 gap-3">
                    <div className="bg-card/80 border border-border/40 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2"><span className="text-[10px] text-muted-foreground">Income</span><ArrowUpRight className="w-3 h-3 text-emerald-500" /></div>
                      <div className="text-sm font-bold">৳80,000</div>
                    </div>
                    <div className="bg-card/80 border border-border/40 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2"><span className="text-[10px] text-muted-foreground">Expenses</span><ArrowDownRight className="w-3 h-3 text-rose-500" /></div>
                      <div className="text-sm font-bold">৳52,340</div>
                    </div>
                    <div className="bg-card/80 border border-border/40 rounded-xl p-3">
                      <div className="flex justify-between items-center mb-2"><span className="text-[10px] text-muted-foreground">Saved</span><Wallet className="w-3 h-3 text-primary" /></div>
                      <div className="text-sm font-bold">৳27,660</div>
                    </div>
                    <div className="col-span-2 bg-card/80 border border-border/40 rounded-xl p-3">
                      <p className="text-[10px] font-medium text-muted-foreground mb-2">Category Spending</p>
                      {[{ label: "Food & Dining", pct: 62, c: "bg-rose-500" },{ label: "Transport", pct: 30, c: "bg-teal-500" },{ label: "Shopping", pct: 48, c: "bg-purple-500" }].map(it => (
                        <div key={it.label} className="mb-1.5">
                          <div className="flex justify-between text-[9px] text-muted-foreground mb-0.5"><span>{it.label}</span><span>{it.pct}%</span></div>
                          <div className="h-1 bg-secondary rounded-full"><div className={`h-full ${it.c} rounded-full`} style={{ width: `${it.pct}%` }} /></div>
                        </div>
                      ))}
                    </div>
                    <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
                      <Zap className="w-3 h-3 text-amber-500 mb-1.5" />
                      <p className="text-[9px] font-semibold text-amber-500 mb-1">Budget Risk</p>
                      <p className="text-[9px] text-muted-foreground leading-relaxed">Food budget will be exceeded by ৳3,200 at current rate.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Features Grid ────────────────── */}
      <section id="features" className="py-24 border-t border-border/30 bg-secondary/10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div {...reveal}>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Features</span>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Everything you need. Nothing you don't.</h2>
              <p className="text-muted-foreground max-w-md mx-auto">Built with a focus on real financial signal over vanity metrics.</p>
            </motion.div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.06 }}
                className="p-5 rounded-xl border border-border/50 bg-card hover:border-primary/30 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-4 ${feature.color}`}>
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold mb-2">{feature.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ───────────────────── */}
      <section className="py-24 border-t border-border/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <motion.div {...reveal}>
              <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">Stack</span>
              <h2 className="text-3xl font-bold tracking-tight mb-3">Built on Modern Architecture</h2>
              <p className="text-muted-foreground">A full-stack MERN application with production-grade security and query patterns.</p>
            </motion.div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {techStack.map((tech, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.07 }}
                className="flex flex-col items-center text-center p-6 rounded-xl bg-card border border-border/40 hover:border-primary/30 transition-colors"
              >
                <tech.icon className={`w-10 h-10 ${tech.color} mb-4`} />
                <h4 className="text-base font-bold mb-2">{tech.name}</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">{tech.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Library tags */}
          <motion.div {...reveal} className="border border-border/30 rounded-xl p-6 bg-card/30">
            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-5 text-center">Supporting Libraries</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                "Framer Motion","Recharts","Tanstack Query","React Hook Form",
                "Zod","bcrypt","JWT","TailwindCSS","react-datepicker","Helmet.js","Morgan","Mongoose"
              ].map(lib => (
                <span key={lib} className="px-3 py-1.5 rounded-md bg-secondary text-secondary-foreground text-xs font-medium border border-border/30">
                  {lib}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────── */}
      <section className="py-24 border-t border-border/30 bg-secondary/10">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <motion.div {...reveal}>
            <CheckCircle2 className="w-10 h-10 text-primary mx-auto mb-6" strokeWidth={1.5} />
            <h2 className="text-3xl font-bold mb-4 tracking-tight">Ready to take control?</h2>
            <p className="text-muted-foreground mb-8">Create an account and see the full dashboard in action, or clone the repo and run it locally.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={user ? "/dashboard" : "/register"}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg text-base font-semibold hover:bg-primary/90 transition-all group"
              >
                {user ? "Go to Dashboard" : "Get Started Free"}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://github.com/Hamdayrabby/spendly"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 border border-border bg-card rounded-lg text-base font-semibold hover:bg-secondary/80 transition-all"
              >
                <Code2 className="w-4 h-4" />
                View on GitHub
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ───────────────────────── */}
      <footer className="py-10 border-t border-border/30 bg-card/20">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <Logo href="/" size="sm" asLink={false} />
          <p className="text-xs text-muted-foreground">© {currentYear} Spendly — A personal finance project by Hamdayrabby.</p>
          <div className="flex gap-5">
            <Link to="/login" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Login</Link>
            <Link to="/register" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Register</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
