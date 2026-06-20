import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import {
  Loader2,
  ChevronLeft,
  Ban,
  CheckCircle2,
  Users,
  Package,
  ShoppingCart,
  UserCircle,
} from "lucide-react";
import type { ReactNode } from "react";
import { adminApi, type CompanyDetail } from "@/lib/admin-api";

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
};

function formatSom(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")} so'm`;
}

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl p-4" style={cardStyle}>
      <div className="flex items-center gap-2 text-white/40 text-xs mb-2">
        {icon}
        {label}
      </div>
      <div className="text-lg font-bold text-white">{value}</div>
    </div>
  );
}

export default function AdminCompanyDetail({ id }: { id: string }) {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-company", id],
    queryFn: () => adminApi.company(id),
    retry: false,
  });

  const blockMutation = useMutation({
    mutationFn: (c: CompanyDetail) =>
      c.isBlocked ? adminApi.unblock(c.id) : adminApi.block(c.id),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-company", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
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
      <div className="space-y-4">
        <Link
          href="/admin/companies"
          className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70"
        >
          <ChevronLeft className="h-4 w-4" /> Kompaniyalar
        </Link>
        <div
          className="rounded-2xl p-6 text-sm text-red-300"
          style={cardStyle}
        >
          Kompaniya yuklanmadi:{" "}
          {error instanceof Error ? error.message : "noma'lum xato"}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link
        href="/admin/companies"
        className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"
      >
        <ChevronLeft className="h-4 w-4" /> Kompaniyalar
      </Link>

      {/* Header */}
      <div
        className="rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        style={cardStyle}
      >
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">{data.name}</h1>
            {data.isBlocked ? (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
                style={{
                  background: "rgba(239,68,68,0.15)",
                  color: "#f87171",
                }}
              >
                <Ban className="h-3 w-3" /> Bloklangan
              </span>
            ) : (
              <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs"
                style={{
                  background: "rgba(34,197,94,0.15)",
                  color: "#34d399",
                }}
              >
                <CheckCircle2 className="h-3 w-3" /> Faol
              </span>
            )}
          </div>
          <div className="text-xs text-white/35 font-mono mt-1">
            {data.id} · Tarif: {data.subscriptionPlan.toUpperCase()}
          </div>
        </div>

        <button
          onClick={() => blockMutation.mutate(data)}
          disabled={blockMutation.isPending}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-sm transition-colors disabled:opacity-50"
          style={{
            background: data.isBlocked
              ? "rgba(34,197,94,0.15)"
              : "rgba(239,68,68,0.12)",
            color: data.isBlocked ? "#34d399" : "#f87171",
          }}
        >
          {blockMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : data.isBlocked ? (
            <>
              <CheckCircle2 className="h-4 w-4" /> Blokni ochish
            </>
          ) : (
            <>
              <Ban className="h-4 w-4" /> Kompaniyani bloklash
            </>
          )}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MiniStat
          icon={<Users className="h-3.5 w-3.5" />}
          label="Foydalanuvchilar"
          value={String(data.stats.users)}
        />
        <MiniStat
          icon={<Package className="h-3.5 w-3.5" />}
          label="Mahsulotlar"
          value={String(data.stats.products)}
        />
        <MiniStat
          icon={<ShoppingCart className="h-3.5 w-3.5" />}
          label="Savdolar"
          value={String(data.stats.salesCount)}
        />
        <MiniStat
          icon={<UserCircle className="h-3.5 w-3.5" />}
          label="Mijozlar"
          value={String(data.stats.customers)}
        />
      </div>

      <div className="rounded-2xl p-5" style={cardStyle}>
        <div className="text-xs text-white/40 mb-1">Umumiy savdo hajmi</div>
        <div className="text-2xl font-bold text-white">
          {formatSom(data.stats.salesTotal)}
        </div>
      </div>

      {/* Users */}
      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        <div
          className="px-5 py-3 text-sm font-semibold text-white"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          Foydalanuvchilar ({data.users.length})
        </div>
        {data.users.length === 0 ? (
          <div className="px-5 py-6 text-sm text-white/40">
            Foydalanuvchi yo'q
          </div>
        ) : (
          data.users.map((u) => (
            <div
              key={u.id}
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
            >
              <div>
                <div className="text-sm text-white">{u.name}</div>
                <div className="text-xs text-white/35">{u.email}</div>
              </div>
              <span
                className="px-2 py-0.5 rounded-md text-xs text-white/60"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {u.role}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
