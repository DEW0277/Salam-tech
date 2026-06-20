import { useState, useEffect } from "react";
import { useGetDashboardSummary, useGetRevenueChart, useGetLowStockAlerts } from "@/api-client";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import {
  TrendingUp, TrendingDown, Package, AlertTriangle, Users, Wallet, ShoppingCart,
  ArrowRight, BarChart3, BrainCircuit, FileText, Truck, ShoppingBag, Activity,
  Zap, Target, CheckCircle, ArrowUpRight
} from "lucide-react";
import { useLocation } from "wouter";

const QUICK_LINKS = [
  { href: "/kassa", label: "POS Kassa", sub: "Savdo boshlash", gradient: "from-indigo-600 to-violet-600", Icon: ShoppingCart },
  { href: "/inventory", label: "Inventar", sub: "Mahsulotlar", gradient: "from-violet-600 to-purple-700", Icon: Package },
  { href: "/crm", label: "Mijozlar", sub: "CRM tizimi", gradient: "from-cyan-600 to-teal-600", Icon: Users },
  { href: "/finance", label: "Moliya", sub: "Daromad & xarajat", gradient: "from-amber-600 to-orange-600", Icon: Wallet },
  { href: "/purchases", label: "Xaridlar", sub: "Ta'minot", gradient: "from-emerald-600 to-green-700", Icon: ShoppingBag },
  { href: "/suppliers", label: "Yetkazib beruvchilar", sub: "Hamkorlar", gradient: "from-rose-600 to-pink-700", Icon: Truck },
  { href: "/reports", label: "Hisobotlar", sub: "Tahlil", gradient: "from-blue-600 to-indigo-700", Icon: BarChart3 },
  { href: "/ai", label: "AI Direktor", sub: "Aqlli maslahat", gradient: "from-purple-600 to-fuchsia-700", Icon: BrainCircuit },
];


function KpiCard({ label, value, sub, icon: Icon, color, trend }: {
  label: string; value: string | number; sub: string; icon: any; color: string; trend?: number;
}) {
  return (
    <div className="st-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium" style={{ color: 'var(--st-text-muted)' }}>{label}</p>
        <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${color}20` }}>
          <Icon className="h-4 w-4" style={{ color }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-extrabold" style={{ color: 'var(--st-text)' }}>{value}</p>
        <div className="flex items-center gap-1.5 mt-1">
          {trend !== undefined && (
            <span className={`flex items-center gap-0.5 text-[10px] font-semibold ${trend >= 0 ? 'text-emerald-500' : 'text-red-400'}`}>
              {trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(trend)}%
            </span>
          )}
          <span className="text-[10px]" style={{ color: 'var(--st-text-dim)' }}>{sub}</span>
        </div>
      </div>
    </div>
  );
}

function AIHealthScore({ summary }: { summary: any }) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 300);
  }, []);

  const todayRevenue   = Number(summary?.todayRevenue   ?? 0);
  const monthlyRevenue = Number(summary?.monthlyRevenue  ?? 0);
  const lowStockCount  = Number(summary?.lowStockCount   ?? 0);
  const totalProducts  = Number(summary?.totalProducts   ?? 0);
  const activeEmp      = Number(summary?.activeEmployees ?? 0);
  const profit   = Number(summary?.estimatedProfit ?? 0);

  const clamp = (v: number) => Math.min(99, Math.max(10, Math.round(v)));

  const savdoScore  = clamp(todayRevenue > 0 ? Math.min(99, 65 + todayRevenue / 5000)
                       : monthlyRevenue > 0 ? 55 : 32);
  const inventarScore = totalProducts === 0 ? 40
                       : lowStockCount === 0 ? 95
                       : clamp(100 - (lowStockCount / Math.max(totalProducts, 1)) * 80);
  const mijozScore  = clamp(60 + (totalProducts > 0 ? 12 : 0) + (monthlyRevenue > 100000 ? 10 : 0));
  const moliyaScore = clamp(profit > 0 ? Math.min(99, 68 + profit / 20000)
                       : monthlyRevenue > 0 ? 55 : 38);
  const xodimScore  = activeEmp === 0 ? 42
                       : clamp(55 + Math.min(activeEmp * 6, 40));

  const score = Math.round((savdoScore + inventarScore + mijozScore + moliyaScore + xodimScore) / 5);

  const scoreColor = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";
  const scoreLabel = score >= 80 ? "A'lo" : score >= 70 ? "Yaxshi" : score >= 60 ? "O'rta" : "Past";

  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (animated ? (score / 100) : 0) * circumference;

  const metrics = [
    { label: "Savdo ko'rsatkichi",   score: savdoScore,   color: "#10b981" },
    { label: "Inventar holati",       score: inventarScore, color: "#6366f1" },
    { label: "Mijozlar faolligi",     score: mijozScore,   color: "#f59e0b" },
    { label: "Moliyaviy barqarorlik", score: moliyaScore,  color: "#06b6d4" },
    { label: "Xodimlar samaradorligi",score: xodimScore,   color: "#8b5cf6" },
  ];

  const recommendation = lowStockCount > 0
    ? `Inventarda ${lowStockCount} ta mahsulot minimal chegaragacha yetdi. Tezroq buyurtma bering.`
    : todayRevenue === 0 && monthlyRevenue === 0
    ? "Hali sotuv yo'q. POS Kassadan birinchi savdoni boshlang."
    : activeEmp === 0
    ? "Xodimlar qo'shilmagan. HR bo'limida xodimlarni ro'yxatdan o'tkazing."
    : profit > 0
    ? `Oylik foyda: ${profit.toLocaleString()} so'm. Biznes barqaror ishlayapdi.`
    : "Savdo ko'rsatkichi yaxshi. Mijozlar bazasini kengaytirish tavsiya etiladi.";

  return (
    <div className="rounded-2xl p-5 h-full" style={{ background: 'var(--st-surface)', border: '1px solid rgba(99,102,241,0.15)' }}>
      <div className="flex items-center gap-2 mb-4">
        <BrainCircuit className="h-4 w-4 text-indigo-400" />
        <h3 className="text-sm font-bold" style={{ color: 'var(--st-text)' }}>AI Biznes Holati</h3>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
          Real-vaqt
        </span>
      </div>

      <div className="flex items-center gap-5">
        <div className="relative flex-shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="var(--st-border)" strokeWidth="10" />
            <circle cx="60" cy="60" r="52" fill="none" stroke={scoreColor} strokeWidth="10"
              strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
              transform="rotate(-90 60 60)"
              style={{ transition: 'stroke-dashoffset 1.2s ease-in-out', opacity: 0.85 }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold" style={{ color: 'var(--st-text)' }}>{score}</span>
            <span className="text-[10px] font-semibold" style={{ color: scoreColor }}>{scoreLabel}</span>
          </div>
        </div>

        <div className="flex-1 space-y-2.5 min-w-0">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] truncate" style={{ color: 'var(--st-text-muted)' }}>{m.label}</span>
                <span className="text-[10px] font-bold ml-2 flex-shrink-0" style={{ color: m.color }}>{m.score}</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--st-border)' }}>
                <div className="h-full rounded-full transition-all duration-1000"
                  style={{ width: animated ? `${m.score}%` : '0%', background: m.color, opacity: 0.8 }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 p-3 rounded-xl" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <p className="text-[11px] text-indigo-400">
          <span className="font-semibold">AI tavsiya:</span>{' '}
          <span style={{ color: 'var(--st-text-2)' }}>{recommendation}</span>
        </p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { data: summary, isLoading } = useGetDashboardSummary();
  const { data: chartData } = useGetRevenueChart();
  const { data: lowStock } = useGetLowStockAlerts();

  const revenueChart = Array.isArray(chartData)
    ? chartData.map((d: any) => ({
        ...d,
        revenue: Number(d.revenue),
      }))
    : [];

  return (
    <div className="space-y-5">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Bugungi daromad"
          value={isLoading ? "—" : `${(summary?.todayRevenue ?? 0).toLocaleString()}`}
          sub={`${summary?.totalSalesCount ?? 0} ta sotuv`}
          icon={ShoppingCart} color="#6366f1" trend={12}
        />
        <KpiCard
          label="Oylik daromad"
          value={isLoading ? "—" : `${(summary?.monthlyRevenue ?? 0).toLocaleString()}`}
          sub="joriy oy" icon={TrendingUp} color="#06b6d4" trend={8}
        />
        <KpiCard
          label="Jami mahsulot"
          value={isLoading ? "—" : (summary?.totalProducts ?? 0)}
          sub="inventarda" icon={Package} color="#8b5cf6"
        />
        <KpiCard
          label="Faol xodimlar"
          value={isLoading ? "—" : (summary?.activeEmployees ?? 0)}
          sub="ishda" icon={Users} color="#10b981"
        />
        <KpiCard
          label="Kam qolgan"
          value={isLoading ? "—" : (summary?.lowStockCount ?? 0)}
          sub="mahsulot" icon={AlertTriangle} color="#f59e0b"
        />
        <KpiCard
          label="Foyda taxmini"
          value={isLoading ? "—" : `${(summary?.estimatedProfit ?? 0).toLocaleString()}`}
          sub="jami" icon={Wallet} color="#34d399" trend={5}
        />
      </div>

      {/* AI Health Score + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2">
          <AIHealthScore summary={summary} />
        </div>

        {/* Revenue Chart */}
        <div className="st-card lg:col-span-3 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--st-text)' }}>Daromad dinamikasi</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--st-text-dim)' }}>Oxirgi 6 oy</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full font-medium"
              style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
              So'm
            </span>
          </div>
          {revenueChart.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={revenueChart} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--st-border)" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--st-text-muted)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--st-text-muted)' }} axisLine={false} tickLine={false}
                  tickFormatter={(v) => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v} />
                <Tooltip
                  contentStyle={{
                    background: 'var(--st-surface-2)',
                    border: '1px solid var(--st-border-2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: 'var(--st-text)',
                  }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[180px] flex items-center justify-center">
              <p className="text-sm" style={{ color: 'var(--st-text-dim)' }}>Ma'lumot yo'q</p>
            </div>
          )}
        </div>
      </div>

      {/* Low Stock + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Low Stock Alerts */}
        <div className="st-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--st-text)' }}>Kam qolganlar</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--st-text-dim)' }}>Tezkor diqqat</p>
            </div>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          {!Array.isArray(lowStock) || lowStock.length === 0 ? (
            <div className="h-[140px] flex flex-col items-center justify-center gap-2" style={{ color: 'var(--st-text-dim)' }}>
              <Package className="h-8 w-8" />
              <p className="text-xs">Hamma narsa yetarli</p>
            </div>
          ) : (
            <div className="space-y-2.5 overflow-y-auto max-h-[160px]" style={{ scrollbarWidth: 'none' }}>
              {(lowStock as any[]).slice(0, 8).map((item: any) => (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(245,158,11,0.1)' }}>
                    <Package className="h-3.5 w-3.5 text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: 'var(--st-text-2)' }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: 'var(--st-text-dim)' }}>{item.stockQuantity} {item.unit} qoldi</p>
                  </div>
                  <div className="h-1.5 w-16 rounded-full overflow-hidden flex-shrink-0" style={{ background: 'var(--st-border)' }}>
                    <div className="h-full rounded-full bg-amber-400" style={{ width: `${Math.min(100, (item.stockQuantity / item.lowStockThreshold) * 100)}%`, opacity: 0.7 }} />
                  </div>
                  <span className="text-[10px] font-semibold text-red-400 flex-shrink-0 w-6 text-right">{item.stockQuantity}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => setLocation("/inventory")}
            className="w-full mt-3 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium hover:text-indigo-400 transition-all"
            style={{ color: 'var(--st-text-muted)' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--st-hover)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
            Barchasini ko'rish <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        {/* Recent Activity */}
        <div className="st-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold" style={{ color: 'var(--st-text)' }}>So'nggi faoliyat</h3>
              <p className="text-[11px] mt-0.5" style={{ color: 'var(--st-text-dim)' }}>Bugungi hodisalar</p>
            </div>
            <Activity className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="py-8 text-center">
            <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--st-text-dim)', opacity: 0.3 }} />
            <p className="text-xs font-medium" style={{ color: 'var(--st-text-dim)' }}>Hali faoliyat yo'q</p>
            <p className="text-[10px] mt-0.5" style={{ color: 'var(--st-text-dim)', opacity: 0.6 }}>Sotuv yoki boshqa amal qilganda bu yerda ko'rinadi</p>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="st-card rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold" style={{ color: 'var(--st-text)' }}>Tezkor havolalar</h3>
          <p className="text-[11px]" style={{ color: 'var(--st-text-dim)' }}>Barcha modullar</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-3">
          {QUICK_LINKS.map(({ href, label, sub, gradient, Icon }) => (
            <button key={href} onClick={() => setLocation(href)}
              className="group flex flex-col items-center gap-2.5 p-4 rounded-xl transition-all hover:-translate-y-0.5 hover:shadow-lg text-center st-card"
              onMouseEnter={e => (e.currentTarget.style.background = 'var(--st-hover)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'var(--st-surface)')}>
              <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--st-text-2)' }}>{label}</p>
                <p className="text-[9px] mt-0.5 leading-tight hidden sm:block" style={{ color: 'var(--st-text-muted)' }}>{sub}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
