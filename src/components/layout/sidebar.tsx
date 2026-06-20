import { Link, useLocation } from "wouter";
import {
  LayoutDashboard, ShoppingCart, Package, Users, UserSquare2, Wallet,
  FileText, BrainCircuit, BarChart3, Settings, LogOut, Truck,
  ShoppingBag, ChevronRight, Scissors, Tags
} from "lucide-react";
import { useGetMe, useLogout } from "@/api-client";
import { setToken } from "@/lib/api";
import { useSidebar } from "@/contexts/sidebar-context";
import { cn } from "@/lib/utils";

const NAV_GROUPS = [
  {
    label: "Asosiy",
    items: [
      { href: "/dashboard", label: "Bosh sahifa", icon: LayoutDashboard },
    ],
  },
  {
    label: "Savdo",
    items: [
      { href: "/kassa", label: "POS Kassa", icon: ShoppingCart },
      { href: "/crm", label: "Mijozlar", icon: Users },
      { href: "/purchases", label: "Xaridlar", icon: ShoppingBag },
      { href: "/xizmatlar", label: "Xizmatlar", icon: Scissors },
    ],
  },
  {
    label: "Inventar",
    items: [
      { href: "/inventory", label: "Mahsulotlar", icon: Package },
      { href: "/categories", label: "Kategoriyalar", icon: Tags },
      { href: "/suppliers", label: "Yetkazib beruvchilar", icon: Truck },
    ],
  },
  {
    label: "Moliya & HR",
    items: [
      { href: "/finance", label: "Moliya", icon: Wallet },
      { href: "/employees", label: "Xodimlar", icon: UserSquare2 },
      { href: "/documents", label: "Hujjatlar", icon: FileText },
    ],
  },
  {
    label: "Tahlil",
    items: [
      { href: "/reports", label: "Hisobotlar", icon: BarChart3 },
      { href: "/ai", label: "AI Direktor", icon: BrainCircuit },
    ],
  },
  {
    label: "Tizim",
    items: [
      { href: "/settings", label: "Sozlamalar", icon: Settings },
    ],
  },
];

const planLabels: Record<string, string> = {
  start: "Basic",
  business: "Business",
  enterprise: "Enterprise",
};

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const logoutMutation = useLogout();
  const { collapsed } = useSidebar();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => { setToken(null); setLocation("/"); }
    });
  };

  const renderNavContent = (isMobile = false) => {
    const isCollapsed = !isMobile && collapsed;

    return (
      <div className="flex flex-col h-full overflow-hidden" style={{ background: 'var(--sidebar-glass)' }}>
        {/* Logo */}
        <div className={cn("flex items-center h-14 flex-shrink-0",
          isCollapsed ? "px-3 justify-center" : "px-4 gap-3")}
          style={{ borderBottom: '1px solid var(--st-border)' }}>
          <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <span className="text-white font-extrabold text-[10px]">ST</span>
          </div>
          {!isCollapsed && (
            <div className="min-w-0">
              <p className="text-sm font-bold leading-tight" style={{ color: 'var(--st-text)' }}>Salam Tech</p>
              <p className="text-[9px] uppercase tracking-widest" style={{ color: 'var(--st-text-faint)' }}>Business OS</p>
            </div>
          )}
        </div>

        {/* Company info (only expanded) */}
        {!isCollapsed && user && (
          <div className="px-3 py-2.5 flex-shrink-0" style={{ borderBottom: '1px solid var(--st-border)' }}>
            <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <p className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: 'var(--st-text-faint)' }}>Kompaniya</p>
              <p className="text-xs font-semibold truncate" style={{ color: 'var(--st-text-2)' }}>{user.businessName}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] font-mono text-indigo-400">{user.companyId || "—"}</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full"
                  style={{ background: 'var(--st-border)', color: 'var(--st-text-muted)' }}>
                  {planLabels[user.subscriptionPlan] || user.subscriptionPlan}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Nav groups */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4" style={{ scrollbarWidth: 'none' }}>
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!isCollapsed && (
                <p className="text-[9px] font-semibold uppercase tracking-widest px-2 mb-1"
                  style={{ color: 'var(--st-text-faint)' }}>
                  {group.label}
                </p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = location === item.href || (item.href !== "/dashboard" && location.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link key={item.href} href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={cn(
                        "group flex items-center rounded-xl transition-all duration-150 text-sm font-medium relative",
                        isCollapsed ? "justify-center h-9 w-9 mx-auto" : "gap-3 px-3 py-2.5",
                      )}
                      style={isActive ? {
                        background: 'linear-gradient(90deg, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0.04) 100%)',
                        borderLeft: isCollapsed ? 'none' : '2px solid rgba(99,102,241,0.8)',
                        color: 'var(--st-text)',
                      } : { color: 'var(--st-text-muted)' }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'var(--st-hover)'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}>
                      <Icon className={cn("flex-shrink-0", isCollapsed ? "h-4.5 w-4.5" : "h-4 w-4",
                        isActive ? "text-indigo-400" : "")} />
                      {!isCollapsed && <span className="flex-1">{item.label}</span>}
                      {!isCollapsed && isActive && <ChevronRight className="h-3 w-3 text-indigo-400/60" />}
                    </Link>
                  );
                })}
              </div>
              {isCollapsed && <div className="h-px mt-2" style={{ background: 'var(--st-border)' }} />}
            </div>
          ))}
        </div>

        {/* User */}
        <div className={cn("flex-shrink-0", isCollapsed ? "p-2" : "p-3")}
          style={{ borderTop: '1px solid var(--st-border)' }}>
          {!isCollapsed ? (
            <>
              <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl transition-colors cursor-default mb-1"
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--st-hover)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  {(user?.name || "U").charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate" style={{ color: 'var(--st-text-2)' }}>{user?.name}</p>
                  <p className="text-[9px] truncate" style={{ color: 'var(--st-text-faint)' }}>{user?.email}</p>
                </div>
                <div className="h-1.5 w-1.5 rounded-full bg-green-400 flex-shrink-0" />
              </div>
              <button onClick={handleLogout} disabled={logoutMutation.isPending}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs hover:text-red-400 hover:bg-red-500/8 transition-all font-medium"
                style={{ color: 'var(--st-text-muted)' }}>
                <LogOut className="h-3.5 w-3.5" />
                Chiqish
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <button onClick={handleLogout} title="Chiqish"
                className="h-7 w-7 flex items-center justify-center rounded-lg hover:text-red-400 hover:bg-red-500/10 transition-all"
                style={{ color: 'var(--st-text-muted)' }}>
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[220px]";

  return (
    <div className={cn("hidden md:flex h-screen flex-col fixed inset-y-0 z-50 transition-all duration-200", sidebarWidth)}
      style={{ borderRight: '1px solid rgba(255,255,255,0.05)' }}>
      {renderNavContent(false)}
    </div>
  );
}
