import { useState } from "react";
import { useListSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier, Supplier } from "@/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Truck, Phone, Mail, MapPin, Package } from "lucide-react";

const supSchema = z.object({
  name: z.string().min(2, "Nomi kerak"),
  phone: z.string().optional(),
  email: z.string().optional(),
  address: z.string().optional(),
});

type FormData = z.infer<typeof supSchema>;

const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors";
const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };

function SupplierForm({ supplier, onSuccess, onCancel }: { supplier?: Supplier; onSuccess: () => void; onCancel: () => void }) {
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(supSchema),
    defaultValues: supplier ? {
      name: supplier.name,
      phone: supplier.phone || "",
      email: supplier.email || "",
      address: supplier.address || "",
    } : { name: "", phone: "", email: "", address: "" },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = (values: FormData) => {
    const opts = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
        toast({ title: supplier ? "Yangilandi" : "Qo'shildi" });
        onSuccess();
      },
      onError: () => toast({ title: "Xatolik", variant: "destructive" }),
    };
    if (supplier) updateMutation.mutate({ id: supplier.id, data: values }, opts);
    else createMutation.mutate({ data: values }, opts);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const Field = ({ label, name, type = "text", placeholder, icon: Icon }: {
    label: string; name: keyof FormData; type?: string; placeholder?: string; icon?: any;
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      <div className="relative">
        {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/25 pointer-events-none" />}
        <input {...register(name)} type={type} placeholder={placeholder}
          className={`${inputCls} ${Icon ? 'pl-9' : ''}`} />
      </div>
      {errors[name] && <p className="text-xs text-red-400">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Nomi *" name="name" placeholder="Kompaniya yoki shaxs nomi" />
      <div className="grid grid-cols-2 gap-3">
        <Field label="Telefon" name="phone" placeholder="+998 90 000 00 00" icon={Phone} />
        <Field label="Email" name="email" type="email" placeholder="info@company.uz" icon={Mail} />
      </div>
      <Field label="Manzil" name="address" placeholder="Shahar, ko'cha, uy" icon={MapPin} />

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">Bekor</button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {isPending ? "Saqlanmoqda..." : supplier ? "Yangilash" : "Qo'shish"}
        </button>
      </div>
    </form>
  );
}

export default function Suppliers() {
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editItem, setEditItem] = useState<Supplier | null>(null);
  const { data, isLoading } = useListSuppliers();
  const deleteMutation = useDeleteSupplier();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const suppliers = data || [];

  const handleDelete = (id: number) => {
    if (confirm("O'chirishni tasdiqlaysizmi?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/suppliers"] });
          toast({ title: "O'chirildi" });
        }
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Yetkazib beruvchilar</h1>
          <p className="text-xs text-white/30 mt-0.5">{suppliers.length} ta hamkor</p>
        </div>
        <button onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          <Plus className="h-4 w-4" /> Qo'shish
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-[10px] text-white/35 mb-1">Jami yetkazib beruvchilar</p>
          <p className="text-2xl font-extrabold text-white/80">{suppliers.length}</p>
        </div>
        <div className="rounded-2xl p-4" style={card}>
          <p className="text-[10px] text-white/35 mb-1">Faol hamkorlar</p>
          <p className="text-2xl font-extrabold text-indigo-400">{suppliers.length}</p>
        </div>
      </div>

      {/* Cards grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="rounded-2xl h-32 animate-pulse" style={card} />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="rounded-2xl py-16 flex flex-col items-center gap-2 text-white/20" style={card}>
          <Truck className="h-8 w-8" />
          <p className="text-sm">Yetkazib beruvchilar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((s) => (
            <div key={s.id} className="rounded-2xl p-4 group hover:border-white/10 transition-all" style={card}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.12)', color: '#818cf8' }}>
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white/85">{s.name}</p>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full text-white/30"
                      style={{ background: 'rgba(255,255,255,0.05)' }}>Faol</span>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditItem(s)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(s.id)}
                    className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5 border-t border-white/4 pt-3">
                {s.phone && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Phone className="h-3 w-3 text-white/20" />{s.phone}
                  </div>
                )}
                {s.email && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Mail className="h-3 w-3 text-white/20" />{s.email}
                  </div>
                )}
                {s.address && (
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <MapPin className="h-3 w-3 text-white/20" />{s.address}
                  </div>
                )}
                {!s.phone && !s.email && !s.address && (
                  <p className="text-xs text-white/20">Aloqa ma'lumotlari yo'q</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[460px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Truck className="h-4 w-4 text-indigo-400" />Yangi yetkazib beruvchi</DialogTitle></DialogHeader>
          <SupplierForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Edit dialog */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="sm:max-w-[460px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><Edit className="h-4 w-4 text-indigo-400" />Tahrirlash</DialogTitle></DialogHeader>
          {editItem && <SupplierForm supplier={editItem} onSuccess={() => setEditItem(null)} onCancel={() => setEditItem(null)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
