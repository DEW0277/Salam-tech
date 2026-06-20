import { useState, useEffect, useCallback } from "react";
import { useListTransactions, useCreateTransaction, useGetFinanceSummary } from "@/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus, ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, TrendingDown,
  DollarSign, BarChart3, FileText, AlertCircle, CheckCircle, Clock,
  Loader2, Receipt, CreditCard, Building2, Users, UserCheck, Banknote
} from "lucide-react";

const getToken = () => localStorage.getItem("salam_tech_token");

type DebtSale = {
  id: number;
  receiptNumber: string;
  customerName?: string;
  customerId?: number;
  total: number;
  createdAt: string;
  status: string;
};

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors";

const transSchema = z.object({
  type: z.enum(["income", "expense"]),
  amount: z.coerce.number().min(1, "Summa kerak"),
  category: z.string().min(1, "Kategoriya kerak"),
  description: z.string().min(1, "Tavsif kerak"),
  date: z.string().min(1, "Sana kerak"),
});
type FormData = z.infer<typeof transSchema>;

type Tab = "tranzaksiyalar" | "cashflow" | "qarzdorlik" | "invoice";

function TransForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const createMutation = useCreateTransaction();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(transSchema),
    defaultValues: {
      type: "expense", amount: 0, category: "", description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });
  const type = watch("type");

  const onSubmit = (values: FormData) => {
    createMutation.mutate({ data: values }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
        queryClient.invalidateQueries({ queryKey: ["/api/finance/summary"] });
        toast({ title: "Muvaffaqiyatli saqlandi" });
        onSuccess();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Tur</label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { val: "income", label: "Kirim (Daromad)", color: "#10b981" },
            { val: "expense", label: "Chiqim (Xarajat)", color: "#ef4444" },
          ].map(({ val, label, color }) => (
            <button key={val} type="button" onClick={() => setValue("type", val as any)}
              className="py-2.5 rounded-xl text-sm font-medium transition-all"
              style={type === val
                ? { background: `${color}20`, border: `1px solid ${color}50`, color }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }>{label}</button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">Summa (so'm) *</label>
          <input {...register("amount")} type="number" placeholder="0" className={inputCls} />
          {errors.amount && <p className="text-xs text-red-400">{errors.amount.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">Sana *</label>
          <input {...register("date")} type="date" className={inputCls} />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">Kategoriya *</label>
          <input {...register("category")} placeholder="Ijara, Soliq, Tovar..." className={inputCls} />
          {errors.category && <p className="text-xs text-red-400">{errors.category.message}</p>}
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-white/50 uppercase tracking-wider">Tavsif *</label>
          <input {...register("description")} placeholder="Qisqa izoh" className={inputCls} />
          {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
          Bekor
        </button>
        <button type="submit" disabled={createMutation.isPending}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all flex items-center gap-2"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Saqlash
        </button>
      </div>
    </form>
  );
}


export default function Finance() {
  const [activeTab, setActiveTab] = useState<Tab>("tranzaksiyalar");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [debts, setDebts] = useState<DebtSale[]>([]);
  const [loadingDebts, setLoadingDebts] = useState(false);
  const [payingId, setPayingId] = useState<number | null>(null);
  const [payMethod, setPayMethod] = useState<"cash" | "card">("cash");
  const [payConfirmId, setPayConfirmId] = useState<number | null>(null);
  const { toast } = useToast();
  const { data: summary, isLoading: loadingSum } = useGetFinanceSummary();
  const { data: trans, isLoading: loadingTrans } = useListTransactions();

  const fetchDebts = useCallback(() => {
    setLoadingDebts(true);
    fetch("/api/sales/debts", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setDebts(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setLoadingDebts(false));
  }, []);

  useEffect(() => {
    if (activeTab === "qarzdorlik") fetchDebts();
  }, [activeTab, fetchDebts]);

  const handlePayDebt = async (id: number) => {
    setPayingId(id);
    try {
      const res = await fetch(`/api/sales/${id}/pay-debt`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMethod: payMethod }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Qarz to'landi!", description: "Savdo yakunlandi" });
      setPayConfirmId(null);
      fetchDebts();
    } catch {
      toast({ title: "Xatolik yuz berdi", variant: "destructive" });
    } finally {
      setPayingId(null);
    }
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "tranzaksiyalar", label: "Tranzaksiyalar", icon: Receipt },
    { id: "cashflow", label: "Cashflow", icon: BarChart3 },
    { id: "qarzdorlik", label: "Qarzdorlik", icon: AlertCircle },
    { id: "invoice", label: "Invoice", icon: FileText },
  ];

  const totalReceivable = 0;
  const totalPayable = 0;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Moliya</h1>
          <p className="text-xs text-white/30 mt-0.5">Daromad, xarajat, cashflow va hisob-kitob</p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          <Plus className="h-4 w-4" /> Tranzaksiya
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: "Jami Kirim", icon: ArrowUpRight,
            value: loadingSum ? "—" : `${(summary?.totalIncome || 0).toLocaleString()}`,
            color: "#10b981", trend: "+12%"
          },
          {
            label: "Jami Chiqim", icon: ArrowDownRight,
            value: loadingSum ? "—" : `${(summary?.totalExpenses || 0).toLocaleString()}`,
            color: "#ef4444", trend: "-3%"
          },
          {
            label: "Sof Foyda", icon: TrendingUp,
            value: loadingSum ? "—" : `${(summary?.netProfit || 0).toLocaleString()}`,
            color: "#6366f1", trend: "+8%"
          },
          {
            label: "Qarzdorlik", icon: AlertCircle,
            value: `${totalReceivable.toLocaleString()}`,
            color: "#f59e0b", trend: "0 muddati o'tgan"
          },
        ].map(({ label, icon: Icon, value, color, trend }) => (
          <div key={label} className="rounded-2xl p-4 space-y-3" style={card}>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-white/40">{label}</p>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center" style={{ background: `${color}18` }}>
                <Icon className="h-4 w-4" style={{ color }} />
              </div>
            </div>
            <div>
              <p className="text-xl font-extrabold text-white">{value} <span className="text-xs font-normal text-white/30">so'm</span></p>
              <p className="text-[10px] mt-1" style={{ color: `${color}90` }}>{trend}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-2 flex-1 justify-center py-2 rounded-lg text-sm font-medium transition-all"
            style={activeTab === id
              ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', color: 'white' }
              : { color: 'rgba(255,255,255,0.35)' }
            }>
            <Icon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Tranzaksiyalar */}
      {activeTab === "tranzaksiyalar" && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/70">Tranzaksiyalar tarixi</h3>
            <span className="text-xs text-white/30">{trans?.transactions?.length || 0} ta yozuv</span>
          </div>
          {loadingTrans ? (
            <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
          ) : !trans?.transactions?.length ? (
            <div className="py-16 text-center">
              <Receipt className="h-10 w-10 mx-auto text-white/15 mb-3" />
              <p className="text-sm text-white/30">Tranzaksiyalar yo'q</p>
              <p className="text-xs text-white/20 mt-1">Birinchi tranzaksiyani qo'shing</p>
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {trans.transactions.map((t) => (
                <div key={t.id} className="flex items-center gap-4 px-4 py-3 hover:bg-white/2 transition-colors">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: t.type === "income" ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                    {t.type === "income"
                      ? <ArrowUpRight className="h-4 w-4 text-emerald-400" />
                      : <ArrowDownRight className="h-4 w-4 text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/80 truncate">{t.description}</p>
                    <p className="text-[10px] text-white/35">{t.category} · {format(new Date(t.date), "dd.MM.yyyy")}</p>
                  </div>
                  <span className={`text-sm font-bold flex-shrink-0 ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`}>
                    {t.type === "income" ? "+" : "-"}{t.amount.toLocaleString()} so'm
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Cashflow */}
      {activeTab === "cashflow" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Oylik kirim (o'rtacha)", value: (summary?.totalIncome || 0), color: "#10b981" },
              { label: "Oylik chiqim (o'rtacha)", value: (summary?.totalExpenses || 0), color: "#ef4444" },
              { label: "Oylik sof (o'rtacha)", value: (summary?.netProfit || 0), color: "#6366f1" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">{label}</p>
                <p className="text-lg font-bold" style={{ color }}>{Number(value).toLocaleString()} so'm</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white/70">Oylik cashflow ko'rinishi</h3>
            </div>
            <div className="py-14 text-center">
              <BarChart3 className="h-10 w-10 mx-auto text-white/10 mb-3" />
              <p className="text-sm font-medium text-white/35">Ma'lumot yo'q</p>
              <p className="text-xs text-white/20 mt-1">Tranzaksiyalar qo'shilgandan keyin cashflow ko'rinadi</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Qarzdorlik */}
      {activeTab === "qarzdorlik" && (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={{ background: 'var(--st-surface)', border: '1px solid rgba(239,68,68,0.25)' }}>
              <p className="text-[10px] text-white/35 mb-1">Jami qarzlar (mijozlar)</p>
              <p className="text-xl font-extrabold text-red-400">
                {debts.reduce((s, d) => s + d.total, 0).toLocaleString()} so'm
              </p>
              <p className="text-[10px] text-white/30 mt-1">{debts.length} ta to'lanmagan qarz</p>
            </div>
            <div className="rounded-2xl p-4" style={{ background: 'var(--st-surface)', border: '1px solid rgba(245,158,11,0.2)' }}>
              <p className="text-[10px] text-white/35 mb-1">Eng katta qarz</p>
              <p className="text-xl font-extrabold text-amber-400">
                {debts.length > 0 ? Math.max(...debts.map(d => d.total)).toLocaleString() : "0"} so'm
              </p>
              <p className="text-[10px] text-white/30 mt-1">
                {debts.length > 0 ? debts.reduce((a, b) => a.total > b.total ? a : b).customerName || "Noma'lum" : "—"}
              </p>
            </div>
          </div>

          {/* Debts list */}
          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--st-text-2)' }}>
                Qarzga sotilgan savdolar
              </h3>
              <button onClick={fetchDebts} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                Yangilash
              </button>
            </div>

            {loadingDebts ? (
              <div className="py-12 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-indigo-400" /></div>
            ) : debts.length === 0 ? (
              <div className="py-16 text-center">
                <UserCheck className="h-10 w-10 mx-auto text-white/15 mb-3" />
                <p className="text-sm text-white/30">Qarzlar yo'q</p>
                <p className="text-xs text-white/20 mt-1">POS'da "Qarzga" tugmasidan foydalaning</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {debts.map((debt) => (
                  <div key={debt.id}>
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                      <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(239,68,68,0.1)' }}>
                        <UserCheck className="h-4 w-4 text-red-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold" style={{ color: 'var(--st-text)' }}>
                          {debt.customerName || "Noma'lum mijoz"}
                        </p>
                        <p className="text-[10px]" style={{ color: 'var(--st-text-dim)' }}>
                          #{debt.receiptNumber} · {format(new Date(debt.createdAt), "dd.MM.yyyy")}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 space-y-1">
                        <p className="text-sm font-bold text-red-400">{debt.total.toLocaleString()} so'm</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Qarz</span>
                      </div>
                      <button
                        onClick={() => { setPayConfirmId(payConfirmId === debt.id ? null : debt.id); setPayMethod("cash"); }}
                        className="ml-2 flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold text-white transition-all"
                        style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}>
                        To'lash
                      </button>
                    </div>

                    {/* Inline pay panel */}
                    {payConfirmId === debt.id && (
                      <div className="mx-4 mb-3 rounded-xl p-3 space-y-3" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
                        <p className="text-xs font-medium" style={{ color: 'var(--st-text-2)' }}>
                          To'lov usulini tanlang:
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            { val: "cash" as const, label: "Naqd", Icon: Banknote },
                            { val: "card" as const, label: "Karta", Icon: CreditCard },
                          ].map(({ val, label, Icon }) => (
                            <button key={val} onClick={() => setPayMethod(val)}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all"
                              style={payMethod === val
                                ? { background: 'rgba(16,185,129,0.25)', border: '1px solid rgba(16,185,129,0.5)', color: 'white' }
                                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                              }>
                              <Icon className="h-3.5 w-3.5" /> {label}
                            </button>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => setPayConfirmId(null)}
                            className="flex-1 py-2 rounded-lg text-xs text-white/40 hover:text-white hover:bg-white/5 transition-all">
                            Bekor
                          </button>
                          <button onClick={() => handlePayDebt(debt.id)} disabled={payingId === debt.id}
                            className="flex-1 py-2 rounded-lg text-xs font-semibold text-white flex items-center justify-center gap-1.5 disabled:opacity-50 transition-all"
                            style={{ background: 'linear-gradient(135deg, #10b981, #059669)' }}>
                            {payingId === debt.id
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <CheckCircle className="h-3.5 w-3.5" />
                            }
                            Tasdiqlash — {debt.total.toLocaleString()} so'm
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Invoice */}
      {activeTab === "invoice" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "To'langan", value: 0, color: "#10b981" },
              { label: "To'lanmagan", value: 0, color: "#ef4444" },
              { label: "Qisman to'langan", value: 0, color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">{label}</p>
                <p className="text-xl font-extrabold" style={{ color }}>{value} ta</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/70">Invoicelar</h3>
              <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                <Plus className="h-3 w-3" /> Yangi invoice
              </button>
            </div>
            <div className="py-14 text-center">
              <FileText className="h-10 w-10 mx-auto text-white/10 mb-3" />
              <p className="text-sm font-medium text-white/35">Invoicelar yo'q</p>
              <p className="text-xs text-white/20 mt-1">Yangi invoice yaratganda bu yerda ko'rinadi</p>
            </div>
          </div>
        </div>
      )}

      {/* Add Transaction Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-[#0d0d14] border-white/10 sm:max-w-[500px]">
          <DialogHeader><DialogTitle className="text-white">Yangi tranzaksiya</DialogTitle></DialogHeader>
          <TransForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
