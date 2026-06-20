import { ReactNode, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { LayoutDashboard, Building2, LogOut, Loader2 } from "lucide-react";
import { fetchMe } from "@/lib/admin-api";
import { setToken } from "@/lib/api";

/**
 * Layout + access gate for the super-admin area (`/admin/*`).
 *
 * Fetches the current user; only `role === "super_admin"` may stay.
 * - not logged in / token invalid -> /login
 * - logged in but not super admin -> /dashboard
 */
export function AdminLayout({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();

  const meQuery = useQuery({
    queryKey: ["admin-me"],
    queryFn: fetchMe,
    retry: false,
  });

  const isError = meQuery.isError;
  const me = meQuery.data;
  const wrongRole = me != null && me.role !== "super_admin";

  useEffect(() => {
    if (isError) {
      setLocation("/login");
    } else if (wrongRole) {
      setLocation("/dashboard");
    }
  }, [isError, wrongRole, setLocation]);

  if (meQuery.isLoading) {
    return (
      <div className="min-h-screen mesh-bg grid-bg flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (isError || wrongRole || !me) {
    // Redirect is in-flight; render nothing.
    return null;
  }

  const handleLogout = () => {
    setToken(null);
    setLocation("/login");
  };

  const navItem = (href: string, label: string, icon: ReactNode) => {
    const active =
      href === "/admin"
        ? location === "/admin"
        : location.startsWith(href);
    return (
      <Link
        href={href}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: active ? "rgba(99,102,241,0.15)" : "transparent",
          color: active ? "#818cf8" : "var(--st-text-muted)",
        }}
      >
        {icon}
        {label}
      </Link>
    );
  };

  return (
    <div className="app-main-content min-h-screen mesh-bg grid-bg">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />

      {/* Header */}
      <header
        className="relative z-10 flex items-center justify-between px-6 py-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              boxShadow: "0 0 20px rgba(99,102,241,0.4)",
            }}
          >
            <span className="text-white font-extrabold text-xs">ST</span>
          </div>
          <div>
            <div className="text-sm font-bold text-white leading-tight">
              Salam Tech
            </div>
            <div className="text-xs text-white/40 leading-tight">
              Boshqaruv paneli
            </div>
          </div>
        </div>

        <nav className="hidden sm:flex items-center gap-1">
          {navItem(
            "/admin",
            "Statistika",
            <LayoutDashboard className="h-4 w-4" />,
          )}
          {navItem(
            "/admin/companies",
            "Kompaniyalar",
            <Building2 className="h-4 w-4" />,
          )}
        </nav>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white transition-colors"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Chiqish</span>
        </button>
      </header>

      {/* Mobile nav */}
      <nav
        className="sm:hidden relative z-10 flex items-center gap-1 px-4 py-2"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        {navItem("/admin", "Statistika", <LayoutDashboard className="h-4 w-4" />)}
        {navItem(
          "/admin/companies",
          "Kompaniyalar",
          <Building2 className="h-4 w-4" />,
        )}
      </nav>

      <main className="relative z-10 px-4 sm:px-6 py-6 max-w-6xl mx-auto">
        {children}
      </main>
    </div>
  );
}
