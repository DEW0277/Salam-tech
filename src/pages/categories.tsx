import { useState } from "react";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, Category } from "@/api-client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Tags, X, Package } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const catSchema = z.object({
  name: z.string().min(2, "Nomi kamida 2 harf bo'lishi kerak"),
  description: z.string().optional(),
});
type FormData = z.infer<typeof catSchema>;

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors";

function CatModal({ category, onClose }: { category?: Category; onClose: () => void }) {
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(catSchema),
    defaultValues: category
      ? { name: category.name, description: category.description || "" }
      : { name: "", description: "" },
  });

  const onSubmit = (values: FormData) => {
    const onSuccess = () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: category ? "Yangilandi" : "Kategoriya qo'shildi" });
      onClose();
    };
    if (category) {
      updateMutation.mutate({ id: category.id, data: values }, { onSuccess });
    } else {
      createMutation.mutate({ data: values }, { onSuccess });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
        style={{ background: 'hsl(230 22% 9%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2">
            <Tags className="h-4 w-4 text-indigo-400" />
            <span className="font-bold text-white text-sm">
              {category ? "Kategoriyani tahrirlash" : "Yangi kategoriya"}
            </span>
          </div>
          <button onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="px-5 py-5 space-y-4">
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Kategoriya nomi *</label>
            <input {...register("name")} placeholder="Masalan: Ichimliklar, Oziq-ovqat..."
              className={inputCls}
              style={{ background: 'rgba(255,255,255,0.05)', border: errors.name ? '1px solid rgba(239,68,68,0.5)' : '1px solid rgba(255,255,255,0.08)' }} />
            {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-xs text-white/50 mb-1.5 block">Tavsif (ixtiyoriy)</label>
            <input {...register("description")} placeholder="Qisqacha tavsif..."
              className={inputCls}
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }} />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 h-10 rounded-xl text-sm font-medium text-white/50 hover:text-white transition-all"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              Bekor qilish
            </button>
            <button type="submit" disabled={isPending}
              className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.3)' }}>
              {isPending ? "Saqlanmoqda..." : category ? "Yangilash" : "Qo'shish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Categories() {
  const [showAdd, setShowAdd] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);

  const { data, isLoading } = useListCategories();
  const deleteMutation = useDeleteCategory();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const categories = data || [];

  const handleDelete = (cat: Category) => {
    if (!confirm(`"${cat.name}" kategoriyasini o'chirasizmi?`)) return;
    deleteMutation.mutate({ id: cat.id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
        toast({ title: "O'chirildi" });
      },
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Tags className="h-5 w-5 text-indigo-400" />
            Kategoriyalar
          </h1>
          <p className="text-sm text-white/35 mt-0.5">Mahsulot turlarini boshqaring</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.25)' }}>
          <Plus className="h-4 w-4" />
          Yangi kategoriya
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl px-4 py-3" style={card}>
          <p className="text-xs text-white/40">Jami kategoriya</p>
          <p className="text-2xl font-bold text-white mt-1">{categories.length}</p>
        </div>
        <div className="rounded-2xl px-4 py-3" style={card}>
          <p className="text-xs text-white/40">Jami mahsulot</p>
          <p className="text-2xl font-bold text-indigo-300 mt-1">
            {categories.reduce((s, c) => s + (c.productCount || 0), 0)}
          </p>
        </div>
        <div className="hidden sm:block rounded-2xl px-4 py-3" style={card}>
          <p className="text-xs text-white/40">O'rtacha mahsulot</p>
          <p className="text-2xl font-bold text-white/70 mt-1">
            {categories.length ? Math.round(categories.reduce((s, c) => s + (c.productCount || 0), 0) / categories.length) : 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="grid grid-cols-[1fr_2fr_80px_80px] gap-0 border-b border-white/5">
          <div className="px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-wider">Kategoriya</div>
          <div className="px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-wider">Tavsif</div>
          <div className="px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-wider text-right">Mahsulot</div>
          <div className="px-4 py-3 text-[10px] font-semibold text-white/25 uppercase tracking-wider text-right">Amallar</div>
        </div>

        {isLoading ? (
          <div className="p-4 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
          </div>
        ) : categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Tags className="h-6 w-6 text-indigo-400/50" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/40 font-medium">Hali kategoriya yo'q</p>
              <p className="text-xs text-white/20 mt-0.5">Mahsulotlarni guruhlash uchun kategoriya qo'shing</p>
            </div>
            <button onClick={() => setShowAdd(true)}
              className="mt-1 h-9 px-5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)' }}>
              + Birinchi kategoriya
            </button>
          </div>
        ) : (
          categories.map((cat, idx) => (
            <div key={cat.id}
              className="grid grid-cols-[1fr_2fr_80px_80px] gap-0 items-center hover:bg-white/2 transition-colors"
              style={{ borderBottom: idx < categories.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
              <div className="px-4 py-3.5 flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
                  <Package className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <span className="text-sm font-semibold text-white/85">{cat.name}</span>
              </div>
              <div className="px-4 py-3.5">
                <span className="text-sm text-white/40">{cat.description || "—"}</span>
              </div>
              <div className="px-4 py-3.5 text-right">
                <span className="text-sm font-semibold text-indigo-300">{cat.productCount || 0}</span>
              </div>
              <div className="px-4 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1">
                  <button onClick={() => setEditCat(cat)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-white/25 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(cat)}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showAdd && <CatModal onClose={() => setShowAdd(false)} />}
      {editCat && <CatModal category={editCat} onClose={() => setEditCat(null)} />}
    </div>
  );
}
