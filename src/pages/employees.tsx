import { useState } from "react";
import { useListEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, Employee } from "@/api-client";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Edit, Trash2, UserSquare2, Eye, EyeOff, KeyRound, Users,
  CheckCircle, BarChart3, Clock, Target, TrendingUp, Award, Calendar,
  CheckSquare, XSquare, MinusSquare
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { fetchMe } from "@/lib/admin-api";

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors";

type EmpTab = "xodimlar" | "kpi" | "davomiylik" | "maosh";

const empSchema = z.object({
  name: z.string().min(2, "Ism kerak"),
  email: z.string().email("Noto'g'ri email"),
  password: z.string().optional(),
  phone: z.string().optional(),
  role: z.enum(["admin", "manager", "cashier"]),
  position: z.string().optional(),
  salary: z.coerce.number().optional(),
});
type FormData = z.infer<typeof empSchema>;

const DAYS = ["Dush", "Sesh", "Chor", "Pay", "Jum", "Shan"];

function EmpForm({ employee, onSuccess, onCancel, isAdmin }: { employee?: Employee; onSuccess: () => void; onCancel: () => void; isAdmin: boolean }) {
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(empSchema),
    defaultValues: employee ? {
      name: employee.name, email: employee.email, phone: employee.phone || "",
      role: employee.role as any, position: employee.position || "", salary: employee.salary || 0, password: "",
    } : { name: "", email: "", phone: "", role: "cashier", position: "", salary: 0, password: "" },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const role = watch("role");

  const onSubmit = (values: FormData) => {
    const payload: any = { ...values };
    if (!payload.password) delete payload.password;
    const opts = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
        toast({ title: employee ? "Xodim yangilandi" : "Xodim qo'shildi" });
        onSuccess();
      },
      onError: () => toast({ title: "Xatolik", variant: "destructive" }),
    };
    if (employee) updateMutation.mutate({ id: employee.id, data: payload }, opts);
    else createMutation.mutate({ data: payload }, opts);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {([
          { label: "Ism familiya *", name: "name" as const, placeholder: "Sarvar Toshmatov" },
          { label: "Lavozim", name: "position" as const, placeholder: "Kassir, Menejer..." },
          { label: "Email *", name: "email" as const, type: "email", placeholder: "xodim@mail.uz" },
          { label: "Telefon", name: "phone" as const, placeholder: "+998 90 123 45 67" },
          ...(isAdmin
            ? [{ label: "Maoshi (so'm)", name: "salary" as const, type: "number", placeholder: "0" }]
            : []),
        ]).map(({ label, name, type = "text", placeholder }) => (
          <div key={name} className="space-y-1.5">
            <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
            <input {...register(name)} type={type} placeholder={placeholder} className={inputCls} />
            {errors[name] && <p className="text-xs text-red-400">{(errors[name] as any)?.message}</p>}
          </div>
        ))}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">Tizim roli</label>
          <div className="flex gap-1.5">
            {[
              { val: "cashier", label: "Kassir" },
              { val: "manager", label: "Menejer" },
              { val: "admin", label: "Admin" },
            ].map(({ val, label }) => (
              <button key={val} type="button" onClick={() => setValue("role", val as any)}
                className="flex-1 py-2 rounded-xl text-xs font-medium transition-all"
                style={role === val
                  ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }>{label}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center gap-2">
          <KeyRound className="h-4 w-4 text-indigo-400" />
          <p className="text-xs font-semibold text-indigo-300">Tizimga kirish paroli</p>
        </div>
        <div className="relative">
          <input {...register("password")} type={showPassword ? "text" : "password"}
            placeholder={employee ? "Yangi parol (o'zgartirmasangiz bo'sh qoldiring)" : "Parol kiriting (kamida 6 ta belgi)"}
            className={inputCls} />
          <button type="button" onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">Bekor</button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {isPending ? "Saqlanmoqda..." : employee ? "Yangilash" : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}

export default function Employees() {
  const [activeTab, setActiveTab] = useState<EmpTab>("xodimlar");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editEmp, setEditEmp] = useState<Employee | null>(null);

  const { data, isLoading } = useListEmployees();
  const deleteMutation = useDeleteEmployee();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Current user's role — `salary` and the "Maosh" tab are admin-only.
  const meQuery = useQuery({ queryKey: ["me-role"], queryFn: fetchMe, retry: false });
  const isAdmin =
    meQuery.data?.role === "admin" || meQuery.data?.role === "super_admin";

  const employees = data || [];
  const total = employees.length;
  const active = employees.filter((e) => e.isActive).length;

  const handleDelete = (id: number) => {
    if (confirm("Xodimni o'chirishni tasdiqlaysizmi?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
          toast({ title: "O'chirildi" });
        }
      });
    }
  };

  const roleLabel: Record<string, string> = { admin: "Admin", manager: "Menejer", cashier: "Kassir" };
  const roleColors: Record<string, { bg: string; text: string }> = {
    admin: { bg: 'rgba(99,102,241,0.15)', text: '#818cf8' },
    manager: { bg: 'rgba(16,185,129,0.12)', text: '#34d399' },
    cashier: { bg: 'rgba(255,255,255,0.06)', text: 'rgba(255,255,255,0.45)' },
  };

  const tabs = [
    { id: "xodimlar" as EmpTab, label: "Xodimlar", icon: Users },
    { id: "kpi" as EmpTab, label: "KPI Tahlil", icon: Target },
    { id: "davomiylik" as EmpTab, label: "Davomiylik", icon: Calendar },
    ...(isAdmin
      ? [{ id: "maosh" as EmpTab, label: "Maosh", icon: Award }]
      : []),
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Xodimlar</h1>
          <p className="text-xs text-white/30 mt-0.5">{total} ta xodim · {active} ta faol</p>
        </div>
        {activeTab === "xodimlar" && (
          <button onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
            <Plus className="h-4 w-4" /> Yangi xodim
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Jami xodimlar", value: total, color: "#6366f1" },
          { label: "Faol", value: active, color: "#10b981" },
          { label: "Oylik xarajat", value: `${employees.reduce((s, e) => s + (e.salary || 0), 0).toLocaleString()} so'm`, color: "#f59e0b" },
          { label: "O'rtacha maosh", value: employees.length ? `${Math.round(employees.reduce((s, e) => s + (e.salary || 0), 0) / employees.length).toLocaleString()} so'm` : "—", color: "#8b5cf6" },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-2xl p-4" style={card}>
            <p className="text-[10px] text-white/35 mb-1">{label}</p>
            <p className="text-lg font-extrabold" style={{ color }}>{value}</p>
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

      {/* Tab: Xodimlar */}
      {activeTab === "xodimlar" && (
        <div className="rounded-2xl overflow-hidden" style={card}>
          <Table>
            <TableHeader>
              <TableRow className="border-b border-white/5 hover:bg-transparent">
                {["XODIM", "ROL / LAVOZIM", "HOLAT", "MAOSH", "KIRISH", ""].map((h) => (
                  <TableHead key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider py-3">{h}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="py-12 text-center text-white/20 text-sm">Yuklanmoqda...</TableCell></TableRow>
              ) : employees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2 text-white/20">
                      <Users className="h-8 w-8" />
                      <p className="text-sm">Xodimlar yo'q</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                employees.map((emp) => {
                  const roleStyle = roleColors[emp.role] || roleColors.cashier;
                  return (
                    <TableRow key={emp.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                      <TableCell className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white/80">{emp.name}</p>
                            <p className="text-[10px] text-white/35">{emp.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium"
                            style={{ background: roleStyle.bg, color: roleStyle.text }}>
                            {roleLabel[emp.role] || emp.role}
                          </span>
                          {emp.position && <p className="text-[10px] text-white/35">{emp.position}</p>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium"
                          style={emp.isActive ? { background: 'rgba(16,185,129,0.12)', color: '#34d399' } : { background: 'rgba(239,68,68,0.1)', color: '#f87171' }}>
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: emp.isActive ? '#34d399' : '#f87171' }} />
                          {emp.isActive ? "Faol" : "Nofaol"}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm font-semibold text-white/60">
                        {emp.salary ? `${Number(emp.salary).toLocaleString()} so'm` : "—"}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center gap-1 text-[10px] text-white/30">
                          <KeyRound className="h-3 w-3" /> Email
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => setEditEmp(emp)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={() => handleDelete(emp.id)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Tab: KPI */}
      {activeTab === "kpi" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Umumiy sotuv (oy)", value: 0, color: "#6366f1" },
              { label: "Umumiy daromad", value: "0 so'm", color: "#10b981" },
              { label: "O'rtacha reyting", value: "— ⭐", color: "#f59e0b" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4" style={card}>
                <p className="text-[10px] text-white/35 mb-1">{label}</p>
                <p className="text-lg font-extrabold" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white/75">Xodimlar KPI — {new Date().toLocaleString("uz-UZ", { month: "long", year: "numeric" })}</h3>
            </div>
            <div className="py-14 text-center">
              <TrendingUp className="h-10 w-10 mx-auto text-white/10 mb-3" />
              <p className="text-sm font-medium text-white/35">KPI ma'lumotlari yo'q</p>
              <p className="text-xs text-white/20 mt-1">Xodimlar sotuvlari kirilgandan keyin ko'rinadi</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Davomiylik */}
      {activeTab === "davomiylik" && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Keldi (bugun)", value: 0, color: "#10b981" },
              { label: "Kech keldi", value: 0, color: "#f59e0b" },
              { label: "Kelmadi", value: 0, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-2xl p-4 text-center" style={{ background: `${color}10`, border: `1px solid ${color}20` }}>
                <p className="text-2xl font-extrabold" style={{ color }}>{value}</p>
                <p className="text-[11px] text-white/40 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5">
              <h3 className="text-sm font-semibold text-white/75">Bu hafta davomiylik</h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3 pl-28">
                {DAYS.map(d => (
                  <span key={d} className="flex-1 text-center text-[10px] font-semibold text-white/30 uppercase">{d}</span>
                ))}
              </div>
              <div className="py-10 text-center">
                <CheckSquare className="h-10 w-10 mx-auto text-white/10 mb-3" />
                <p className="text-sm font-medium text-white/35">Davomiylik ma'lumotlari yo'q</p>
                <p className="text-xs text-white/20 mt-1">Xodimlar qo'shilgandan keyin davomiylik ko'rinadi</p>
              </div>
              <div className="flex items-center gap-4 mt-4 pt-3 border-t border-white/5">
                <div className="flex items-center gap-1.5"><CheckSquare className="h-3.5 w-3.5 text-emerald-400" /><span className="text-[10px] text-white/40">Keldi</span></div>
                <div className="flex items-center gap-1.5"><MinusSquare className="h-3.5 w-3.5 text-amber-400" /><span className="text-[10px] text-white/40">Kech keldi</span></div>
                <div className="flex items-center gap-1.5"><XSquare className="h-3.5 w-3.5 text-red-400" /><span className="text-[10px] text-white/40">Kelmadi</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Maosh */}
      {activeTab === "maosh" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl p-4" style={card}>
              <p className="text-[10px] text-white/35 mb-1">Oy uchun jami maosh</p>
              <p className="text-xl font-extrabold text-indigo-400">0 so'm</p>
            </div>
            <div className="rounded-2xl p-4" style={card}>
              <p className="text-[10px] text-white/35 mb-1">Jami bonus</p>
              <p className="text-xl font-extrabold text-emerald-400">0 so'm</p>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden" style={card}>
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white/75">Maosh hisobi — {new Date().toLocaleString("uz-UZ", { month: "long", year: "numeric" })}</h3>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">Hisoblash</button>
            </div>
            <div className="py-14 text-center">
              <Award className="h-10 w-10 mx-auto text-white/10 mb-3" />
              <p className="text-sm font-medium text-white/35">Maosh ma'lumotlari yo'q</p>
              <p className="text-xs text-white/20 mt-1">Xodimlar qo'shilgandan keyin maosh hisob-kitobi ko'rinadi</p>
            </div>
            <div className="p-4 border-t border-white/5 flex justify-end">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <Award className="h-4 w-4" /> Maosh to'lash
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[520px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Users className="h-4 w-4 text-indigo-400" />Yangi xodim qo'shish</DialogTitle></DialogHeader>
          <EmpForm isAdmin={isAdmin} onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>
      <Dialog open={!!editEmp} onOpenChange={(o) => !o && setEditEmp(null)}>
        <DialogContent className="sm:max-w-[520px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Edit className="h-4 w-4 text-indigo-400" />Xodimni tahrirlash</DialogTitle></DialogHeader>
          {editEmp && <EmpForm isAdmin={isAdmin} employee={editEmp} onSuccess={() => setEditEmp(null)} onCancel={() => setEditEmp(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
