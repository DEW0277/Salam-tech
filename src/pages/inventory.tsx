import { useState } from "react";
import {
  useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useListCategories, Product
} from "@/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, Edit, Trash2, Package, AlertTriangle, CheckCircle, Boxes, TrendingDown, Tag } from "lucide-react";

const productSchema = z.object({
  name: z.string().min(2, "Nomi kerak"),
  barcode: z.string().optional(),
  purchasePrice: z.coerce.number().min(0),
  sellingPrice: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().min(0),
  lowStockThreshold: z.coerce.number().min(0),
  unit: z.string().min(1, "O'lchov birligi kerak"),
  description: z.string().optional(),
  categoryId: z.coerce.number().optional(),
});

type FormData = z.infer<typeof productSchema>;

const inputCls = "w-full h-10 px-3 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 transition-colors st-input";
const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };

function ProductForm({ product, onSuccess, onCancel }: { product?: Product; onSuccess: () => void; onCancel: () => void }) {
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const { data: categoriesData } = useListCategories();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const categories = categoriesData || [];

  const form = useForm<FormData>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? {
      name: product.name,
      barcode: product.barcode || "",
      purchasePrice: product.purchasePrice,
      sellingPrice: product.sellingPrice,
      stockQuantity: product.stockQuantity,
      lowStockThreshold: product.lowStockThreshold,
      unit: product.unit,
      description: product.description || "",
      categoryId: (product as any).categoryId || undefined,
    } : {
      name: "", barcode: "", purchasePrice: 0, sellingPrice: 0,
      stockQuantity: 0, lowStockThreshold: 10, unit: "dona", description: "", categoryId: undefined,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const selectedCatId = watch("categoryId");

  const onSubmit = (values: FormData) => {
    const payload: any = { ...values };
    if (!payload.categoryId) delete payload.categoryId;

    const opts = {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/products"] });
        toast({ title: product ? "Yangilandi" : "Qo'shildi" });
        onSuccess();
      },
      onError: () => toast({ title: "Xatolik", variant: "destructive" }),
    };
    if (product) updateMutation.mutate({ id: product.id, data: payload }, opts);
    else createMutation.mutate({ data: payload }, opts);
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  const Field = ({ label, name, type = "text", placeholder, full }: {
    label: string; name: keyof FormData; type?: string; placeholder?: string; full?: boolean;
  }) => (
    <div className={`space-y-1.5 ${full ? "col-span-2" : ""}`}>
      <label className="text-xs font-medium text-white/50 uppercase tracking-wider">{label}</label>
      <input {...register(name)} type={type} placeholder={placeholder} className={inputCls} />
      {errors[name] && <p className="text-xs text-red-400">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Nomi *" name="name" placeholder="Mahsulot nomi" full />
        <Field label="Shtrix kod" name="barcode" placeholder="123456789" />

        {/* O'lchov birligi selector */}
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider">O'lchov birligi *</label>
          <div className="flex flex-wrap gap-2">
            {["Dona", "Kg", "Gramm", "Litr", "Metr", "Quti", "To'p", "Juft"].map((u) => {
              const val = watch("unit");
              const active = val?.toLowerCase() === u.toLowerCase();
              return (
                <button key={u} type="button"
                  onClick={() => setValue("unit", u.toLowerCase())}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={active
                    ? { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', boxShadow: '0 0 12px rgba(99,102,241,0.35)' }
                    : { background: 'var(--st-surface-2)', border: '1px solid var(--st-border)', color: 'var(--st-text-muted)' }
                  }>
                  {u}
                </button>
              );
            })}
          </div>
          {errors.unit && <p className="text-xs text-red-400">{errors.unit.message}</p>}
        </div>
        <Field label="Olish narxi" name="purchasePrice" type="number" placeholder="0" />
        <Field label="Sotish narxi" name="sellingPrice" type="number" placeholder="0" />
        <Field label="Mavjud miqdor" name="stockQuantity" type="number" placeholder="0" />
        <Field label="Minimal chegara" name="lowStockThreshold" type="number" placeholder="10" />

        {/* Category selector */}
        <div className="col-span-2 space-y-1.5">
          <label className="text-xs font-medium text-white/50 uppercase tracking-wider flex items-center gap-1.5">
            <Tag className="h-3 w-3" />
            Kategoriya
          </label>
          {categories.length === 0 ? (
            <p className="text-xs text-white/30 py-2">Kategoriyalar yo'q — avval sozlamalardan qo'shing</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button type="button"
                onClick={() => setValue("categoryId", undefined as any)}
                className="h-8 px-3 rounded-xl text-xs font-medium transition-all"
                style={!selectedCatId
                  ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }>
                Tanlmasiz
              </button>
              {categories.map((cat) => (
                <button key={cat.id} type="button"
                  onClick={() => setValue("categoryId", cat.id)}
                  className="h-8 px-3 rounded-xl text-xs font-medium transition-all"
                  style={selectedCatId === cat.id
                    ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.4)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                  }>
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">
          Bekor qilish
        </button>
        <button type="submit" disabled={isPending}
          className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          {isPending ? "Saqlanmoqda..." : "Saqlash"}
        </button>
      </div>
    </form>
  );
}

export default function Inventory() {
  const [search, setSearch] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);

  // ✅ Fixed: params passed directly (not wrapped in { query: ... })
  const { data, isLoading } = useListProducts(
    activeCategoryId
      ? { search: search || undefined, categoryId: activeCategoryId }
      : { search: search || undefined }
  );
  const { data: categoriesData } = useListCategories();
  const deleteMutation = useDeleteProduct();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const products = data?.products || [];
  const categories = categoriesData || [];
  const total = products.length;
  const lowStock = products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length;
  const totalValue = products.reduce((s, p) => s + p.sellingPrice * p.stockQuantity, 0);

  const handleDelete = (id: number) => {
    if (confirm("Rostdan ham o'chirmoqchimisiz?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/products"] });
          toast({ title: "O'chirildi" });
        },
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold" style={{ color: 'var(--st-text)' }}>Inventar</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--st-text-dim)' }}>{total} ta mahsulot · {totalValue.toLocaleString()} so'm qiymat</p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              <Plus className="h-4 w-4" /> Mahsulot
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[580px] bg-[#0d0d14] border-white/10 max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle className="text-white">Yangi mahsulot</DialogTitle></DialogHeader>
            <ProductForm onSuccess={() => setIsAddOpen(false)} onCancel={() => setIsAddOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Jami mahsulot", value: `${total} ta`, icon: Boxes, color: "text-indigo-400", bg: "rgba(99,102,241,0.1)" },
          { label: "Kam qolgan", value: `${lowStock} ta`, icon: TrendingDown, color: "text-amber-400", bg: "rgba(251,191,36,0.08)" },
          { label: "Umumiy qiymat", value: `${totalValue.toLocaleString()}`, icon: Package, color: "text-cyan-400", bg: "rgba(34,211,238,0.08)" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-2xl p-4" style={card}>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
              <div>
                <p className="text-[11px]" style={{ color: 'var(--st-text-muted)' }}>{label}</p>
                <p className={`text-lg font-extrabold ${color}`}>{value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + category filter */}
      <div className="flex flex-col gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: 'var(--st-text-dim)' }} />
          <input placeholder="Nomi yoki shtrix-kod bilan qidirish..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl text-sm outline-none focus:ring-1 focus:ring-indigo-500/50 st-input" />
        </div>
        {categories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setActiveCategoryId(null)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={activeCategoryId === null
                ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: 'white' }
                : { background: 'var(--st-surface)', border: '1px solid var(--st-border)', color: 'var(--st-text-muted)' }
              }>
              Barchasi
            </button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                style={activeCategoryId === cat.id
                  ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: 'white' }
                  : { background: 'var(--st-surface)', border: '1px solid var(--st-border)', color: 'var(--st-text-muted)' }
                }>
                {cat.name}
                {cat.productCount !== undefined && <span className="ml-1 opacity-50">({cat.productCount})</span>}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Table — horizontal scroll on mobile */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--st-border)' }}>
                {["MAHSULOT", "KATEGORIYA", "STOK", "TANNARX", "NARX", "HOLAT", ""].map((h) => (
                  <th key={h} className="text-[10px] font-semibold uppercase tracking-wider py-3 px-4 text-left"
                    style={{ color: 'var(--st-text-dim)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} className="py-16 text-center text-sm"
                  style={{ color: 'var(--st-text-faint)' }}>Yuklanmoqda...</td></tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2" style={{ color: 'var(--st-text-dim)' }}>
                      <Package className="h-8 w-8" />
                      <p className="text-sm">Mahsulotlar topilmadi</p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map((product) => {
                  const isLow = product.stockQuantity <= product.lowStockThreshold;
                  return (
                    <tr key={product.id} className="transition-colors"
                      style={{ borderBottom: '1px solid var(--st-border)' }}
                      onMouseEnter={e => (e.currentTarget.style.background = 'var(--st-hover)')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: 'rgba(99,102,241,0.1)' }}>
                            <Package className="h-3.5 w-3.5 text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--st-text-2)' }}>{product.name}</p>
                            {product.barcode && <p className="text-[10px] font-mono" style={{ color: 'var(--st-text-dim)' }}>{product.barcode}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {(product as any).categoryName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                            style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8' }}>
                            <Tag className="h-2.5 w-2.5" />
                            {(product as any).categoryName}
                          </span>
                        ) : (
                          <span className="text-xs" style={{ color: 'var(--st-text-dim)' }}>—</span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-bold text-sm" style={{ color: 'var(--st-text-2)' }}>{product.stockQuantity} {product.unit}</td>
                      <td className="py-3 px-4 text-sm" style={{ color: 'var(--st-text-muted)' }}>{product.purchasePrice.toLocaleString()}</td>
                      <td className="py-3 px-4 text-sm font-semibold text-indigo-400">{product.sellingPrice.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                            <AlertTriangle className="h-2.5 w-2.5" /> Kam
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#34d399', border: '1px solid rgba(16,185,129,0.2)' }}>
                            <CheckCircle className="h-2.5 w-2.5" /> Yetarli
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Dialog open={editProduct?.id === product.id} onOpenChange={(o) => !o && setEditProduct(null)}>
                            <DialogTrigger asChild>
                              <button onClick={() => setEditProduct(product)}
                                className="h-7 w-7 rounded-lg flex items-center justify-center hover:text-indigo-400 hover:bg-indigo-500/10 transition-all"
                                style={{ color: 'var(--st-text-dim)' }}>
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[580px] bg-[#0d0d14] border-white/10 max-h-[90vh] overflow-y-auto">
                              <DialogHeader><DialogTitle className="text-white">Tahrirlash</DialogTitle></DialogHeader>
                              {editProduct?.id === product.id && (
                                <ProductForm product={product} onSuccess={() => setEditProduct(null)} onCancel={() => setEditProduct(null)} />
                              )}
                            </DialogContent>
                          </Dialog>
                          <button onClick={() => handleDelete(product.id)}
                            className="h-7 w-7 rounded-lg flex items-center justify-center hover:text-red-400 hover:bg-red-500/10 transition-all"
                            style={{ color: 'var(--st-text-dim)' }}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
