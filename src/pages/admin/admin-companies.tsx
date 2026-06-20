import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useState } from "react";
import { Loader2, Ban, CheckCircle2, ChevronRight, Search } from "lucide-react";
import { adminApi, type Company } from "@/lib/admin-api";

const cardStyle = {
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.08)",
  backdropFilter: "blur(20px)",
};

function formatSom(n: number): string {
  return `${Math.round(n).toLocaleString("ru-RU")}`;
}

export default function AdminCompanies() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["admin-companies"],
    queryFn: adminApi.companies,
    retry: false,
  });

  const blockMutation = useMutation({
    mutationFn: (c: Company) =>
      c.isBlocked ? adminApi.unblock(c.id) : adminApi.block(c.id),
    onSettled: () => {
      setBusyId(null);
      queryClient.invalidateQueries({ queryKey: ["admin-companies"] });
      queryClient.invalidateQueries({ queryKey: ["admin-analytics"] });
    },
  });

  const toggleBlock = (c: Company) => {
    setBusyId(c.id);
    blockMutation.mutate(c);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="rounded-2xl p-6 text-sm text-red-300" style={cardStyle}>
        Ma'lumotni yuklab bo'lmadi:{" "}
        {error instanceof Error ? error.message : "noma'lum xato"}
      </div>
    );
  }

  const filtered = data.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">Kompaniyalar</h1>
          <p className="text-sm text-white/40 mt-0.5">
            {data.length} ta kompaniya Salam Tech'dan foydalanmoqda
          </p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nomi yoki ID bo'yicha qidirish"
            className="w-full sm:w-72 h-10 rounded-xl pl-9 pr-3 text-sm text-white placeholder:text-white/25 outline-none"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div
          className="rounded-2xl p-10 text-center text-sm text-white/40"
          style={cardStyle}
        >
          Kompaniya topilmadi
        </div>
      ) : (
        <div className="rounded-2xl overflow-hidden" style={cardStyle}>
          {/* Header row (desktop) */}
          <div
            className="hidden md:grid px-5 py-3 text-xs font-medium text-white/40 uppercase tracking-wider"
            style={{
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1.4fr",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div>Kompaniya</div>
            <div>Tarif</div>
            <div>Holat</div>
            <div>Savdo hajmi</div>
            <div className="text-right">Amallar</div>
          </div>

          {filtered.map((c) => (
            <div
              key={c.id}
              className="px-5 py-4 grid gap-3 items-center"
              style={{
                gridTemplateColumns: "1fr",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <div
                className="grid gap-3 items-center"
                style={{
                  gridTemplateColumns:
                    "minmax(0,2fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1fr) minmax(0,1.4fr)",
                }}
              >
                {/* Name + id */}
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {c.name}
                  </div>
                  <div className="text-xs text-white/35 font-mono">
                    {c.id}
                  </div>
                  <div className="text-xs text-white/35 mt-0.5 md:hidden">
                    {c.stats.users} foyd. · {c.stats.products} mahsulot
                  </div>
                </div>

                {/* Plan */}
                <div className="text-xs text-white/60 uppercase">
                  {c.subscriptionPlan}
                </div>

                {/* Status */}
                <div>
                  {c.isBlocked ? (
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

                {/* Sales */}
                <div className="text-xs text-white/60">
                  {formatSom(c.stats.salesTotal)} so'm
                  <div className="text-white/30">
                    {c.stats.salesCount} savdo
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => toggleBlock(c)}
                    disabled={busyId === c.id}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs transition-colors disabled:opacity-50"
                    style={{
                      background: c.isBlocked
                        ? "rgba(34,197,94,0.15)"
                        : "rgba(239,68,68,0.12)",
                      color: c.isBlocked ? "#34d399" : "#f87171",
                    }}
                  >
                    {busyId === c.id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : c.isBlocked ? (
                      "Blokni ochish"
                    ) : (
                      "Bloklash"
                    )}
                  </button>
                  <Link
                    href={`/admin/companies/${c.id}`}
                    className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-lg text-xs text-white/70 hover:text-white transition-colors"
                    style={{ background: "rgba(255,255,255,0.05)" }}
                  >
                    Ko'rish <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
