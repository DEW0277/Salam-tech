import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ShoppingCart, Package, Wallet, Grid3X3,
  Users, UserSquare2, FileText, BrainCircuit, BarChart3,
  Settings, Truck, ShoppingBag, LogOut, X, Scissors
} from "lucide-react";
import { useState } from "react";
import { useGetMe, useLogout } from "@/api-client";
import { setToken } from "@/lib/api";

const BOTTOM_TABS = [
  { href: "/dashboard", label: "Asosiy", icon: LayoutDashboard },
  { href: "/kassa",     label: "Kassa",   icon: ShoppingCart },
  { href: "/inventory", label: "Inventar", icon: Package },
  { href: "/finance",   label: "Moliya",  icon: Wallet },
];

const MORE_ITEMS = [
  { href: "/crm",       label: "Mijozlar (CRM)",       icon: Users },
  { href: "/employees", label: "Xodimlar",             icon: UserSquare2 },
  { href: "/purchases", label: "Xaridlar",             icon: ShoppingBag },
  { href: "/xizmatlar", label: "Xizmatlar",            icon: Scissors },
  { href: "/suppliers", label: "Yetkazib beruvchilar", icon: Truck },
  { href: "/documents", label: "Hujjatlar",            icon: FileText },
  { href: "/reports",   label: "Hisobotlar",           icon: BarChart3 },
  { href: "/ai",        label: "AI Direktor",          icon: BrainCircuit },
  { href: "/settings",  label: "Sozlamalar",           icon: Settings },
];

export function MobileBottomNav() {
  const [location, setLocation] = useLocation();
  const [moreOpen, setMoreOpen] = useState(false);
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();

  const isMoreActive = MORE_ITEMS.some((i) => location === i.href || location.startsWith(i.href));

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { setToken(null); setLocation("/"); }
    });
  };

  return (
    <>
      {/* Overlay for more menu */}
      {moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-40"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setMoreOpen(false)}
        />
      )}

      {/* More menu sheet */}
      <div
        className={`md:hidden fixed bottom-16 left-0 right-0 z-50 transition-all duration-300 ${moreOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0 pointer-events-none"}`}
        style={{
          background: "hsl(230 22% 7%)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          borderRadius: "20px 20px 0 0",
          padding: "16px 16px 8px",
        }}
      >
        {/* User info */}
        <div className="flex items-center gap-3 px-2 py-3 mb-3 rounded-2xl"
          style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
          <div className="h-9 w-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}>
            {(user?.name || "U").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white/90 truncate">{user?.name}</p>
            <p className="text-xs text-indigo-400 font-mono">{user?.companyId || "—"}</p>
          </div>
          <button onClick={() => setMoreOpen(false)}
            className="h-7 w-7 flex items-center justify-center rounded-full text-white/30 hover:text-white/60"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-2 mb-3">
          {MORE_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href || location.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href}
                onClick={() => setMoreOpen(false)}
                className={`flex flex-col items-center gap-1.5 py-3 px-1 rounded-2xl transition-all text-center ${isActive ? "text-white" : "text-white/40 hover:text-white/70"}`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
                  border: "1px solid rgba(99,102,241,0.3)",
                } : {
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}>
                <Icon className={`h-5 w-5 flex-shrink-0 ${isActive ? "text-indigo-400" : ""}`} />
                <span className="text-[10px] font-medium leading-tight">{item.label.split(" ")[0]}</span>
              </Link>
            );
          })}
        </div>

        <button onClick={handleLogout} disabled={logoutMutation.isPending}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-medium text-red-400/80 hover:text-red-400 transition-colors"
          style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.15)" }}>
          <LogOut className="h-4 w-4" />
          Tizimdan chiqish
        </button>
      </div>

      {/* Bottom nav bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch"
        style={{
          background: "rgba(9,9,20,0.95)",
          backdropFilter: "blur(20px)",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          height: "64px",
          paddingBottom: "env(safe-area-inset-bottom)",
        }}>
        {BOTTOM_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = location === tab.href || (tab.href !== "/dashboard" && location.startsWith(tab.href));
          return (
            <Link key={tab.href} href={tab.href}
              className="flex-1 flex flex-col items-center justify-center gap-1 transition-all relative"
              style={{ color: isActive ? "white" : "rgba(255,255,255,0.3)" }}>
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
                  style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
              )}
              <div className={`flex items-center justify-center rounded-xl transition-all ${isActive ? "h-8 w-8" : "h-7 w-7"}`}
                style={isActive ? {
                  background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
                } : {}}>
                <Icon className={`transition-all ${isActive ? "h-5 w-5 text-indigo-400" : "h-4.5 w-4.5"}`} />
              </div>
              <span className={`text-[10px] font-medium transition-all ${isActive ? "text-white" : "text-white/30"}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}

        {/* More tab */}
        <button
          onClick={() => setMoreOpen(!moreOpen)}
          className="flex-1 flex flex-col items-center justify-center gap-1 transition-all relative"
          style={{ color: (isMoreActive || moreOpen) ? "white" : "rgba(255,255,255,0.3)" }}>
          {(isMoreActive || moreOpen) && (
            <span className="absolute top-0 left-1/2 -translate-x-1/2 h-0.5 w-6 rounded-full"
              style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />
          )}
          <div className={`flex items-center justify-center rounded-xl transition-all ${(isMoreActive || moreOpen) ? "h-8 w-8" : "h-7 w-7"}`}
            style={(isMoreActive || moreOpen) ? {
              background: "linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.15))",
            } : {}}>
            <Grid3X3 className={`transition-all ${(isMoreActive || moreOpen) ? "h-5 w-5 text-indigo-400" : "h-4.5 w-4.5"}`} />
          </div>
          <span className={`text-[10px] font-medium ${(isMoreActive || moreOpen) ? "text-white" : "text-white/30"}`}>
            Ko'proq
          </span>
        </button>
      </nav>
    </>
  );
}
