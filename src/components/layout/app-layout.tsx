import { ReactNode, useEffect, useRef } from "react";
import { Sidebar } from "./sidebar";
import { TopBar } from "./top-bar";
import { MobileBottomNav } from "./mobile-bottom-nav";
import { useLocation } from "wouter";
import { useGetMe } from "@/api-client";
import { SidebarProvider, useSidebar } from "@/contexts/sidebar-context";
import { setToken } from "@/lib/api";

function LayoutInner({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe();
  const { collapsed } = useSidebar();
  const redirectingRef = useRef(false);

  const sidebarWidth = collapsed ? 60 : 220;

  useEffect(() => {
    if (!isLoading && (isError || !user) && !redirectingRef.current) {
      redirectingRef.current = true;
      setToken(null);
      setLocation("/");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, isError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
          <p className="text-sm text-white/40">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div
      className="min-h-screen mesh-bg text-foreground"
      style={{ ["--sidebar-width" as string]: `${sidebarWidth}px` }}>

      <Sidebar />
      <TopBar />

      <main className="app-main-content min-h-screen overflow-y-auto pt-14">
        <div className="p-4 md:p-6 max-w-[1400px]">
          {children}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutInner>{children}</LayoutInner>
    </SidebarProvider>
  );
}
