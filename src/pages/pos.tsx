import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { useListProducts, useListCategories, useCreateSale, Product, SalePaymentMethod, Sale } from "@/api-client";
import { Search, Barcode, Trash2, Plus, Minus, CreditCard, Banknote, Receipt, ShoppingCart, Zap, Tag, Grid3X3, X, Printer, CheckCircle2, SplitSquareHorizontal, UserCheck, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { QRCodeSVG } from "qrcode.react";

type CartItem = Product & { cartQuantity: number };
type SimpleCustomer = { id: number; name: string; phone?: string };

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const cartCard = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Naqd pul",
  card: "Plastik karta",
  mixed: "Aralash",
  credit: "Qarzga",
};

const getToken = () => localStorage.getItem("salam_tech_token");

function ReceiptModal({ sale, onClose }: { sale: Sale; onClose: () => void }) {
  const printRef = useRef<HTMLDivElement>(null);

  const qrData = JSON.stringify({
    chek: sale.receiptNumber,
    sana: new Date(sale.createdAt).toLocaleDateString("uz-UZ"),
    jami: sale.total,
    tolov: PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod,
  });

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8" />
        <title>Chek — ${sale.receiptNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Courier New', monospace; font-size: 12px; color: #000; background: #fff; padding: 16px; width: 300px; margin: 0 auto; }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .lg { font-size: 15px; }
          .sm { font-size: 10px; color: #444; }
          .divider { border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 3px 0; }
          .total-row { display: flex; justify-content: space-between; margin: 4px 0; font-size: 14px; font-weight: bold; }
          .qr-wrap { text-align: center; margin-top: 12px; }
          .qr-wrap svg { width: 100px; height: 100px; }
          .items-header { display: flex; justify-content: space-between; font-size: 10px; color: #666; margin-bottom: 4px; }
        </style>
      </head>
      <body>
        ${content.innerHTML}
      </body>
      </html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 300);
  };

  const date = new Date(sale.createdAt);
  const dateStr = date.toLocaleDateString("uz-UZ");
  const timeStr = date.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl" style={{ background: 'hsl(230 22% 9%)', border: '1px solid rgba(255,255,255,0.1)' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <div className="flex items-center gap-2">
            {sale.paymentMethod === "credit"
              ? <UserCheck className="h-5 w-5 text-red-400" />
              : <CheckCircle2 className="h-5 w-5 text-green-400" />
            }
            <span className="font-bold text-white">
              {sale.paymentMethod === "credit" ? "Qarz yozildi" : "Savdo yakunlandi"}
            </span>
          </div>
          <button onClick={onClose} className="h-7 w-7 flex items-center justify-center rounded-lg text-white/30 hover:text-white hover:bg-white/8 transition-all">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Receipt body (screen) */}
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {/* Printable content (hidden div used for printing) */}
          <div ref={printRef} style={{ display: 'none' }}>
            <div className="center bold lg">SALAM TECH</div>
            <div className="center sm">Biznes boshqaruv tizimi</div>
            <div className="divider" />
            <div className="center bold">SAVDO CHEKI</div>
            <div className="center sm">#{sale.receiptNumber}</div>
            <div className="center sm">{dateStr} · {timeStr}</div>
            <div className="divider" />
            <div className="items-header"><span>Mahsulot</span><span>Miqdor × Narx = Jami</span></div>
            {sale.items.map((item) => (
              <div key={item.id} className="row">
                <span style={{ maxWidth: '150px', wordBreak: 'break-word' }}>{item.productName}</span>
                <span>{item.quantity} × {item.unitPrice.toLocaleString()} = {item.total.toLocaleString()}</span>
              </div>
            ))}
            <div className="divider" />
            {sale.discount > 0 && (
              <div className="row"><span>Chegirma:</span><span>-{sale.discount.toLocaleString()} so'm</span></div>
            )}
            <div className="total-row"><span>JAMI:</span><span>{sale.total.toLocaleString()} so'm</span></div>
            <div className="row"><span>To'lov:</span><span>{PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}</span></div>
            <div className="divider" />
            <div className="qr-wrap">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                {/* QR placeholder for print — real QR shown in modal */}
              </svg>
            </div>
            <div className="center sm" style={{ marginTop: '4px' }}>Chek: {sale.receiptNumber}</div>
            <div className="divider" />
            <div className="center sm">Xarid uchun rahmat!</div>
            <div className="center sm">SALAM TECH • salamtech.uz</div>
          </div>

          {/* Visual receipt (shown in modal) */}
          <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {/* Company header */}
            <div className="text-center py-4 px-4 border-b border-white/6">
              <div className="h-9 w-9 rounded-xl flex items-center justify-center mx-auto mb-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                <span className="text-white font-extrabold text-xs">ST</span>
              </div>
              <p className="font-bold text-white text-sm">SALAM TECH</p>
              <p className="text-[10px] text-white/30 mt-0.5">Biznes boshqaruv tizimi</p>
            </div>

            {/* Receipt meta */}
            <div className="px-4 py-3 border-b border-dashed border-white/10">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">Chek raqami</span>
                <span className="text-white font-mono font-semibold">#{sale.receiptNumber}</span>
              </div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-white/40">Sana</span>
                <span className="text-white/70">{dateStr}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Vaqt</span>
                <span className="text-white/70">{timeStr}</span>
              </div>
            </div>

            {/* Items */}
            <div className="px-4 py-3 border-b border-dashed border-white/10 space-y-2">
              <p className="text-[10px] text-white/30 uppercase tracking-wider mb-2">Mahsulotlar</p>
              {sale.items.map((item) => (
                <div key={item.id} className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-white/80 font-medium leading-snug">{item.productName}</p>
                    <p className="text-[10px] text-white/35 mt-0.5">{item.quantity} × {item.unitPrice.toLocaleString()} so'm</p>
                  </div>
                  <span className="text-xs font-semibold text-indigo-300 flex-shrink-0">{item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="px-4 py-3 border-b border-dashed border-white/10 space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-white/40">Jami (chegirmasiz)</span>
                <span className="text-white/60">{sale.subtotal.toLocaleString()} so'm</span>
              </div>
              {sale.discount > 0 && (
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Chegirma</span>
                  <span className="text-green-400">−{sale.discount.toLocaleString()} so'm</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/6">
                <span className="text-sm font-bold text-white">TO'LANADI</span>
                <span className="text-lg font-extrabold text-indigo-300">{sale.total.toLocaleString()} so'm</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/40">To'lov usuli</span>
                <span className="text-white/70">{PAYMENT_LABELS[sale.paymentMethod] || sale.paymentMethod}</span>
              </div>
              {sale.paymentMethod === "mixed" && sale.cashAmount != null && sale.cardAmount != null && (
                <div className="mt-1.5 rounded-lg p-2 space-y-1" style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.15)' }}>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1">💵 Naqd</span>
                    <span className="text-green-300 font-semibold">{sale.cashAmount.toLocaleString()} so'm</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-white/40 flex items-center gap-1">💳 Karta</span>
                    <span className="text-blue-300 font-semibold">{sale.cardAmount.toLocaleString()} so'm</span>
                  </div>
                </div>
              )}
            </div>

            {/* QR Code */}
            <div className="px-4 py-4 flex flex-col items-center gap-2 border-b border-dashed border-white/10">
              <div className="p-2 rounded-xl bg-white">
                <QRCodeSVG
                  value={qrData}
                  size={120}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#1a1a2e"
                />
              </div>
              <p className="text-[10px] text-white/30 text-center">Chek: <span className="font-mono text-white/50">#{sale.receiptNumber}</span></p>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 text-center">
              <p className="text-[10px] text-white/25">Xarid uchun rahmat!</p>
              <p className="text-[10px] text-white/20 mt-0.5">SALAM TECH • salamtech.uz</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-white/6 flex gap-3">
          <button onClick={handlePrint}
            className="flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.35)', color: 'white' }}>
            <Printer className="h-4 w-4" />
            Chop etish
          </button>
          <button onClick={onClose}
            className="flex-1 h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 16px rgba(99,102,241,0.35)' }}>
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Pos() {
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [barcode, setBarcode] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [globalDiscount, setGlobalDiscount] = useState(0);
  const [discountPct, setDiscountPct] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<SalePaymentMethod>("cash");
  const [splitCash, setSplitCash] = useState<string>("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [scanFlash, setScanFlash] = useState<"success" | "error" | null>(null);

  const [customers, setCustomers] = useState<SimpleCustomer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [customerSearch, setCustomerSearch] = useState("");
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false);

  useEffect(() => {
    if (paymentMethod !== "credit") return;
    fetch("/api/customers?limit=100", { headers: { Authorization: `Bearer ${getToken()}` } })
      .then(r => r.json())
      .then(d => setCustomers(d.customers || d || []))
      .catch(() => {});
  }, [paymentMethod]);

  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scanBufferRef = useRef<string>("");
  const scanTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastKeyTimeRef = useRef<number>(0);
  const productsRef = useRef<Product[]>([]);

  const { data: productsData, isLoading } = useListProducts(
    selectedCategoryId
      ? { search: search || undefined, categoryId: selectedCategoryId }
      : { search: search || undefined }
  );
  const { data: categoriesData } = useListCategories();
  const createSale = useCreateSale();

  const products = productsData?.products || [];
  const categories = categoriesData || [];

  useEffect(() => { productsRef.current = products; }, [products]);

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stockQuantity) {
          toast({ title: "Omborda yetarli emas", variant: "destructive" });
          return prev;
        }
        return prev.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQ = Math.max(1, Math.min(item.cartQuantity + delta, item.stockQuantity));
          return { ...item, cartQuantity: newQ };
        }
        return item;
      })
    );
  };

  const removeItem = (id: number) => setCart((prev) => prev.filter((item) => item.id !== id));

  const processScan = useCallback((code: string) => {
    const product = productsRef.current.find((p) => p.barcode === code);
    if (product) {
      addToCart(product);
      setScanFlash("success");
      setTimeout(() => setScanFlash(null), 800);
    } else {
      toast({ title: "Mahsulot topilmadi", description: `Kod: ${code}`, variant: "destructive" });
      setScanFlash("error");
      setTimeout(() => setScanFlash(null), 800);
    }
  }, [addToCart, toast]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      const isOtherInput = (tag === "input" || tag === "textarea") && target !== barcodeInputRef.current;
      if (isOtherInput) return;

      const now = Date.now();
      const gap = now - lastKeyTimeRef.current;
      lastKeyTimeRef.current = now;

      if (e.key === "Enter") {
        const code = scanBufferRef.current.trim();
        scanBufferRef.current = "";
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        if (code.length >= 3) processScan(code);
        return;
      }

      if (e.key.length === 1) {
        if (gap > 500 && scanBufferRef.current.length === 0) {
          scanBufferRef.current = e.key;
        } else if (gap <= 100) {
          scanBufferRef.current += e.key;
        } else {
          scanBufferRef.current = e.key;
        }
        if (scanTimerRef.current) clearTimeout(scanTimerRef.current);
        scanTimerRef.current = setTimeout(() => { scanBufferRef.current = ""; }, 150);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [processScan]);

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcode) return;
    processScan(barcode);
    setBarcode("");
  };

  const subtotal = useMemo(() => cart.reduce((s, i) => s + i.sellingPrice * i.cartQuantity, 0), [cart]);
  const total = useMemo(() => Math.max(0, subtotal - globalDiscount), [subtotal, globalDiscount]);

  useEffect(() => {
    if (discountPct !== null) {
      setGlobalDiscount(Math.round(subtotal * discountPct / 100));
    }
  }, [subtotal, discountPct]);

  const splitCashNum = parseFloat(splitCash) || 0;
  const splitCardNum = paymentMethod === "mixed" ? Math.max(0, total - splitCashNum) : 0;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (paymentMethod === "mixed" && (splitCashNum <= 0 || splitCashNum >= total)) {
      toast({ title: "Aralash to'lovda naqd summa noto'g'ri", description: `0 dan ${total.toLocaleString()} so'mgacha bo'lishi kerak`, variant: "destructive" });
      return;
    }
    if (paymentMethod === "credit" && !selectedCustomerId) {
      toast({ title: "Mijozni tanlang", description: "Qarzga sotish uchun mijoz kerak", variant: "destructive" });
      return;
    }
    createSale.mutate({
      data: {
        items: cart.map(item => ({ productId: item.id, quantity: item.cartQuantity, discount: 0 })),
        discount: globalDiscount,
        paymentMethod,
        customerId: paymentMethod === "credit" ? selectedCustomerId ?? undefined : undefined,
        cashAmount: paymentMethod === "mixed" ? splitCashNum : paymentMethod === "cash" ? total : null,
        cardAmount: paymentMethod === "mixed" ? splitCardNum : paymentMethod === "card" ? total : null,
      }
    }, {
      onSuccess: (sale) => {
        setCompletedSale(sale);
        setCart([]);
        setGlobalDiscount(0);
        setDiscountPct(null);
        setSearch("");
        setSplitCash("");
        setShowMobileCart(false);
        setSelectedCustomerId(null);
        setCustomerSearch("");
      },
      onError: () => toast({ title: "Xatolik yuz berdi", variant: "destructive" }),
    });
  };

  const renderCart = (isMobile = false) => (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <ShoppingCart className="h-4 w-4 text-indigo-400" />
          <span className="font-semibold text-white text-sm">Savat</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">{cart.length} ta mahsulot</span>
          {isMobile && (
            <button onClick={() => setShowMobileCart(false)} className="h-6 w-6 flex items-center justify-center text-white/30 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-2">
        {cart.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 py-10">
            <div className="h-14 w-14 rounded-2xl bg-white/4 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white/20" />
            </div>
            <div className="text-center">
              <p className="text-sm text-white/30 font-medium">Savat bo'sh</p>
              <p className="text-xs text-white/15 mt-0.5">Skaner bilan yoki bosib qo'shing</p>
            </div>
          </div>
        ) : (
          <div className="space-y-2 py-1">
            {cart.map((item) => (
              <div key={item.id} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-medium text-white/80 leading-snug flex-1 line-clamp-2">{item.name}</p>
                  <button onClick={() => removeItem(item.id)} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0 mt-0.5">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button onClick={() => updateQuantity(item.id, -1)}
                      className="h-6 w-6 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-white">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)}
                      className="h-6 w-6 rounded-lg text-white/50 hover:text-white hover:bg-white/10 flex items-center justify-center transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="text-sm font-bold text-indigo-300">
                    {(item.sellingPrice * item.cartQuantity).toLocaleString()} so'm
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="px-4 py-4 border-t border-white/5 space-y-3">
        {/* Smart Discount */}
        <div className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-indigo-300 flex items-center gap-1">
              <Tag className="h-3 w-3" /> Smart Chegirma
            </span>
            <span className="text-[10px]" style={{ color: globalDiscount > 0 ? '#a5b4fc' : 'rgba(255,255,255,0.3)' }}>
              {globalDiscount > 0 ? `−${globalDiscount.toLocaleString()} so'm` : "Aktiv emas"}
            </span>
          </div>
          <div className="flex gap-1.5">
            {[5, 10, 15, 20].map(pct => {
              const isActive = discountPct === pct;
              return (
                <button key={pct}
                  onClick={() => {
                    if (isActive) {
                      setDiscountPct(null);
                      setGlobalDiscount(0);
                    } else {
                      setDiscountPct(pct);
                      setGlobalDiscount(Math.round(subtotal * pct / 100));
                    }
                  }}
                  className="flex-1 py-1.5 rounded-lg text-[11px] font-semibold transition-all"
                  style={isActive
                    ? { background: 'rgba(99,102,241,0.40)', border: '1px solid rgba(99,102,241,0.6)', color: 'white' }
                    : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.55)' }
                  }>{pct}%</button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="0"
              value={discountPct === null && globalDiscount > 0 ? globalDiscount : discountPct === null ? "" : ""}
              onChange={(e) => {
                const val = e.target.value === "" ? 0 : Math.max(0, Number(e.target.value));
                setDiscountPct(null);
                setGlobalDiscount(val);
              }}
              placeholder={discountPct !== null ? `${globalDiscount.toLocaleString()} so'm (${discountPct}%)` : "Miqdor (so'm)"}
              className="flex-1 h-8 rounded-lg px-3 text-right text-sm text-white outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}
            />
            {globalDiscount > 0 && (
              <button onClick={() => { setGlobalDiscount(0); setDiscountPct(null); }}
                className="h-8 px-2.5 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0">
                O'chirish
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between py-2 border-y border-white/5">
          <span className="text-sm font-semibold text-white/60">To'lanadi</span>
          <span className="text-xl font-extrabold text-indigo-300">{total.toLocaleString()} so'm</span>
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {([
            { method: "cash" as SalePaymentMethod, label: "Naqd", icon: Banknote },
            { method: "card" as SalePaymentMethod, label: "Karta", icon: CreditCard },
            { method: "mixed" as SalePaymentMethod, label: "Aralash", icon: SplitSquareHorizontal },
            { method: "credit" as SalePaymentMethod, label: "Qarz", icon: UserCheck },
          ] as { method: SalePaymentMethod; label: string; icon: typeof Banknote }[]).map(({ method, label, icon: Icon }) => (
            <button key={method} onClick={() => { setPaymentMethod(method); setSplitCash(""); setSelectedCustomerId(null); setCustomerSearch(""); }}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs font-medium transition-all"
              style={paymentMethod === method
                ? method === "credit"
                  ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.45)', color: 'white' }
                  : { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.5)', color: 'white' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.35)' }
              }>
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* Credit (Qarz) customer selector */}
        {paymentMethod === "credit" && (
          <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <div className="flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-red-400" />
              <span className="text-[11px] font-semibold text-red-300">Qarzga sotish — Mijoz tanlang</span>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Mijoz qidirish..."
                value={customerSearch}
                onChange={e => { setCustomerSearch(e.target.value); setShowCustomerDropdown(true); }}
                onFocus={() => setShowCustomerDropdown(true)}
                className="w-full h-9 px-3 rounded-lg text-xs font-medium text-white placeholder:text-white/25 outline-none"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(239,68,68,0.3)' }}
              />
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30 pointer-events-none" />
              {showCustomerDropdown && (
                <div className="absolute z-20 top-full mt-1 left-0 right-0 rounded-xl overflow-hidden shadow-xl"
                  style={{ background: 'hsl(230 22% 10%)', border: '1px solid rgba(255,255,255,0.1)', maxHeight: '160px', overflowY: 'auto' }}>
                  {customers.filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase()) || (c.phone || '').includes(customerSearch)).map(c => (
                    <button key={c.id} onClick={() => { setSelectedCustomerId(c.id); setCustomerSearch(c.name); setShowCustomerDropdown(false); }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs hover:bg-white/6 transition-all text-left">
                      <span className="text-white/80 font-medium">{c.name}</span>
                      {c.phone && <span className="text-white/30">{c.phone}</span>}
                    </button>
                  ))}
                  {customers.filter(c => !customerSearch || c.name.toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                    <p className="text-center text-[11px] text-white/30 py-3">Mijoz topilmadi</p>
                  )}
                </div>
              )}
            </div>
            {selectedCustomerId && (
              <div className="flex items-center gap-2 text-[11px]">
                <div className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span className="text-red-300 font-medium">Qarz: {total.toLocaleString()} so'm → {customerSearch}</span>
              </div>
            )}
          </div>
        )}

        {/* Split payment panel */}
        {paymentMethod === "mixed" && (
          <div className="rounded-xl p-3 space-y-2.5" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
            <div className="flex items-center gap-1.5">
              <SplitSquareHorizontal className="h-3.5 w-3.5 text-amber-400" />
              <span className="text-[11px] font-semibold text-amber-300">Aralash to'lov</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-white/40 mb-1 flex items-center gap-1">
                  <Banknote className="h-3 w-3 text-green-400" /> Naqd (so'm)
                </label>
                <input
                  type="number"
                  min="0"
                  max={total - 1}
                  value={splitCash}
                  onChange={e => setSplitCash(e.target.value)}
                  placeholder="0"
                  className="w-full h-9 px-2.5 rounded-lg text-sm font-semibold text-white text-right outline-none focus:ring-1 focus:ring-amber-500/50 transition-all"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(245,158,11,0.25)' }}
                />
              </div>
              <div>
                <label className="text-[10px] text-white/40 mb-1 flex items-center gap-1">
                  <CreditCard className="h-3 w-3 text-blue-400" /> Karta (so'm)
                </label>
                <div className="w-full h-9 px-2.5 rounded-lg text-sm font-semibold text-right flex items-center justify-end"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', color: splitCardNum > 0 ? '#93c5fd' : 'rgba(255,255,255,0.2)' }}>
                  {splitCardNum > 0 ? splitCardNum.toLocaleString() : "—"}
                </div>
              </div>
            </div>
            {splitCashNum > 0 && splitCashNum < total && (
              <div className="flex items-center justify-between text-[10px] pt-1 border-t border-white/5">
                <span className="text-white/30">Jami tekshiruv:</span>
                <span style={{ color: Math.abs((splitCashNum + splitCardNum) - total) < 0.01 ? '#86efac' : '#fca5a5' }}>
                  {(splitCashNum + splitCardNum).toLocaleString()} / {total.toLocaleString()} so'm ✓
                </span>
              </div>
            )}
          </div>
        )}

        <button onClick={handleCheckout} disabled={cart.length === 0 || createSale.isPending}
          className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: paymentMethod === "credit"
              ? 'linear-gradient(135deg, #dc2626, #ef4444)'
              : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            boxShadow: cart.length > 0
              ? paymentMethod === "credit" ? '0 0 20px rgba(239,68,68,0.3)' : '0 0 20px rgba(99,102,241,0.35)'
              : 'none',
          }}>
          {createSale.isPending ? (
            <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : paymentMethod === "credit" ? (
            <><UserCheck className="h-4 w-4" />Qarzga yozish — {total.toLocaleString()} so'm</>
          ) : (
            <><Receipt className="h-4 w-4" />Sotish — {total.toLocaleString()} so'm</>
          )}
        </button>
      </div>
    </div>
  );

  return (
    <>
      <div className="flex flex-col md:flex-row gap-4 h-[calc(100vh-4rem)] -mt-2">
        {/* ── LEFT: Products ── */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 min-h-0">
          <div className="flex items-center justify-between flex-shrink-0">
            <h1 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              POS Kassa
              <span className={`h-2 w-2 rounded-full inline-block transition-colors duration-200 ${
                scanFlash === "success" ? "bg-green-300 shadow-[0_0_6px_2px_rgba(134,239,172,0.6)]"
                : scanFlash === "error" ? "bg-red-400 shadow-[0_0_6px_2px_rgba(239,68,68,0.5)]"
                : "bg-green-400"
              }`} />
              <span className={`text-xs font-normal hidden sm:inline transition-colors duration-200 ${
                scanFlash === "success" ? "text-green-300" : scanFlash === "error" ? "text-red-400" : "text-white/40"
              }`}>
                {scanFlash === "success" ? "Topildi ✓" : scanFlash === "error" ? "Topilmadi!" : "Skaner tayyor"}
              </span>
            </h1>
            <div className="text-xs text-white/30 font-mono">{new Date().toLocaleDateString('uz-UZ')}</div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-white/30" />
              <input placeholder="Nomi bo'yicha qidirish..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50"
                style={card} />
            </div>
            <form onSubmit={handleBarcodeSubmit} className="relative hidden sm:block flex-1">
              <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-400" />
              <input
                ref={barcodeInputRef}
                placeholder="Barcode + Enter"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full h-10 pl-9 pr-14 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/60 transition-all"
                style={{
                  background: scanFlash === "success" ? 'rgba(34,197,94,0.12)' : scanFlash === "error" ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.08)',
                  border: scanFlash === "success" ? '1px solid rgba(34,197,94,0.5)' : scanFlash === "error" ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(99,102,241,0.25)',
                }} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-mono bg-white/5 px-1.5 py-0.5 rounded">Enter</span>
            </form>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 flex-shrink-0" style={{ scrollbarWidth: 'none' }}>
            <button onClick={() => setSelectedCategoryId(null)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
              style={selectedCategoryId === null
                ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: 'white' }
                : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
              }>
              <Grid3X3 className="h-3 w-3" />
              Barchasi
            </button>
            {categories.map((cat) => (
              <button key={cat.id}
                onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
                className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-xs font-medium flex-shrink-0 transition-all"
                style={selectedCategoryId === cat.id
                  ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.45)', color: 'white' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.4)' }
                }>
                <Tag className="h-3 w-3" />
                {cat.name}
                {cat.productCount !== undefined && (
                  <span className="ml-1 opacity-50">{cat.productCount}</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto rounded-2xl min-h-0" style={card}>
            <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5">
              {isLoading ? (
                [...Array(8)].map((_, i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
              ) : products.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-white/20">
                  <ShoppingCart className="h-10 w-10 mb-3 opacity-30" />
                  <p className="text-sm">Mahsulotlar topilmadi</p>
                  {(search || selectedCategoryId) && (
                    <button onClick={() => { setSearch(""); setSelectedCategoryId(null); }}
                      className="mt-2 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                      Filtrlarni tozalash
                    </button>
                  )}
                </div>
              ) : (
                products.map((product) => {
                  const inCart = cart.find((i) => i.id === product.id);
                  const lowStock = product.stockQuantity <= product.lowStockThreshold;
                  return (
                    <button key={product.id} onClick={() => addToCart(product)}
                      className="group relative flex flex-col gap-2 p-3 rounded-xl text-left transition-all duration-150 hover:-translate-y-0.5"
                      style={{
                        background: inCart ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.04)',
                        border: inCart ? '1px solid rgba(99,102,241,0.35)' : '1px solid rgba(255,255,255,0.07)',
                      }}>
                      {inCart && (
                        <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] text-white font-bold">
                          {inCart.cartQuantity}
                        </div>
                      )}
                      <div className="h-8 w-8 rounded-lg bg-white/6 flex items-center justify-center">
                        <Tag className="h-4 w-4 text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/85 line-clamp-2 leading-snug">{product.name}</p>
                        <p className="text-[10px] text-white/30 mt-1">{product.stockQuantity} {product.unit}</p>
                        {product.categoryName && (
                          <p className="text-[10px] text-indigo-400/60 mt-0.5">{product.categoryName}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-indigo-300">{product.sellingPrice.toLocaleString()}</span>
                        {lowStock && <span className="text-[10px] text-red-400 font-medium">Kam</span>}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          <div className="md:hidden flex-shrink-0">
            <button onClick={() => setShowMobileCart(true)}
              className="w-full h-12 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
              <ShoppingCart className="h-4 w-4" />
              Savat ({cart.length})
              {cart.length > 0 && <span className="ml-1 opacity-75">· {total.toLocaleString()} so'm</span>}
            </button>
          </div>
        </div>

        {/* ── RIGHT: Cart (desktop) ── */}
        <div className="hidden md:flex w-[300px] xl:w-[340px] flex-shrink-0 flex-col rounded-2xl overflow-hidden" style={cartCard}>
          {renderCart(false)}
        </div>

        {/* Mobile cart overlay */}
        {showMobileCart && (
          <div className="md:hidden fixed inset-0 z-50 flex flex-col justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setShowMobileCart(false)} />
            <div className="relative rounded-t-2xl max-h-[85vh] flex flex-col overflow-hidden" style={{ background: 'hsl(230 22% 8%)' }}>
              {renderCart(true)}
            </div>
          </div>
        )}
      </div>

      {/* Receipt Modal */}
      {completedSale && (
        <ReceiptModal sale={completedSale} onClose={() => setCompletedSale(null)} />
      )}
    </>
  );
}
