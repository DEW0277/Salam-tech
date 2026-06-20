import { useState, useEffect } from "react";
import { useListSuppliers } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Plus, ShoppingBag, Truck, Calendar, CheckCircle, Clock, XCircle, Trash2, Edit } from "lucide-react";

const getToken = () => localStorage.getItem("salam_tech_token");

type Purchase = {
  id: number;
  supplierName: string;
  supplierId?: number | null;
  status: "pending" | "received" | "cancelled";
  totalAmount: string;
  notes?: string | null;
  deliveryDate?: string | null;
  createdAt: string;
};

const purchaseSchema = z.object({
  supplierName: z.string().min(1, "Yetkazib beruvchi kerak"),
  supplierId: z.coerce.number().optional(),
  totalAmount: z.string().default("0"),
  notes: z.string().optional(),
  deliveryDate: z.string().optional(),
  status: z.enum(["pending", "received", "cancelled"]).default("pending"),
});

type FormData = z.infer<typeof purchaseSchema>;

const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors";
const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };

const STATUS_INFO: Record<string, { label: string; icon: any; bg: string; text: string }> = {
  pending:   { label: "Kutilmoqda", icon: Clock,         bg: "rgba(245,158,11,0.12)", text: "#fbbf24" },
  received:  { label: "Qabul qilindi", icon: CheckCircle, bg: "rgba(16,185,129,0.12)", text: "#34d399" },
  cancelled: { label: "Bekor qilindi", icon: XCircle,    bg: "rgba(239,68,68,0.1)",  text: "#f87171" },
};

function usePurchases() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const token = getToken();
      const r = await fetch("/api/purchases", { headers: token ? { Authorization: `Bearer ${token}` } : {} });
      if (r.ok) setPurchases(await r.json());
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const create = async (data: FormData) => {
    const token = getToken();
    const r = await fetch("/api/purchases", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data),
    });
    if (r.ok) { fetchAll(); return true; }
    return false;
  };

  const update = async (id: number, data: Partial<FormData>) => {
    const token = getToken();
    const r = await fetch(`/api/purchases/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(data),
    });
    if (r.ok) { fetchAll(); return true; }
    return false;
  };

  const remove = async (id: number) => {
    const token = getToken();
    await fetch(`/api/purchases/${id}`, {
      method: "DELETE",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    fetchAll();
  };

  return { purchases, loading, create, update, remove };
}

function PurchaseForm({ purchase, suppliers, onSuccess, onCancel }: {
  purchase?: Purchase; suppliers: any[]; onSuccess: () => void; onCancel: () => void;
}) {
  const { create, update } = usePurchases();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(purchaseSchema),
    defaultValues: purchase ? {
      supplierName: purchase.supplierName,
      supplierId: purchase.supplierId || undefined,
      totalAmount: purchase.totalAmount || "0",
      notes: purchase.notes || "",
      status: purchase.status,
      deliveryDate: purchase.deliveryDate?.split("T")[0] || "",
    } : { supplierName: "", totalAmount: "0", notes: "", status: "pending", deliveryDate: "" },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const selectedStatus = watch("status");

  const onSubmit = async (values: FormData) => {
    setSaving(true);
    const ok = purchase ? await update(purchase.id, values) : await create(values);
    setSaving(false);
    if (ok) {
      toast({ title: purchase ? "Yangilandi" : "Xarid qo'shildi" });
      onSuccess();
    } else {
      toast({ title: "Xatolik", variant: "destructive" });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Supplier selector */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Yetkazib beruvchi *</label>
        {suppliers.length > 0 ? (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-1.5">
              {suppliers.map((s) => (
                <button key={s.id} type="button"
                  onClick={() => { setValue("supplierId", s.id); setValue("supplierName", s.name); }}
                  className="h-8 px-3 rounded-xl text-xs font-medium transition-all"
                  style={watch("supplierId") === s.id
                    ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                  }>
                  <Truck className="h-3 w-3 inline mr-1" />{s.name}
                </button>
              ))}
            </div>
            <input {...register("supplierName")} placeholder="Yoki yangi nom kiriting" className={inputCls} />
          </div>
        ) : (
          <input {...register("supplierName")} placeholder="Yetkazib beruvchi nomi" className={inputCls} />
        )}
        {errors.supplierName && <p className="text-xs text-red-400">{errors.supplierName.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Umumiy summa (so'm)</label>
          <input {...register("totalAmount")} type="number" placeholder="0" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Yetkazib berish sanasi</label>
          <input {...register("deliveryDate")} type="date" className={inputCls} />
        </div>
      </div>

      {/* Status */}
      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Holat</label>
        <div className="flex gap-2">
          {(["pending", "received", "cancelled"] as const).map((s) => {
            const info = STATUS_INFO[s];
            const Icon = info.icon;
            return (
              <button key={s} type="button"
                onClick={() => setValue("status", s)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition-all"
                style={selectedStatus === s
                  ? { background: info.bg, border: `1px solid ${info.text}40`, color: info.text }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.35)' }
                }>
                <Icon className="h-3.5 w-3.5" />{info.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Izoh</label>
        <textarea {...register("notes")} rows={2} placeholder="Qo'shimcha ma'lumot..."
          className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 resize-none" />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">Bekor</button>
        <button type="submit" disabled={saving}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {saving ? "Saqlanmoqda..." : purchase ? "Yangilash" : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}

export default function Purchases() {
  const { purchases, loading, remove } = usePurchases();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Purchase | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const { data: suppliersData } = useListSuppliers();
  const { toast } = useToast();
  const suppliers = suppliersData || [];

  // Re-fetch when dialogs close
  const { purchases: allPurchases, loading: l2, create, update, remove: del } = usePurchases();

  const filtered = purchases.filter((p) => filterStatus === "all" || p.status === filterStatus);

  const totalPending = purchases.filter(p => p.status === "pending").reduce((s, p) => s + Number(p.totalAmount), 0);
  const totalReceived = purchases.filter(p => p.status === "received").reduce((s, p) => s + Number(p.totalAmount), 0);

  const handleDelete = async (id: number) => {
    if (confirm("O'chirishni tasdiqlaysizmi?")) {
      await remove(id);
      toast({ title: "O'chirildi" });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Xaridlar</h1>
          <p className="text-xs text-white/30 mt-0.5">{purchases.length} ta xarid buyurtmasi</p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          <Plus className="h-4 w-4" /> Yangi xarid
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jami xaridlar", value: purchases.length, color: "text-white/80" },
          { label: "Kutilayotgan summa", value: `${totalPending.toLocaleString()} so'm`, color: "text-amber-400" },
          { label: "Qabul qilingan", value: `${totalReceived.toLocaleString()} so'm`, color: "text-emerald-400" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={card}>
            <p className="text-[10px] text-white/35 mb-1">{label}</p>
            <p className={`text-lg font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2">
        {[
          { val: "all", label: "Barchasi" },
          { val: "pending", label: "Kutilmoqda" },
          { val: "received", label: "Qabul qilindi" },
          { val: "cancelled", label: "Bekor qilindi" },
        ].map(({ val, label }) => (
          <button key={val} onClick={() => setFilterStatus(val)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={filterStatus === val
              ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: 'white' }
              : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }
            }>{label}</button>
        ))}
      </div>

      {/* List */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        {loading ? (
          <div className="py-16 text-center text-white/20 text-sm">Yuklanmoqda...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-2 text-white/20">
            <ShoppingBag className="h-8 w-8" />
            <p className="text-sm">Xaridlar yo'q</p>
          </div>
        ) : (
          <div className="divide-y divide-white/4">
            {filtered.map((p) => {
              const info = STATUS_INFO[p.status];
              const StatusIcon = info.icon;
              return (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-white/2 transition-colors">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.1)' }}>
                    <ShoppingBag className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white/80">{p.supplierName}</p>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ background: info.bg, color: info.text }}>
                        <StatusIcon className="h-3 w-3" />{info.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      {p.notes && <p className="text-[11px] text-white/30 truncate max-w-[200px]">{p.notes}</p>}
                      {p.deliveryDate && (
                        <span className="flex items-center gap-1 text-[10px] text-white/25">
                          <Calendar className="h-3 w-3" />
                          {new Date(p.deliveryDate).toLocaleDateString('uz-UZ')}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-sm font-bold text-indigo-300">{Number(p.totalAmount).toLocaleString()} so'm</p>
                    <p className="text-[10px] text-white/25 mt-0.5">{new Date(p.createdAt).toLocaleDateString('uz-UZ')}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => setEditItem(p)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => handleDelete(p.id)}
                      className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><ShoppingBag className="h-4 w-4 text-indigo-400" />Yangi xarid buyurtmasi</DialogTitle></DialogHeader>
          <PurchaseForm suppliers={suppliers} onSuccess={() => { setIsAddOpen(false); window.location.reload(); }} onCancel={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-[500px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Edit className="h-4 w-4 text-indigo-400" />Xaridni tahrirlash</DialogTitle></DialogHeader>
          {editItem && (
            <PurchaseForm purchase={editItem} suppliers={suppliers} onSuccess={() => { setEditItem(null); window.location.reload(); }} onCancel={() => setEditItem(null)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
