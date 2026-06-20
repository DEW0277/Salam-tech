import { useState } from "react";
import { useListCustomers, useCreateCustomer, useUpdateCustomer, useDeleteCustomer, Customer } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Search, Plus, Edit, Trash2, Users, Phone, Mail, TrendingUp,
  Gift, Star, MessageSquare, Send, Award, Zap, Crown
} from "lucide-react";

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "bg-white/5 border-white/10 focus:border-indigo-500/50 text-white placeholder:text-white/25";

type CRMTab = "mijozlar" | "loyalty" | "sms";

const custSchema = z.object({
  name: z.string().min(2, "Ism kerak"),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  deals: z.coerce.number().min(0).optional(),
  dealValue: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
  segment: z.enum(["new", "regular", "vip"]).optional(),
});
type FormData = z.infer<typeof custSchema>;

// Mock loyalty data

const LEVEL_CONFIG = {
  Platinum: { color: "#c084fc", bg: "rgba(192,132,252,0.12)", icon: Crown, min: 3000 },
  Gold: { color: "#fbbf24", bg: "rgba(251,191,36,0.12)", icon: Award, min: 1500 },
  Silver: { color: "#94a3b8", bg: "rgba(148,163,184,0.12)", icon: Star, min: 500 },
  Bronze: { color: "#d97706", bg: "rgba(217,119,6,0.12)", icon: Gift, min: 0 },
};

const SMS_TEMPLATES = [
  { id: 1, title: "Xush kelibsiz bonus", msg: "Hurmatli {ism}! SALAM TECH ga xush kelibsiz! Birinchi xaridingizda 5% chegirma." },
  { id: 2, title: "Maxsus taklif", msg: "Hurmatli {ism}! Bu hafta maxsus chegirma — 20% off. Bugun keling!" },
  { id: 3, title: "Cashback eslatmasi", msg: "Hurmatli {ism}! Sizning cashback balansida {summa} so'm mavjud. Ishlatishni unutmang!" },
  { id: 4, title: "Tug'ilgan kun", msg: "Hurmatli {ism}! Tug'ilgan kuningiz bilan tabriklaymiz! 🎂 Bugun 15% chegirma." },
];

function CustForm({ customer, onSuccess, onCancel }: { customer?: Customer; onSuccess: () => void; onCancel: () => void }) {
  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(custSchema),
    defaultValues: customer ? {
      name: customer.name, phone: customer.phone || "", email: customer.email || "",
      segment: (customer.segment as any) || "new", notes: customer.notes || "",
    } : { name: "", company: "", phone: "", email: "", deals: 0, dealValue: 0, notes: "", segment: "new" },
  });

  const onSubmit = (values: FormData) => {
    const opts = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/customers"] });
        toast({ title: customer ? "Yangilandi" : "Qo'shildi" });
        onSuccess();
      }
    };
    if (customer) updateMutation.mutate({ id: customer.id, data: { name: values.name, phone: values.phone, email: values.email, notes: values.notes, segment: values.segment } }, opts);
    else createMutation.mutate({ data: { name: values.name, phone: values.phone, email: values.email, notes: values.notes, segment: values.segment } }, opts);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const segment = form.watch("segment");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem><FormLabel className="text-xs text-white/50 uppercase tracking-wider">Ism *</FormLabel>
              <FormControl><Input {...field} className={inputCls} placeholder="Sarvar Toshmatov" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem><FormLabel className="text-xs text-white/50 uppercase tracking-wider">Kompaniya</FormLabel>
              <FormControl><Input {...field} className={inputCls} placeholder="LLC Biznes" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem><FormLabel className="text-xs text-white/50 uppercase tracking-wider">Email</FormLabel>
              <FormControl><Input {...field} type="email" className={inputCls} placeholder="sarvar@mail.uz" /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem><FormLabel className="text-xs text-white/50 uppercase tracking-wider">Telefon</FormLabel>
              <FormControl><Input {...field} className={inputCls} placeholder="+998 90 123 45 67" /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem><FormLabel className="text-xs text-white/50 uppercase tracking-wider">Izoh</FormLabel>
            <FormControl><Input {...field} className={inputCls} placeholder="Qo'shimcha ma'lumot..." /></FormControl><FormMessage /></FormItem>
        )} />
        <div>
          <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Segment</label>
          <div className="flex gap-2">
            {[{ val: "new", label: "Potensial" }, { val: "regular", label: "Faol" }, { val: "vip", label: "VIP" }].map(({ val, label }) => (
              <button key={val} type="button" onClick={() => form.setValue("segment", val as any)}
                className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={segment === val
                  ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }>{label}</button>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
          <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">Bekor</button>
          <button type="submit" disabled={isPending}
            className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {isPending ? "Saqlanmoqda..." : customer ? "Saqlash" : "Qo'shish"}
          </button>
        </div>
      </form>
    </Form>
  );
}

export default function CRM() {
  const [activeTab, setActiveTab] = useState<CRMTab>("mijozlar");
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editCust, setEditCust] = useState<Customer | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
  const [smsText, setSmsText] = useState("");
  const { toast } = useToast();

  const { data, isLoading } = useListCustomers({ search });
  const deleteMutation = useDeleteCustomer();
  const queryClient = useQueryClient();

  const customers = data?.customers || [];
  const total = customers.length;
  const active = customers.filter((c) => c.segment === "regular").length;
  const potential = customers.filter((c) => c.segment === "new").length;
  const totalDeals = customers.reduce((s, c) => s + (Number(c.totalPurchases) || 0), 0);

  const CASHBACK_PCT = 1;
  const getCashbackSom = (totalPurchases: number | string) => Math.round((Number(totalPurchases) || 0) * CASHBACK_PCT / 100);
  const getPoints = (totalPurchases: number | string) => Math.floor((Number(totalPurchases) || 0) / 1000);
  const getLevel = (points: number): keyof typeof LEVEL_CONFIG => {
    if (points >= 3000) return "Platinum";
    if (points >= 1500) return "Gold";
    if (points >= 500) return "Silver";
    return "Bronze";
  };

  const handleDelete = (id: number) => {
    if (confirm("O'chirilsinmi?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["/api/customers"] }); toast({ title: "O'chirildi" }); }
      });
    }
  };

  const segmentLabels: Record<string, string> = { new: "Potensial", regular: "Faol", vip: "VIP" };
  const segmentColors: Record<string, string> = { new: "rgba(99,102,241,0.15)", regular: "rgba(16,185,129,0.15)", vip: "rgba(251,191,36,0.15)" };
  const segmentText: Record<string, string> = { new: "#818cf8", regular: "#34d399", vip: "#fbbf24" };

  const tabs = [
    { id: "mijozlar" as CRMTab, label: "Mijozlar", icon: Users },
    { id: "loyalty" as CRMTab, label: "Loyalty / Cashback", icon: Gift },
    { id: "sms" as CRMTab, label: "SMS Marketing", icon: MessageSquare },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Mijozlar (CRM)</h1>
          <p className="text-xs text-white/30 mt-0.5">{total} ta mijoz · Loyalty & Marketing</p>
        </div>
        {activeTab === "mijozlar" && (
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
                <Plus className="h-4 w-4" /> Mijoz qo'shish
              </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[540px] bg-[#0d0d14] border-white/10">
              <DialogHeader><DialogTitle className="text-white">Yangi mijoz</DialogTitle></DialogHeader>
              <CustForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Jami mijozlar", value: total, color: "#6366f1" },
          { label: "Faol mijozlar", value: active, color: "#10b981" },
          { label: "Potensial", value: potential, color: "#06b6d4" },
          {
            label: "Jami kelishuvlar",
            value: totalDeals >= 1_000_000
              ? `${(totalDeals / 1_000_000).toFixed(1)}M so'm`
              : totalDeals >= 1_000
              ? `${(totalDeals / 1_000).toFixed(0)} ming so'm`
              : `${totalDeals.toLocaleString()} so'm`,
            color: "#f59e0b"
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={card}>
            <p className="text-[10px] text-white/35 mb-1">{label}</p>
            <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
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
            <Icon className="h-4 w-4" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* Tab: Mijozlar */}
      {activeTab === "mijozlar" && (
        <div className="space-y-3">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
            <input placeholder="Mijoz qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50"
              style={card} />
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-white/5 hover:bg-transparent">
                  {["KOMPANIYA / ISM", "ALOQA", "HOLAT", "KELISHUVLAR", ""].map((h) => (
                    <TableHead key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider py-3">{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow><TableCell colSpan={5} className="py-16 text-center text-white/20 text-sm">Yuklanmoqda...</TableCell></TableRow>
                ) : customers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2 text-white/20">
                        <Users className="h-8 w-8" />
                        <p className="text-sm">Mijozlar topilmadi</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  customers.map((cust) => (
                    <TableRow key={cust.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                            {cust.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/80">{cust.name}</p>
                            <p className="text-[10px] text-white/30">{cust.address || "—"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {cust.phone && <div className="flex items-center gap-1 text-xs text-white/50"><Phone className="h-3 w-3" />{cust.phone}</div>}
                          {cust.email && <div className="flex items-center gap-1 text-xs text-white/40"><Mail className="h-3 w-3" />{cust.email}</div>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-[11px] font-medium"
                          style={{ background: segmentColors[cust.segment || "new"] || segmentColors.new, color: segmentText[cust.segment || "new"] || segmentText.new }}>
                          {segmentLabels[cust.segment || "new"] || "Potensial"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-indigo-300">
                        {cust.totalPurchases.toLocaleString()} so'm
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Dialog open={editCust?.id === cust.id} onOpenChange={(o) => !o && setEditCust(null)}>
                            <DialogTrigger asChild>
                              <button onClick={() => setEditCust(cust)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[540px] bg-[#0d0d14] border-white/10">
                              <DialogHeader><DialogTitle className="text-white">Tahrirlash</DialogTitle></DialogHeader>
                              {editCust?.id === cust.id && <CustForm customer={cust} onSuccess={() => setEditCust(null)} onCancel={() => setEditCust(null)} />}
                            </DialogContent>
                          </Dialog>
                          <button onClick={() => handleDelete(cust.id)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}

      {/* Tab: Loyalty */}
      {activeTab === "loyalty" && (() => {
        const loyaltyCustomers = customers.map(c => {
          const pts = getPoints(c.totalPurchases);
          const level = getLevel(pts);
          const cashSom = getCashbackSom(c.totalPurchases);
          return { ...c, points: pts, cashback: cashSom, level };
        }).sort((a, b) => b.cashback - a.cashback);

        const totalCashback = loyaltyCustomers.reduce((s, c) => s + c.cashback, 0);
        const totalSpent = loyaltyCustomers.reduce((s, c) => s + (Number(c.totalPurchases) || 0), 0);
        const avgPurchases = loyaltyCustomers.length > 0
          ? Math.round(loyaltyCustomers.reduce((s, c) => s + (c.purchaseCount || 0), 0) / loyaltyCustomers.length)
          : 0;

        return (
          <div className="space-y-4">
            {/* 1% cashback info */}
            <div className="rounded-2xl p-4" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(16,185,129,0.15)' }}>
                  <Zap className="h-4 w-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--st-text)' }}>
                    Har bir xarid summasidan <span className="text-emerald-400">1% cashback</span>
                  </p>
                  <p className="text-[11px] text-white/40">
                    Mijoz 100,000 so'm xarid qilsa → <span className="text-emerald-300">1,000 so'm cashback</span> oladi
                  </p>
                </div>
              </div>
            </div>

            {/* Loyalty level legend */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => {
                const Icon = cfg.icon;
                const count = loyaltyCustomers.filter(c => c.level === level).length;
                return (
                  <div key={level} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
                    <Icon className="h-5 w-5 flex-shrink-0" style={{ color: cfg.color }} />
                    <div>
                      <p className="text-sm font-semibold" style={{ color: cfg.color }}>{level}</p>
                      <p className="text-[10px] text-white/40">{count} ta mijoz · {cfg.min}+ ball</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Loyalty stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">Jami xarid summasi</p>
                <p className="text-xl font-extrabold text-indigo-400">
                  {totalSpent >= 1_000_000
                    ? `${(totalSpent / 1_000_000).toFixed(1)}M`
                    : `${(totalSpent / 1_000).toFixed(0)} ming`} so'm
                </p>
              </div>
              <div className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">Jami cashback (1%)</p>
                <p className="text-xl font-extrabold text-emerald-400">{totalCashback.toLocaleString()} so'm</p>
              </div>
              <div className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">O'rtacha xarid soni</p>
                <p className="text-xl font-extrabold text-purple-400">{avgPurchases} ta</p>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={card}>
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white/75">Loyalty kartalar</h3>
                <div className="flex items-center gap-2 text-[10px] text-white/35">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />Har xarid summasidan 1% cashback
                </div>
              </div>
              {loyaltyCustomers.length === 0 ? (
                <div className="py-14 text-center">
                  <Gift className="h-9 w-9 mx-auto text-white/15 mb-3" />
                  <p className="text-sm text-white/30">Mijozlar yo'q</p>
                  <p className="text-xs text-white/20 mt-1">CRM'ga mijoz qo'shing va xarid qilganda cashback to'planadi</p>
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {loyaltyCustomers.map((cust) => {
                    const cfg = LEVEL_CONFIG[cust.level];
                    const LevelIcon = cfg.icon;
                    const nextLevelThresholds = { Platinum: null, Gold: { name: "Platinum", minSpend: 3_000_000 }, Silver: { name: "Gold", minSpend: 1_500_000 }, Bronze: { name: "Silver", minSpend: 500_000 } };
                    const nextLvl = nextLevelThresholds[cust.level as keyof typeof nextLevelThresholds];
                    const totalSpendVal = Number(cust.totalPurchases) || 0;
                    const progress = nextLvl ? Math.min((totalSpendVal / nextLvl.minSpend) * 100, 100) : 100;
                    return (
                      <div key={cust.id} className="px-4 py-4 hover:bg-white/2 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: cfg.bg }}>
                            <LevelIcon className="h-5 w-5" style={{ color: cfg.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between flex-wrap gap-2">
                              <p className="text-sm font-semibold" style={{ color: 'var(--st-text)' }}>{cust.name}</p>
                              <div className="flex items-center gap-2 text-[11px]">
                                <span className="text-white/30">Cashback:</span>
                                <span className="text-emerald-400 font-bold">{cust.cashback.toLocaleString()} so'm</span>
                                <span className="px-2 py-0.5 rounded-full text-[10px]" style={{ background: cfg.bg, color: cfg.color }}>{cust.level}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 text-[10px] text-white/35">
                              {cust.phone && <><span>{cust.phone}</span><span>·</span></>}
                              <span>{cust.purchaseCount || 0} ta xarid</span>
                              <span>·</span>
                              <span>Jami: {totalSpendVal.toLocaleString()} so'm</span>
                            </div>
                            {nextLvl && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
                                  <div className="h-full rounded-full" style={{ width: `${progress}%`, background: cfg.color, opacity: 0.7 }} />
                                </div>
                                <span className="text-[9px] text-white/25 flex-shrink-0">
                                  {nextLvl.name} uchun {Math.max(0, nextLvl.minSpend - totalSpendVal).toLocaleString()} so'm kerak
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Tab: SMS Marketing */}
      {activeTab === "sms" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Jami yuborildi", value: "1,248", color: "#6366f1" },
              { label: "O'qildi", value: "87%", color: "#10b981" },
              { label: "Konversiya", value: "12.4%", color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">{label}</p>
                <p className="text-xl font-extrabold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Compose */}
            <div className="rounded-2xl p-5 space-y-4" style={card}>
              <h3 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                <Send className="h-4 w-4 text-indigo-400" /> SMS Yuborish
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Qabul qiluvchilar</label>
                  <select className="w-full h-10 px-3 rounded-xl text-sm text-white outline-none bg-white/5 border border-white/8 appearance-none">
                    <option value="" className="bg-[#1a1a2e]">Barcha mijozlar ({total} ta)</option>
                    <option value="vip" className="bg-[#1a1a2e]">Faqat VIP</option>
                    <option value="regular" className="bg-[#1a1a2e]">Faol mijozlar</option>
                    <option value="birthday" className="bg-[#1a1a2e]">Tug'ilgan kun (bu oy)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-white/40 uppercase tracking-wider block mb-1.5">Xabar matni</label>
                  <textarea value={smsText} onChange={e => setSmsText(e.target.value)} rows={5}
                    placeholder="SMS xabarini yozing..."
                    className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 resize-none" />
                  <p className="text-[10px] text-white/25 text-right mt-1">{smsText.length} / 160 belgi</p>
                </div>
                <button
                  onClick={() => { if (smsText.trim()) { toast({ title: "SMS yuborildi!", description: `${total} ta mijozga SMS yuborildi` }); setSmsText(""); } }}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                  <Send className="h-4 w-4" /> Yuborish
                </button>
              </div>
            </div>

            {/* Templates */}
            <div className="rounded-2xl overflow-hidden" style={card}>
              <div className="p-4 border-b border-white/5">
                <h3 className="text-sm font-semibold text-white/80">Tayyor shablonlar</h3>
              </div>
              <div className="divide-y divide-white/5">
                {SMS_TEMPLATES.map((tmpl) => (
                  <button key={tmpl.id}
                    onClick={() => { setSelectedTemplate(tmpl.id); setSmsText(tmpl.msg); }}
                    className="w-full flex items-start gap-3 px-4 py-3.5 text-left hover:bg-white/3 transition-colors"
                    style={selectedTemplate === tmpl.id ? { background: 'rgba(99,102,241,0.08)' } : {}}>
                    <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: selectedTemplate === tmpl.id ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)' }}>
                      <MessageSquare className="h-4 w-4" style={{ color: selectedTemplate === tmpl.id ? '#818cf8' : 'rgba(255,255,255,0.3)' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/75">{tmpl.title}</p>
                      <p className="text-[10px] text-white/30 mt-0.5 line-clamp-2">{tmpl.msg}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
