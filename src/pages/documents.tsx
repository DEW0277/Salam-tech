import { useState, useRef, useEffect } from "react";
import { useListDocuments, useCreateDocument, useDeleteDocument } from "@/api-client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Plus, FileText, Trash2, PenTool, CheckCircle, Clock, XCircle,
  UploadCloud, Users, Eye, Download, Shield, ChevronRight,
  FileSignature, History, AlertCircle
} from "lucide-react";

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8";

const DOC_TYPES = [
  { value: "contract", label: "Shartnoma", color: "#6366f1" },
  { value: "invoice", label: "Invoice", color: "#10b981" },
  { value: "act", label: "Dalolatnoma", color: "#f59e0b" },
  { value: "other", label: "Akt", color: "#8b5cf6" },
];

const STATUS_CONFIG = {
  signed: { label: "Imzolandi", icon: CheckCircle, color: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
  waiting: { label: "Kutilmoqda", icon: Clock, color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
  rejected: { label: "Rad etildi", icon: XCircle, color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.25)" },
  draft: { label: "Qoralama", icon: FileText, color: "#6b7280", bg: "rgba(107,114,128,0.12)", border: "rgba(107,114,128,0.25)" },
};

type DocStatus = keyof typeof STATUS_CONFIG;

interface Signer { name: string; email: string; role: string; signed: boolean; signedAt?: string; ip?: string }
interface AuditEntry { action: string; by: string; at: string; ip: string }

// Signature Canvas component
function SignatureCanvas({ onSave, onCancel }: { onSave: (data: string) => void; onCancel: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.strokeStyle = "#a5b4fc";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const getPos = (e: React.MouseEvent | React.TouchEvent, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      return { x: (e.touches[0].clientX - rect.left) * scaleX, y: (e.touches[0].clientY - rect.top) * scaleY };
    }
    return { x: ((e as React.MouseEvent).clientX - rect.left) * scaleX, y: ((e as React.MouseEvent).clientY - rect.top) * scaleY };
  };

  const start = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    e.preventDefault();
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setDrawing(true);
    setIsEmpty(false);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    e.preventDefault();
    const pos = getPos(e, canvas);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stop = () => setDrawing(false);

  const clear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setIsEmpty(true);
  };

  const save = () => {
    const canvas = canvasRef.current;
    if (!canvas || isEmpty) return;
    onSave(canvas.toDataURL());
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(99,102,241,0.3)' }}>
        <canvas
          ref={canvasRef}
          width={500}
          height={200}
          className="w-full touch-none cursor-crosshair"
          onMouseDown={start} onMouseMove={draw} onMouseUp={stop} onMouseLeave={stop}
          onTouchStart={start} onTouchMove={draw} onTouchEnd={stop}
        />
      </div>
      <p className="text-center text-xs text-white/30">Imzoni bu yerga chizing</p>
      <div className="flex gap-2">
        <button onClick={clear} className="flex-1 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>Tozalash</button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-xl text-sm text-white/50 hover:text-white transition-all"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>Bekor</button>
        <button onClick={save} disabled={isEmpty}
          className="flex-1 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-30"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          Saqlash
        </button>
      </div>
    </div>
  );
}

// Create Document Modal
function CreateDocModal({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const createMutation = useCreateDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [step, setStep] = useState<"info" | "signers">("info");
  const [docType, setDocType] = useState("contract");
  const [docName, setDocName] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [signers, setSigners] = useState<Signer[]>([{ name: "", email: "", role: "Direktor", signed: false }]);

  const addSigner = () => setSigners([...signers, { name: "", email: "", role: "", signed: false }]);
  const removeSigner = (i: number) => setSigners(signers.filter((_, idx) => idx !== i));
  const updateSigner = (i: number, field: keyof Signer, val: string) => {
    setSigners(signers.map((s, idx) => idx === i ? { ...s, [field]: val } : s));
  };

  const submit = () => {
    if (!docName.trim()) return;
    const recipient = recipientId.trim().toUpperCase();
    if (recipient && !/^C-\d+$/.test(recipient)) {
      toast({
        title: "Noto'g'ri kompaniya ID",
        description: "Format: C-12345",
        variant: "destructive",
      });
      return;
    }
    createMutation.mutate({
      data: {
        name: docName,
        type: docType as any,
        size: 0,
        fileUrl: "",
        ...(recipient ? { recipientCompanyId: recipient } : {}),
      } as any,
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
        toast({
          title: "Hujjat yaratildi",
          description: recipient
            ? `"${docName}" ${recipient} kompaniyasiga yuborildi`
            : `"${docName}" imzolash uchun yuborildi`,
        });
        onSuccess();
      },
      onError: () =>
        toast({
          title: "Xatolik",
          description: "Hujjatni yaratib bo'lmadi. Kompaniya ID ni tekshiring.",
          variant: "destructive",
        }),
    });
  };

  return (
    <div className="space-y-5">
      {/* Steps indicator */}
      <div className="flex items-center gap-2">
        {[{ id: "info", label: "Hujjat ma'lumoti" }, { id: "signers", label: "Imzolovchilar" }].map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3 w-3 text-white/20" />}
            <button onClick={() => setStep(s.id as any)}
              className="flex items-center gap-1.5 text-xs font-medium transition-colors"
              style={{ color: step === s.id ? '#818cf8' : 'rgba(255,255,255,0.3)' }}>
              <span className="h-5 w-5 rounded-full flex items-center justify-center text-[10px]"
                style={{ background: step === s.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)' }}>
                {i + 1}
              </span>
              {s.label}
            </button>
          </div>
        ))}
      </div>

      {step === "info" ? (
        <>
          {/* Doc type */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Hujjat turi</label>
            <div className="grid grid-cols-4 gap-2">
              {DOC_TYPES.map((t) => (
                <button key={t.value} onClick={() => setDocType(t.value)}
                  className="py-2.5 rounded-xl text-xs font-medium transition-all"
                  style={docType === t.value
                    ? { background: `${t.color}25`, border: `1px solid ${t.color}50`, color: t.color }
                    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.4)' }
                  }>{t.label}</button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">Hujjat nomi *</label>
            <input value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="Masalan: Xizmat ko'rsatish shartnomasi №1"
              className={inputCls} />
          </div>

          {/* Cross-company send (optional) */}
          <div>
            <label className="text-xs text-white/50 uppercase tracking-wider block mb-2">
              Boshqa kompaniyaga yuborish (ixtiyoriy)
            </label>
            <input
              value={recipientId}
              onChange={(e) => setRecipientId(e.target.value)}
              placeholder="Qabul qiluvchi kompaniya ID — masalan: C-12345"
              className={inputCls}
            />
            <p className="text-[10px] text-white/25 mt-1">
              Bo'sh qoldirilsa, hujjat faqat sizning kompaniyangizda qoladi.
            </p>
          </div>

          {/* File upload area */}
          <div className="rounded-xl p-6 text-center cursor-pointer transition-all hover:bg-white/3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '2px dashed rgba(255,255,255,0.1)' }}>
            <UploadCloud className="h-8 w-8 mx-auto text-white/20 mb-2" />
            <p className="text-sm text-white/40">PDF yuklash uchun bosing yoki sudrang</p>
            <p className="text-xs text-white/20 mt-1">PDF, DOCX · Max 10MB</p>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">Bekor</button>
            <button onClick={() => setStep("signers")} disabled={!docName.trim()}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Keyingisi →
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs text-white/50 uppercase tracking-wider">Imzolovchilar</label>
              <button onClick={addSigner} className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
                <Plus className="h-3 w-3" /> Qo'shish
              </button>
            </div>
            {signers.map((signer, i) => (
              <div key={i} className="rounded-xl p-3 space-y-2" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white/40 font-medium">{i + 1}-imzolovchi</span>
                  {signers.length > 1 && (
                    <button onClick={() => removeSigner(i)} className="text-white/20 hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <input value={signer.name} onChange={(e) => updateSigner(i, "name", e.target.value)}
                    placeholder="Ism Familiya" className={inputCls} />
                  <input value={signer.email} onChange={(e) => updateSigner(i, "email", e.target.value)}
                    placeholder="email@mail.uz" className={inputCls} />
                  <input value={signer.role} onChange={(e) => updateSigner(i, "role", e.target.value)}
                    placeholder="Lavozim" className={inputCls} />
                </div>
              </div>
            ))}
          </div>

          {/* Signing order */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <p className="text-xs font-semibold text-indigo-300 mb-1">Imzolash tartibi</p>
            <div className="flex gap-3">
              {["Ketma-ket", "Bir vaqtda"].map((opt) => (
                <label key={opt} className="flex items-center gap-1.5 text-xs text-white/50 cursor-pointer">
                  <input type="radio" name="order" defaultChecked={opt === "Ketma-ket"} className="accent-indigo-500" />
                  {opt}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <button onClick={() => setStep("info")} className="px-4 py-2 rounded-xl text-sm text-white/50 hover:text-white hover:bg-white/5 transition-all">← Orqaga</button>
            <button onClick={submit} disabled={createMutation.isPending}
              className="px-5 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {createMutation.isPending ? "Yuborilmoqda..." : "Yuborish"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function Documents() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [signDocId, setSignDocId] = useState<number | null>(null);
  const [auditDocId, setAuditDocId] = useState<number | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");

  const { data, isLoading } = useListDocuments();
  const deleteMutation = useDeleteDocument();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const docs = data || [];

  // Simulate statuses for demo
  const getStatus = (id: number): DocStatus => {
    const statuses: DocStatus[] = ["waiting", "signed", "draft", "waiting", "rejected"];
    return statuses[id % statuses.length];
  };

  const handleDelete = (id: number) => {
    if (confirm("Hujjatni o'chirmoqchimisiz?")) {
      deleteMutation.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
          toast({ title: "O'chirildi" });
        }
      });
    }
  };

  const handleSign = (data: string) => {
    setSignDocId(null);
    toast({ title: "✓ Imzo qo'shildi", description: "Hujjat muvaffaqiyatli imzolandi" });
  };

  const stats = {
    total: docs.length,
    signed: docs.filter((_, i) => getStatus(i) === "signed").length,
    waiting: docs.filter((_, i) => getStatus(i) === "waiting").length,
    rejected: docs.filter((_, i) => getStatus(i) === "rejected").length,
  };

  const filters = [
    { id: "all", label: "Barchasi", count: stats.total },
    { id: "waiting", label: "Kutilmoqda", count: stats.waiting },
    { id: "signed", label: "Imzolandi", count: stats.signed },
    { id: "rejected", label: "Rad etildi", count: stats.rejected },
  ];

  const docTypeLabel: Record<string, string> = { contract: "Shartnoma", invoice: "Invoice", other: "Boshqa", act: "Akt" };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileSignature className="h-5 w-5 text-indigo-400" />
            E-Imzo va Hujjatlar
          </h1>
          <p className="text-xs text-white/30 mt-0.5">Elektron imzo, hujjat workflow va tasdiqlash</p>
        </div>
        <button onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.3)' }}>
          <Plus className="h-4 w-4" /> Yangi hujjat
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Jami hujjatlar", value: stats.total, color: "text-white/80", icon: FileText },
          { label: "Imzolandi", value: stats.signed, color: "text-emerald-400", icon: CheckCircle },
          { label: "Kutilmoqda", value: stats.waiting, color: "text-amber-400", icon: Clock },
          { label: "Rad etildi", value: stats.rejected, color: "text-red-400", icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="rounded-2xl p-4" style={card}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${color}`} />
              <p className="text-[10px] text-white/35">{label}</p>
            </div>
            <p className={`text-2xl font-extrabold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Filters + Table */}
      <div className="rounded-2xl overflow-hidden" style={card}>
        {/* Filter tabs */}
        <div className="flex items-center gap-1 p-3 border-b border-white/5">
          {filters.map((f) => (
            <button key={f.id} onClick={() => setActiveFilter(f.id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={activeFilter === f.id
                ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: 'white' }
                : { color: 'rgba(255,255,255,0.35)' }
              }>
              {f.label}
              <span className="px-1.5 py-0.5 rounded-full text-[10px]"
                style={{ background: activeFilter === f.id ? 'rgba(99,102,241,0.3)' : 'rgba(255,255,255,0.06)' }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>

        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              {["HUJJAT", "TURI", "HOLAT", "SANA", "IMZOLOVCHILAR", ""].map((h) => (
                <TableHead key={h} className="text-[10px] font-semibold text-white/30 uppercase tracking-wider py-3">{h}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="py-12 text-center text-white/20 text-sm">Yuklanmoqda...</TableCell></TableRow>
            ) : docs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-3 text-white/20">
                    <FileText className="h-10 w-10" />
                    <div>
                      <p className="text-sm font-medium">Hujjatlar yo'q</p>
                      <p className="text-xs mt-1">Birinchi hujjatni yarating</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              docs.map((doc, i) => {
                const status = getStatus(doc.id);
                const cfg = STATUS_CONFIG[status];
                const StatusIcon = cfg.icon;
                return (
                  <TableRow key={doc.id} className="border-b border-white/4 hover:bg-white/2 transition-colors">
                    <TableCell className="py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
                          <FileText className="h-4 w-4 text-indigo-400" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-white/80">{doc.name}</p>
                            {(doc as any).direction === "incoming" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                style={{ background: 'rgba(16,185,129,0.15)', color: '#34d399' }}>
                                KELGAN
                              </span>
                            )}
                            {(doc as any).direction === "outgoing" && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
                                style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8' }}>
                                YUBORILGAN
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-white/30">{doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : "Yuklanmagan"}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>
                        {docTypeLabel[doc.type] || doc.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                        style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.color }}>
                        <StatusIcon className="h-3 w-3" />
                        {cfg.label}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-white/40">
                      {format(new Date(doc.createdAt), "dd.MM.yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(Math.min(2 + (doc.id % 2), 3))].map((_, si) => (
                          <div key={si} className="h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold"
                            style={{ background: si === 0 ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.08)', color: si === 0 ? '#34d399' : 'rgba(255,255,255,0.4)' }}>
                            {String.fromCharCode(65 + si)}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        {status === "waiting" && (
                          <button onClick={() => setSignDocId(doc.id)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-indigo-300 hover:text-white hover:bg-indigo-500/15 transition-all">
                            <PenTool className="h-3 w-3" />
                            Imzolash
                          </button>
                        )}
                        <button onClick={() => setAuditDocId(doc.id)}
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all" title="Audit log">
                          <History className="h-3.5 w-3.5" />
                        </button>
                        <button className="h-7 w-7 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
                          <Download className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => handleDelete(doc.id)}
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

      {/* E-imzo info */}
      <div className="rounded-2xl p-5" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
        <div className="flex items-center gap-3 mb-3">
          <Shield className="h-5 w-5 text-indigo-400" />
          <h3 className="text-sm font-semibold text-indigo-300">Elektron imzo xavfsizligi</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: PenTool, label: "Rasm chizib imzo", desc: "Sichqoncha yoki sensorli ekranda" },
            { icon: Shield, label: "Yuridik kuchga ega", desc: "Audit log IP va vaqt bilan" },
            { icon: Users, label: "Ko'p imzolovchi", desc: "Ketma-ket yoki bir vaqtda" },
          ].map(({ icon: Icon, label, desc }) => (
            <div key={label} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Icon className="h-4 w-4 text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white/70">{label}</p>
                <p className="text-[10px] text-white/35 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create doc modal */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[560px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><FileSignature className="h-4 w-4 text-indigo-400" />Yangi hujjat yaratish</DialogTitle></DialogHeader>
          <CreateDocModal onSuccess={() => setIsCreateOpen(false)} onCancel={() => setIsCreateOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* Sign modal */}
      <Dialog open={!!signDocId} onOpenChange={(o) => !o && setSignDocId(null)}>
        <DialogContent className="sm:max-w-[540px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><PenTool className="h-4 w-4 text-indigo-400" />Elektron imzo qo'yish</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 border-b border-white/8 pb-3">
              {["Chizib imzo", "Fayl yuklash"].map((tab, i) => (
                <button key={tab} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                  style={i === 0
                    ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.35)', color: 'white' }
                    : { color: 'rgba(255,255,255,0.35)' }
                  }>{tab}</button>
              ))}
            </div>
            <SignatureCanvas onSave={handleSign} onCancel={() => setSignDocId(null)} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Audit log modal */}
      <Dialog open={!!auditDocId} onOpenChange={(o) => !o && setAuditDocId(null)}>
        <DialogContent className="sm:max-w-[480px] bg-[#0d0d14] border-white/10">
          <DialogHeader><DialogTitle className="text-white flex items-center gap-2"><History className="h-4 w-4 text-cyan-400" />Imzo tarixi (Audit log)</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {[
              { action: "Hujjat yaratildi", by: "Admin User", at: "2026-04-04 10:30", ip: "192.168.1.1" },
              { action: "Imzolash so'rovi yuborildi", by: "Tizim", at: "2026-04-04 10:31", ip: "10.0.0.1" },
              { action: "Hujjat ochildi", by: "Sarvar Toshmatov", at: "2026-04-04 11:15", ip: "95.130.15.22" },
              { action: "Imzo qo'yildi", by: "Sarvar Toshmatov", at: "2026-04-04 11:16", ip: "95.130.15.22" },
            ].map((entry, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="h-7 w-7 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(6,182,212,0.12)' }}>
                  {i === 3 ? <CheckCircle className="h-3.5 w-3.5 text-emerald-400" /> : <AlertCircle className="h-3.5 w-3.5 text-cyan-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/75">{entry.action}</p>
                  <p className="text-[10px] text-white/35 mt-0.5">{entry.by} · {entry.at}</p>
                  <p className="text-[10px] font-mono text-white/20 mt-0.5">IP: {entry.ip}</p>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
