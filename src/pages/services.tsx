import { useState, useEffect, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Scissors, Plus, Pencil, Trash2, Clock, Loader2, ClipboardList, CheckCircle, AlertCircle, Circle, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const getToken = () => localStorage.getItem("salam_tech_token");
const BASE_URL = import.meta.env.BASE_URL || "";
const authHeaders = (): Record<string, string> => {
  const t = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (t) {
    headers["Authorization"] = `Bearer ${t}`;
  }
  return headers;
};

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors";

type ServiceTab = "katalog" | "buyurtmalar";

const orders: any[] = [];

const ORDER_STATUS = {
  completed: { label: "Bajarildi", color: "#10b981", bg: "rgba(16,185,129,0.12)", icon: CheckCircle },
  pending: { label: "Kutilmoqda", color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: AlertCircle },
  in_progress: { label: "Jarayonda", color: "#6366f1", bg: "rgba(99,102,241,0.12)", icon: Circle },
};

export default function Services() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<ServiceTab>("katalog");
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", price: "", duration: "60", category: "", isActive: true,
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(`${BASE_URL}api/services`, { headers: authHeaders() });
      if (r.ok) setServices(await r.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchServices(); }, [fetchServices]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: "", description: "", price: "", duration: "60", category: "", isActive: true });
    setOpen(true);
  };

  const openEdit = (svc: any) => {
    setEditId(svc.id);
    setForm({ name: svc.name, description: svc.description || "", price: String(svc.price), duration: String(svc.duration), category: svc.category || "", isActive: svc.isActive });
    setOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const body = { ...form, price: Number(form.price), duration: Number(form.duration) };
      const url = editId ? `${BASE_URL}api/services/${editId}` : `${BASE_URL}api/services`;
      const method = editId ? "PUT" : "POST";
      const r = await fetch(url, { method, headers: authHeaders(), body: JSON.stringify(body) });
      if (r.ok) {
        setOpen(false);
        fetchServices();
        toast({ title: editId ? "Xizmat yangilandi" : "Xizmat qo'shildi" });
      } else {
        toast({ title: "Xato", description: "Saqlashda xato yuz berdi", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const deleteService = async (id: number) => {
    if (!confirm("Xizmatni o'chirmoqchimisiz?")) return;
    await fetch(`${BASE_URL}api/services/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchServices();
    toast({ title: "Xizmat o'chirildi" });
  };

  const categories = [...new Set(services.map((s: any) => s.category).filter(Boolean))];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Xizmatlar</h1>
          <p className="text-xs text-white/30 mt-0.5">Xizmat katalogi va buyurtmalar</p>
        </div>
        {activeTab === "katalog" && (
          <button onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            <Plus className="h-4 w-4" /> Xizmat qo'shish
          </button>
        )}
        {activeTab === "buyurtmalar" && (
          <button onClick={() => toast({ title: "Tez orada", description: "Yangi buyurtma qo'shish" })}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            <Plus className="h-4 w-4" /> Yangi buyurtma
          </button>
        )}
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Jami xizmatlar", value: services.length, color: "#6366f1" },
          { label: "Faol xizmatlar", value: services.filter((s: any) => s.isActive).length, color: "#10b981" },
          { label: "Kategoriyalar", value: categories.length, color: "#8b5cf6" },
          { label: "Bugungi buyurtmalar", value: orders.length, color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={card}>
            <p className="text-[11px] text-white/40 mb-1">{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {[
          { id: "katalog" as ServiceTab, label: "Xizmat katalogi", icon: Scissors },
          { id: "buyurtmalar" as ServiceTab, label: "Buyurtmalar", icon: ClipboardList },
        ].map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-all"
            style={activeTab === id
              ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', color: 'white' }
              : { color: 'rgba(255,255,255,0.35)' }
            }>
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Katalog tab */}
      {activeTab === "katalog" && (
        <>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-7 w-7 animate-spin text-indigo-400" /></div>
          ) : services.length === 0 ? (
            <div className="rounded-2xl py-16 text-center" style={card}>
              <Scissors className="h-10 w-10 mx-auto text-white/15 mb-3" />
              <p className="text-sm font-medium text-white/40">Xizmatlar yo'q</p>
              <p className="text-xs text-white/20 mt-1">Birinchi xizmatni qo'shing</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {services.map((svc: any) => (
                <div key={svc.id} className="rounded-2xl p-4 space-y-3 transition-all hover:bg-white/4"
                  style={{ ...card, opacity: svc.isActive ? 1 : 0.6 }}>
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(99,102,241,0.15)' }}>
                      <Scissors className="h-5 w-5 text-indigo-400" />
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(svc)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => deleteService(svc.id)}
                        className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-white/85">{svc.name}</p>
                    {svc.description && <p className="text-[11px] text-white/35 mt-0.5 line-clamp-2">{svc.description}</p>}
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-white/5">
                    <span className="text-base font-extrabold text-indigo-400">{Number(svc.price).toLocaleString()} <span className="text-xs font-normal text-white/30">so'm</span></span>
                    <div className="flex items-center gap-1 text-xs text-white/35">
                      <Clock className="h-3.5 w-3.5" />
                      {svc.duration} daq.
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    {svc.category ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                        {svc.category}
                      </span>
                    ) : <span />}
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${svc.isActive ? 'bg-emerald-500/12 text-emerald-400' : 'bg-red-500/12 text-red-400'}`}>
                      {svc.isActive ? "Faol" : "Nofaol"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Buyurtmalar tab */}
      {activeTab === "buyurtmalar" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Bajarildi", count: orders.filter((o: any) => o.status === "completed").length, color: "#10b981", bg: "rgba(16,185,129,0.1)" },
              { label: "Jarayonda", count: orders.filter((o: any) => o.status === "in_progress").length, color: "#6366f1", bg: "rgba(99,102,241,0.1)" },
              { label: "Kutilmoqda", count: orders.filter((o: any) => o.status === "pending").length, color: "#f59e0b", bg: "rgba(245,158,11,0.1)" },
            ].map(({ label, count, color, bg }) => (
              <div key={label} className="rounded-2xl p-3 text-center" style={{ background: bg, border: `1px solid ${color}20` }}>
                <p className="text-xl font-extrabold" style={{ color }}>{count}</p>
                <p className="text-[11px] text-white/45 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white/75">Barcha buyurtmalar</h3>
            </div>
            {orders.length === 0 ? (
              <div className="py-14 text-center">
                <ClipboardList className="h-10 w-10 mx-auto text-white/10 mb-3" />
                <p className="text-sm font-medium text-white/35">Buyurtmalar yo'q</p>
                <p className="text-xs text-white/20 mt-1">Yangi buyurtma qo'shilganda bu yerda ko'rinadi</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {orders.map((order: any) => {
                  const sc = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS];
                  const StatusIcon = sc.icon;
                  return (
                    <div key={order.id} className="flex items-center gap-3 px-4 py-3.5 hover:bg-white/2 transition-colors">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(99,102,241,0.1)' }}>
                        <User className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-medium text-white/80">{order.client}</p>
                          <span className="text-[10px] text-white/35">· {order.service}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[10px] text-white/35">{order.date}</span>
                          <span className="text-[10px] text-white/35">Operator: {order.operator}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="text-sm font-bold text-white/75">{order.price.toLocaleString()} so'm</p>
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full"
                          style={{ background: sc.bg, color: sc.color }}>
                          <StatusIcon className="h-3 w-3" />
                          {sc.label}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={open} onOpenChange={v => { setOpen(v); if (!v) setEditId(null); }}>
        <DialogContent className="bg-[#0d0d14] border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">{editId ? "Xizmatni tahrirlash" : "Yangi xizmat"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Xizmat nomi *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Masalan: Konsultatsiya, Audit" className={inputCls} required />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Tavsif</label>
              <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Qisqacha tavsif" className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider">Narxi (so'm)</label>
                <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  placeholder="0" className={inputCls} />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider">Davomiyligi (daq.)</label>
                <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))}
                  placeholder="60" className={inputCls} />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-white/40 uppercase tracking-wider">Kategoriya</label>
              <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                placeholder="Masalan: Moliya, IT, Huquqiy" className={inputCls} />
            </div>
            <div className="flex items-center gap-3 py-1">
              <Switch checked={form.isActive} onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))} />
              <label className="text-sm text-white/55">Faol xizmat</label>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button type="button" onClick={() => setOpen(false)}
                className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
                Bekor
              </button>
              <button type="submit" disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all flex items-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {editId ? "Saqlash" : "Qo'shish"}
              </button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
