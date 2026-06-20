import { useState } from "react";
import { useGetDashboardSummary, useGetRevenueChart, useGetTopProducts, useGetTopCustomers } from "@/api-client";
import { BarChart, Bar, AreaChart, Area, ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, CartesianGrid, PieChart, Pie, Cell } from "recharts";
import {
  BarChart3, TrendingUp, Users, Package, ShoppingCart, Download, FileText,
  ArrowUpRight, DollarSign, Printer, ChevronDown, Calendar
} from "lucide-react";

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };

const CHART_COLORS = {
  revenue: "#10b981",
  expense: "#ef4444",
  profit: "#6366f1",
  area: "rgba(99,102,241,0.3)",
};

const PERIOD_OPTIONS = ["Bu hafta", "Bu oy", "Bu yil", "Barcha vaqt"];


function exportCSV(data: any[], filename: string) {
  if (!data?.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(","), ...data.map(r => keys.map(k => `"${r[k]}"`).join(","))];
  const blob = new Blob([rows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a"); a.href = url; a.download = filename + ".csv"; a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const [period, setPeriod] = useState("Bu oy");
  const [showPeriodMenu, setShowPeriodMenu] = useState(false);

  const { data: summary, isLoading: loadingSum } = useGetDashboardSummary();
  const { data: chartData, isLoading: loadingChart } = useGetRevenueChart();
  const { data: topProducts, isLoading: loadingProducts } = useGetTopProducts();
  const { data: topCustomers, isLoading: loadingCustomers } = useGetTopCustomers();

  const handlePrint = () => window.print();

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Hisobotlar</h1>
          <p className="text-xs text-white/30 mt-0.5">Savdo, moliya va xodimlar tahlili</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period picker */}
          <div className="relative">
            <button
              onClick={() => setShowPeriodMenu(!showPeriodMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Calendar className="h-3.5 w-3.5" />
              {period}
              <ChevronDown className="h-3 w-3" />
            </button>
            {showPeriodMenu && (
              <div className="absolute right-0 top-full mt-1 z-50 py-1 rounded-xl overflow-hidden min-w-[140px]"
                style={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
                {PERIOD_OPTIONS.map(opt => (
                  <button key={opt} onClick={() => { setPeriod(opt); setShowPeriodMenu(false); }}
                    className="w-full px-4 py-2 text-left text-sm transition-colors hover:bg-white/5"
                    style={{ color: period === opt ? '#818cf8' : 'rgba(255,255,255,0.55)' }}>
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export CSV */}
          <button
            onClick={() => exportCSV(topProducts || [], "top_mahsulotlar")}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Download className="h-3.5 w-3.5" />
            CSV
          </button>

          {/* Print/PDF */}
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-white/60 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <Printer className="h-3.5 w-3.5" />
            PDF
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Jami mijozlar", icon: Users, value: summary?.totalCustomers ?? "—", color: "#6366f1", trend: "+5%" },
          { label: "Savdolar soni", icon: ShoppingCart, value: summary?.totalSalesCount ?? "—", color: "#10b981", trend: "+12%" },
          { label: "Kutilayotgan foyda", icon: TrendingUp, value: loadingSum ? "—" : `${(summary?.estimatedProfit || 0).toLocaleString()}`, color: "#8b5cf6", trend: "+8%" },
          { label: "Faol xodimlar", icon: Users, value: summary?.activeEmployees ?? "—", color: "#f59e0b", trend: "0%" },
        ].map(({ label, icon: Icon, value, color, trend }) => (
          <div key={label} className="rounded-2xl p-4 space-y-3" style={card}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/40">{label}</p>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{value} {typeof value === "number" && value > 10000 ? <span className="text-xs font-normal text-white/30">so'm</span> : null}</p>
              <div className="flex items-center gap-1 mt-1">
                <ArrowUpRight className="h-3 w-3 text-emerald-400" />
                <span className="text-[10px] text-emerald-400">{trend}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white/80">Daromad va xarajat</h3>
            <p className="text-[11px] text-white/30 mt-0.5">Oylik taqqoslama hisobot</p>
          </div>
          <div className="flex items-center gap-4 text-[10px] text-white/40">
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Daromad</span>
            <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-red-500" />Xarajat</span>
          </div>
        </div>
        <div className="p-4">
          {loadingChart ? (
            <div className="h-64 flex items-center justify-center text-white/20 text-sm">Yuklanmoqda...</div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData || []} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="month" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`} />
                  <RTooltip
                    contentStyle={{ background: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: 'white', fontSize: 12 }}
                    formatter={(value: any) => [`${Number(value).toLocaleString()} so'm`]}
                  />
                  <Bar dataKey="revenue" name="Daromad" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.85} />
                  <Bar dataKey="expenses" name="Xarajat" fill="#ef4444" radius={[4, 4, 0, 0]} opacity={0.75} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Two column: top customers + top products */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Top Customers */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/80">Top mijozlar</h3>
              <p className="text-[11px] text-white/30">Xarid hajmi bo'yicha</p>
            </div>
            <button onClick={() => exportCSV(topCustomers || [], "top_mijozlar")}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {loadingCustomers ? (
              <div className="py-8 text-center text-sm text-white/25">Yuklanmoqda...</div>
            ) : !topCustomers?.length ? (
              <div className="py-8 text-center text-sm text-white/25">Ma'lumot yo'q</div>
            ) : (
              topCustomers.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                  <span className="text-[11px] font-bold w-4 flex-shrink-0" style={{ color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}>
                    {i + 1}
                  </span>
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                    {c.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{c.name}</p>
                    <p className="text-[10px] text-white/35">{c.purchaseCount} ta xarid</p>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 flex-shrink-0">
                    {(c.totalPurchases / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Top Products */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-white/80">Top mahsulotlar</h3>
              <p className="text-[11px] text-white/30">Daromad bo'yicha</p>
            </div>
            <button onClick={() => exportCSV(topProducts || [], "top_mahsulotlar")}
              className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
              <Download className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="divide-y divide-white/5">
            {loadingProducts ? (
              <div className="py-8 text-center text-sm text-white/25">Yuklanmoqda...</div>
            ) : !topProducts?.length ? (
              <div className="py-8 text-center text-sm text-white/25">Ma'lumot yo'q</div>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                  <span className="text-[11px] font-bold w-4 flex-shrink-0" style={{ color: i < 3 ? '#f59e0b' : 'rgba(255,255,255,0.2)' }}>
                    {i + 1}
                  </span>
                  <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(16,185,129,0.12)' }}>
                    <Package className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{p.name}</p>
                    <p className="text-[10px] text-white/35">{p.soldCount} ta sotildi</p>
                  </div>
                  <span className="text-sm font-bold text-indigo-400 flex-shrink-0">
                    {(p.revenue / 1000000).toFixed(1)}M
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Category split + Employee KPI */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Category pie */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white/80">Kategoriyalar bo'yicha savdo</h3>
            <p className="text-[11px] text-white/30">Ulush (%)</p>
          </div>
          <div className="py-12 text-center">
            <BarChart3 className="h-10 w-10 mx-auto text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/35">Ma'lumot yo'q</p>
            <p className="text-xs text-white/20 mt-1">Sotuv qilinganidan keyin diagramma ko'rinadi</p>
          </div>
        </div>

        {/* Employee KPI */}
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="p-4 border-b border-white/5">
            <h3 className="text-sm font-semibold text-white/80">Xodimlar KPI</h3>
            <p className="text-[11px] text-white/30">Savdo plani bajarish (%)</p>
          </div>
          <div className="py-12 text-center">
            <Users className="h-10 w-10 mx-auto text-white/10 mb-3" />
            <p className="text-sm font-medium text-white/35">KPI ma'lumotlari yo'q</p>
            <p className="text-xs text-white/20 mt-1">Xodimlar sotuvlari kirilgandan keyin ko'rinadi</p>
          </div>
        </div>
      </div>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: white !important; color: black !important; }
          .no-print { display: none !important; }
        }
      `}</style>
    </div>
  );
}
