import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  CheckCircle2,
  Ban,
  Users,
  TrendingUp,
  Loader2,
} from "lucide-react";
import type { ReactNode } from "react";
import { adminApi } from "@/lib/admin-api";

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
};

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl p-5" style={cardStyle}>
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center mb-3"
        style={{ background: `${accent}22`, color: accent }}
      >
        {icon}
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-white/45 mt-0.5">{label}</div>
    </div>
  );
}

function formatSom(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} so'm`;
}

const PLAN_LABELS: Record<string, string> = {
  start: "START",
  business: "BIZNES",
  enterprise: "ENTERPRISE",
};

export default function AdminDashboard() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: adminApi.analytics,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div
        className="rounded-2xl p-6 text-sm text-red-300"
        style={cardStyle}
      >
        Ma'lumotni yuklab bo'lmadi:{" "}
        {error instanceof Error ? error.message : "noma'lum xato"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Platforma statistikasi</h1>
        <p className="text-sm text-white/40 mt-0.5">
          Salam Tech ERP'dan foydalanayotgan kompaniyalar bo'yicha umumiy
          ko'rsatkichlar
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Jami kompaniyalar"
          value={String(data.companies.total)}
          accent="#6366f1"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="Faol kompaniyalar"
          value={String(data.companies.active)}
          accent="#22c55e"
        />
        <StatCard
          icon={<Ban className="h-4 w-4" />}
          label="Bloklangan"
          value={String(data.companies.blocked)}
          accent="#ef4444"
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Jami foydalanuvchilar"
          value={String(data.users)}
          accent="#8b5cf6"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Umumiy savdo hajmi"
          value={formatSom(data.sales.volume)}
          accent="#f59e0b"
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Jami savdolar soni"
          value={String(data.sales.count)}
          accent="#06b6d4"
        />
      </div>

      {/* Plan breakdown */}
      <div className="rounded-2xl p-5" style={cardStyle}>
        <h2 className="text-sm font-semibold text-white mb-4">
          Tariflar bo'yicha taqsimot
        </h2>
        {data.plans.length === 0 ? (
          <p className="text-sm text-white/40">Ma'lumot yo'q</p>
        ) : (
          <div className="space-y-3">
            {data.plans.map((p) => {
              const total = data.companies.total || 1;
              const pct = Math.round((p.count / total) * 100);
              return (
                <div key={p.plan}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/70">
                      {PLAN_LABELS[p.plan] ?? p.plan}
                    </span>
                    <span className="text-white/45">
                      {p.count} ta ({pct}%)
                    </span>
                  </div>
                  <div
                    className="h-2 rounded-full overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        background:
                          "linear-gradient(90deg, #6366f1, #8b5cf6)",
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
