import { useLocation } from "wouter";
import { useSidebar } from "@/contexts/sidebar-context";
import { useGetMe } from "@/api-client";
import { useTheme } from "@/hooks/use-theme";
import {
  PanelLeftClose, PanelLeftOpen, Bell, Search, Plus,
  LayoutDashboard, ShoppingCart, Package, Users, UserSquare2,
  Wallet, FileText, BrainCircuit, BarChart3, Settings, Truck, ShoppingBag,
  Sun, Moon
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

const PAGE_TITLES: Record<string, { label: string; icon: any }> = {
  "/dashboard":  { label: "Bosh sahifa", icon: LayoutDashboard },
  "/kassa":      { label: "POS Kassa", icon: ShoppingCart },
  "/inventory":  { label: "Inventar", icon: Package },
  "/categories": { label: "Kategoriyalar", icon: Package },
  "/crm":        { label: "Mijozlar (CRM)", icon: Users },
  "/employees":  { label: "Xodimlar", icon: UserSquare2 },
  "/finance":    { label: "Moliya", icon: Wallet },
  "/documents":  { label: "Hujjatlar", icon: FileText },
  "/ai":         { label: "AI Direktor", icon: BrainCircuit },
  "/reports":    { label: "Hisobotlar", icon: BarChart3 },
  "/settings":   { label: "Sozlamalar", icon: Settings },
  "/suppliers":  { label: "Yetkazib beruvchilar", icon: Truck },
  "/purchases":  { label: "Xaridlar", icon: ShoppingBag },
};

const QUICK_CREATE: Record<string, string> = {
  "/kassa":     "Yangi savdo",
  "/inventory": "Mahsulot qo'shish",
  "/crm":       "Mijoz qo'shish",
  "/employees": "Xodim qo'shish",
  "/finance":   "Tranzaksiya",
  "/purchases": "Yangi xarid",
  "/suppliers": "Yetkazib beruvchi",
};

const DEMO_NOTIFICATIONS = [
  { id: 1, type: "warning", title: "Kam stok ogohlantirishi", msg: "1 ta mahsulot kam stok darajasida", time: "5 daqiqa" },
  { id: 2, type: "success", title: "Savdo yakunlandi", msg: "Yangi savdo muvaffaqiyatli amalga oshirildi", time: "1 soat" },
  { id: 3, type: "info", title: "AI tahlil tayyor", msg: "Haftalik biznes tahlili yangilandi", time: "2 soat" },
  { id: 4, type: "info", title: "Tizim yangilandi", msg: "SALAM TECH v2.1 muvaffaqiyatli o'rnatildi", time: "1 kun" },
];

export function TopBar() {
  const [location] = useLocation();
  const { collapsed, toggle } = useSidebar();
  const { data: user } = useGetMe();
  const { isDark, toggle: toggleTheme } = useTheme();
  const [searchFocused, setSearchFocused] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotif(false);
      }
    };
    if (showNotif) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showNotif]);

  const pageInfo = PAGE_TITLES[location] || { label: "Sahifa", icon: LayoutDashboard };
  const PageIcon = pageInfo.icon;
  const quickCreate = QUICK_CREATE[location];

  return (
    <div
      className="top-bar-fixed fixed top-0 right-0 z-40 h-14 flex items-center gap-3 px-4 transition-all duration-200"
      style={{
        left: 0,
        background: "var(--top-bar-glass)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--top-bar-border)",
      }}>

      {/* Desktop: sidebar toggle */}
      <button onClick={toggle}
        className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg transition-all flex-shrink-0"
        style={{ color: 'var(--st-text-dim)' }}>
        {collapsed
          ? <PanelLeftOpen className="h-4 w-4" />
          : <PanelLeftClose className="h-4 w-4" />
        }
      </button>

      {/* Mobile: just the logo mark */}
      <div className="md:hidden flex items-center gap-2 flex-shrink-0">
        <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
          <span className="text-white font-extrabold text-[10px]">ST</span>
        </div>
      </div>

      {/* Page title — desktop */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0">
        <PageIcon className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold" style={{ color: 'var(--st-text-muted)' }}>{pageInfo.label}</span>
      </div>

      {/* Page title — mobile (centered) */}
      <div className="md:hidden absolute left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        <PageIcon className="h-4 w-4 text-indigo-400" />
        <span className="text-sm font-semibold" style={{ color: 'var(--st-text-2)' }}>{pageInfo.label}</span>
      </div>

      <div className="hidden md:block h-4 w-px flex-shrink-0" style={{ background: 'var(--st-border)' }} />

      {/* Global search — desktop only */}
      <div className="flex-1 max-w-xs hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: 'var(--st-text-dim)' }} />
          <input
            placeholder="Qidirish..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            className="w-full h-8 pl-9 pr-4 rounded-xl text-xs outline-none transition-all"
            style={{
              color: 'var(--st-text)',
              background: searchFocused ? "rgba(99,102,241,0.1)" : "var(--st-surface)",
              border: `1px solid ${searchFocused ? "rgba(99,102,241,0.35)" : "var(--st-border)"}`,
            }}
          />
        </div>
      </div>

      <div className="flex-1" />

      {/* Quick create — desktop only */}
      {quickCreate && (
        <button className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all border border-white/8">
          <Plus className="h-3.5 w-3.5" />
          {quickCreate}
        </button>
      )}

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        title={isDark ? "Kunduzgi rejim" : "Tungi rejim"}
        className="h-8 w-8 flex items-center justify-center rounded-lg transition-all flex-shrink-0"
        style={{
          color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.40)',
          background: 'transparent',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'var(--st-surface)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button onClick={() => setShowNotif((v) => !v)}
          className="relative h-8 w-8 flex items-center justify-center rounded-lg transition-all"
          style={{
            color: showNotif ? 'var(--st-text)' : 'var(--st-text-dim)',
            background: showNotif ? 'rgba(99,102,241,0.15)' : 'transparent',
          }}>
          <Bell className="h-4 w-4" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-indigo-500"
            style={{ border: '1.5px solid var(--top-bar-glass)' }} />
        </button>

        {showNotif && (
          <div className="absolute right-0 top-10 w-80 rounded-2xl shadow-2xl overflow-hidden z-[60]"
            style={{ background: 'var(--top-bar-glass)', backdropFilter: 'blur(20px)', border: '1px solid var(--st-border-2)' }}>
            <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--st-border)' }}>
              <span className="text-sm font-semibold" style={{ color: 'var(--st-text)' }}>Bildirishnomalar</span>
              <span className="text-[10px] text-indigo-400 cursor-pointer hover:underline"
                onClick={() => setShowNotif(false)}>
                O'qilgan deb belgilash
              </span>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {DEMO_NOTIFICATIONS.map((n) => (
                <div key={n.id} className="flex gap-3 px-4 py-3 cursor-pointer transition-colors"
                  style={{ borderBottom: '1px solid var(--st-border)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--st-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="flex-shrink-0 mt-0.5 h-7 w-7 rounded-xl flex items-center justify-center"
                    style={{
                      background: n.type === 'warning' ? 'rgba(245,158,11,0.15)' :
                        n.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)',
                    }}>
                    <span className="text-xs">{n.type === 'warning' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold" style={{ color: 'var(--st-text-2)' }}>{n.title}</p>
                    <p className="text-[11px] mt-0.5 leading-snug" style={{ color: 'var(--st-text-muted)' }}>{n.msg}</p>
                    <p className="text-[10px] mt-1" style={{ color: 'var(--st-text-faint)' }}>{n.time} oldin</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="px-4 py-3 text-center">
              <span className="text-[11px] text-indigo-400 cursor-pointer hover:underline"
                onClick={() => setShowNotif(false)}>
                Barcha bildirishnomalarni ko'rish →
              </span>
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
        style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
        {(user?.name || "U").charAt(0).toUpperCase()}
      </div>
    </div>
  );
}
