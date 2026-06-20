import { useState, useRef, useEffect, useCallback } from "react";
import { useListGeminiConversations, useCreateGeminiConversation, useGetGeminiConversation, useDeleteGeminiConversation } from "@/api-client";
import { useQueryClient } from "@tanstack/react-query";
import {
  BrainCircuit, Plus, Send, Trash2, MessageSquare, Sparkles, Bot, User, Loader2,
  ChevronRight, TrendingUp, Package, DollarSign, Target, Shield, Megaphone,
  BarChart3, AlertTriangle, Zap, ArrowUpRight, Star
} from "lucide-react";

const BASE_URL = import.meta.env.BASE_URL || "";

type Msg = { role: "user" | "assistant"; content: string; streaming?: boolean };
type AIView = "chat" | "modules";

const AI_MODULES = [
  {
    id: "sales_prediction",
    title: "Sotuv Prognozi",
    desc: "Kelajakdagi savdo hajmini bashorat qiladi",
    icon: TrendingUp,
    color: "#10b981",
    bg: "rgba(16,185,129,0.1)",
    prompt: "Biznesimning oxirgi 3 oylik savdo ma'lumotlari asosida kelgusi oy uchun sotuv prognozini bering. Qaysi mahsulotlar ko'proq sotilishini va taxminiy daromadni ko'rsating.",
    badge: "Premium"
  },
  {
    id: "smart_pricing",
    title: "Smart Narxlash",
    desc: "Mahsulot narxlarini AI optimizatsiya qiladi",
    icon: DollarSign,
    color: "#6366f1",
    bg: "rgba(99,102,241,0.1)",
    prompt: "Mavjud mahsulotlarimizning narxlarini tahlil qilib, foydani maksimallashtiradigan optimal narx tavsiyalari bering. Bozor raqobatchilik tahlili ham kirsin.",
    badge: "Pro"
  },
  {
    id: "inventory_ai",
    title: "Inventar Manager",
    desc: "Qaysi mahsulotni qachon sotib olishni aytadi",
    icon: Package,
    color: "#8b5cf6",
    bg: "rgba(139,92,246,0.1)",
    prompt: "Inventar holatini tahlil qilib, qaysi mahsulotlar tez tugashi mumkinligini va qachon, qancha miqdorda yangi partiya buyurtma berishim kerakligini ko'rsating.",
    badge: "AI"
  },
  {
    id: "customer_analysis",
    title: "Mijoz Tahlili",
    desc: "Mijoz xatti-harakatlarini AI tahlil qiladi",
    icon: User,
    color: "#06b6d4",
    bg: "rgba(6,182,212,0.1)",
    prompt: "Mijozlarimizning xarid qilish odatlarini, eng qimmatli segmentlarni va ularni saqlab qolish uchun eng yaxshi strategiyalarni tahlil qilib bering. LTV (lifetime value) hisobi ham bo'lsin.",
    badge: "AI"
  },
  {
    id: "expense_optimizer",
    title: "Xarajat Optimizer",
    desc: "Xarajatlarni kamaytirish bo'yicha maslahat",
    icon: Target,
    color: "#f59e0b",
    bg: "rgba(245,158,11,0.1)",
    prompt: "Biznesimning joriy xarajatlarini ko'rib chiqib, qaysi yo'nalishlarda tejash mumkinligini va umumiy xarajatlarni kamida 15% kamaytirish uchun aniq takliflar bering.",
    badge: "Smart"
  },
  {
    id: "marketing_ai",
    title: "Marketing Generator",
    desc: "Reklama matnlarini AI yaratadi",
    icon: Megaphone,
    color: "#ec4899",
    bg: "rgba(236,72,153,0.1)",
    prompt: "Mahsulotlarimiz uchun ijtimoiy tarmoqlar (Instagram, Telegram), SMS va email marketing uchun kreativ reklama matnlari yarating. Har bir kanal uchun alohida variant bo'lsin.",
    badge: "Creative"
  },
  {
    id: "fraud_detection",
    title: "Fraud Aniqlash",
    desc: "Shubhali operatsiyalarni avtomatik topadi",
    icon: Shield,
    color: "#ef4444",
    bg: "rgba(239,68,68,0.1)",
    prompt: "Oxirgi tranzaksiyalar va operatsiyalarni tahlil qilib, shubhali yoki g'ayriodatiy faoliyatni aniqlang. Xavf darajasi bo'yicha guruhlang va choralar tavsiya qiling.",
    badge: "Security"
  },
  {
    id: "business_health",
    title: "Biznes Salomatligi",
    desc: "Biznes holatini 360° baholaydi",
    icon: BarChart3,
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.1)",
    prompt: "Biznesimning barcha ko'rsatkichlarini (savdo, moliya, inventar, xodimlar, mijozlar) tahlil qilib, umumiy biznes salomatlik skorini (0-100) hisoblang va eng muhim takomillashtirish yo'nalishlarini ko'rsating.",
    badge: "Analytics"
  },
];

const QUICK_SUGGESTIONS = [
  "Biznesimning bugungi savdo tahlilini ber",
  "Kam qolgan mahsulotlarni ko'rsating",
  "Bu oyda xarajatlarni qanday kamaytirish mumkin?",
  "Eng yaxshi mijozlarim kimlar?",
  "Kassa hisoboti va moliya tahlili",
  "Xodimlar samaradorligini oshirish yo'llari",
];

export default function Ai() {
  const queryClient = useQueryClient();
  const [aiView, setAiView] = useState<AIView>("modules");
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [localMessages, setLocalMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);


  const { data: convList = [], refetch: refetchList } = useListGeminiConversations();
  const createConv = useCreateGeminiConversation();
  const deleteConv = useDeleteGeminiConversation();

  const { data: convData } = useGetGeminiConversation(activeConvId!, { query: { enabled: !!activeConvId } as any });

  useEffect(() => {
    if (convData?.messages) {

      setLocalMessages(convData.messages.map((m) => ({ role: m.role as "user" | "assistant", content: m.content })));
    
    }
  }, [convData]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [localMessages]);

  const startNewConversation = async () => {
    const conv = await createConv.mutateAsync({ data: { title: "Yangi suhbat" } });
    setActiveConvId(conv.id);
    setLocalMessages([]);
    refetchList();
    setAiView("chat");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const selectConversation = (id: number) => {
    setActiveConvId(id);
    setLocalMessages([]);
    setAiView("chat");
  };

  const handleDeleteConv = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteConv.mutateAsync({ id });
    if (activeConvId === id) { setActiveConvId(null); setLocalMessages([]); }
    refetchList();
  };

  const sendMessage = useCallback(async (msg?: string) => {
    const userMsg = (msg || input).trim();
    if (!userMsg || isStreaming) return;

    let convId = activeConvId;
    if (!convId) {
      const conv = await createConv.mutateAsync({ data: { title: userMsg.slice(0, 50) } });
      convId = conv.id;
      setActiveConvId(conv.id);
      refetchList();
    }

    setInput("");
    setAiView("chat");
    setLocalMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setIsStreaming(true);
    setLocalMessages((prev) => [...prev, { role: "assistant", content: "", streaming: true }]);

    try {
      const token = localStorage.getItem("salam_tech_token");
      const res = await fetch(`${BASE_URL}api/gemini/conversations/${convId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ content: userMsg }),
      });

      const json = await res.json();
      const aiContent = json.content || json.error || "Javob olinmadi.";

      setLocalMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) next[next.length - 1] = { role: "assistant", content: aiContent };
        return next;
      });

      queryClient.invalidateQueries({ queryKey: ["/api/gemini/conversations"] });
    } catch {
      setLocalMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last?.streaming) next[next.length - 1] = { role: "assistant", content: "Xatolik yuz berdi. Qaytadan urining." };
        return next;
      });
    } finally {
      setIsStreaming(false);
    }
  }, [input, isStreaming, activeConvId, createConv, refetchList, queryClient]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const glassCard = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' };
  const glassSidebar = { background: 'rgba(255,255,255,0.025)', borderRight: '1px solid rgba(255,255,255,0.06)' };

  return (
    <div className="h-[calc(100vh-4rem)] -mt-2 flex gap-0 rounded-2xl overflow-hidden" style={glassCard}>
      {/* Sidebar */}
      <div className="w-56 flex-shrink-0 flex flex-col" style={glassSidebar}>
        <div className="p-3 border-b border-white/5 space-y-1.5">
          <button onClick={startNewConversation}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white transition-all"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.35)' }}>
            <Plus className="h-4 w-4 text-indigo-400" /> Yangi suhbat
          </button>
          <button onClick={() => setAiView("modules")}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
            style={aiView === "modules"
              ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: 'white' }
              : { color: 'rgba(255,255,255,0.40)' }
            }>
            <Zap className="h-3.5 w-3.5 text-indigo-400" /> AI Modullar
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {convList.length === 0 ? (
            <div className="py-6 text-center text-xs text-white/20">
              <MessageSquare className="h-5 w-5 mx-auto mb-2 opacity-40" />
              Suhbatlar yo'q
            </div>
          ) : (
            convList.map((conv) => (
              <button key={conv.id} onClick={() => selectConversation(conv.id)}
                className="group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-sm transition-all"
                style={activeConvId === conv.id && aiView === "chat"
                  ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: 'white' }
                  : { color: 'rgba(255,255,255,0.45)' }
                }>
                <div className="flex items-center gap-2 min-w-0">
                  <MessageSquare className="h-3.5 w-3.5 flex-shrink-0 text-indigo-400/60" />
                  <span className="truncate text-xs">{conv.title}</span>
                </div>
                <button onClick={(e) => handleDeleteConv(conv.id, e)}
                  className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0">
                  <Trash2 className="h-3 w-3" />
                </button>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5">
          <div className="h-8 w-8 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3))' }}>
            <BrainCircuit className="h-4 w-4 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI - Direktor</h2>
            <p className="text-[10px] text-white/30">Gemini 3.0 Flash · 8 ta AI modul</p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => setAiView("modules")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={aiView === "modules"
                ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }
                : { color: 'rgba(255,255,255,0.35)' }
              }>
              <Zap className="h-3 w-3" /> Modullar
            </button>
            <button onClick={() => { if (!activeConvId) startNewConversation(); else setAiView("chat"); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={aiView === "chat"
                ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }
                : { color: 'rgba(255,255,255,0.35)' }
              }>
              <MessageSquare className="h-3 w-3" /> Chat
            </button>
            <div className="h-1.5 w-1.5 rounded-full bg-green-400 ml-1" />
          </div>
        </div>

        {/* AI Modules Panel */}
        {aiView === "modules" && (
          <div className="flex-1 overflow-y-auto px-5 py-5">
            <div className="max-w-3xl mx-auto space-y-5">
              <div className="text-center">
                <div className="h-14 w-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                  <Sparkles className="h-6 w-6 text-indigo-400" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">AI Biznes Yordamchisi</h3>
                <p className="text-xs text-white/35">Gemini AI bilan biznesingizni yangi darajaga olib chiqing</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {AI_MODULES.map((mod) => {
                  const Icon = mod.icon;
                  return (
                    <button key={mod.id}
                      onClick={() => sendMessage(mod.prompt)}
                      className="flex items-start gap-3 p-4 rounded-2xl text-left transition-all hover:scale-[1.02] group"
                      style={{ background: mod.bg, border: `1px solid ${mod.color}20` }}>
                      <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${mod.color}20` }}>
                        <Icon className="h-5 w-5" style={{ color: mod.color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <p className="text-sm font-semibold text-white/85">{mod.title}</p>
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: `${mod.color}25`, color: mod.color }}>
                            {mod.badge}
                          </span>
                        </div>
                        <p className="text-[11px] text-white/40 leading-snug">{mod.desc}</p>
                        <div className="flex items-center gap-1 mt-2 text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                          style={{ color: mod.color }}>
                          <ArrowUpRight className="h-3 w-3" /> Ishga tushirish
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick suggestions */}
              <div>
                <p className="text-xs text-white/30 mb-2 text-center">Tez savollar</p>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_SUGGESTIONS.map((s) => (
                    <button key={s} onClick={() => sendMessage(s)}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs text-white/55 hover:text-white/80 transition-all group"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <ChevronRight className="h-3 w-3 text-indigo-400/50 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {aiView === "chat" && (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {localMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="h-14 w-14 rounded-2xl mx-auto mb-3 flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.25), rgba(139,92,246,0.2))', border: '1px solid rgba(99,102,241,0.3)' }}>
                      <Sparkles className="h-6 w-6 text-indigo-400" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">Salom! Men AI Direktoring.</h3>
                    <p className="text-xs text-white/35 max-w-sm">Biznesingiz haqida har qanday savol bering.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 max-w-lg w-full">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button key={s} onClick={() => { setInput(s); setTimeout(() => inputRef.current?.focus(), 50); }}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-left text-xs text-white/55 hover:text-white/80 transition-all group"
                        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                        <ChevronRight className="h-3 w-3 text-indigo-400/50 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-3xl mx-auto">
                  {localMessages.map((msg, i) => (
                    <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                      <div className={`h-7 w-7 rounded-lg flex-shrink-0 flex items-center justify-center ${
                        msg.role === "user" ? "bg-indigo-600/30 border border-indigo-500/30" : "bg-violet-600/25 border border-violet-500/25"
                      }`}>
                        {msg.role === "user" ? <User className="h-3.5 w-3.5 text-indigo-400" /> : <Bot className="h-3.5 w-3.5 text-violet-400" />}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "rounded-tr-sm" : "rounded-tl-sm"}`}
                        style={msg.role === "user"
                          ? { background: 'rgba(99,102,241,0.2)', border: '1px solid rgba(99,102,241,0.3)', color: 'rgba(255,255,255,0.9)' }
                          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' }
                        }>
                        {msg.streaming && msg.content === "" ? (
                          <div className="flex items-center gap-1.5">
                            {[0, 150, 300].map((d) => <div key={d} className="h-1.5 w-1.5 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                          </div>
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.content}
                            {msg.streaming && <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-text-bottom" />}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <div className="px-5 py-4 border-t border-white/5">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-end gap-2 rounded-2xl px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <textarea ref={inputRef} rows={1} value={input} onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown} placeholder="Savol yoki maslahat so'rang..." disabled={isStreaming}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-white/25 resize-none outline-none leading-relaxed min-h-[24px] max-h-[120px]"
                    style={{ scrollbarWidth: 'none' }} />
                  <button onClick={() => sendMessage()} disabled={!input.trim() || isStreaming}
                    className="h-8 w-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {isStreaming ? <Loader2 className="h-3.5 w-3.5 text-white animate-spin" /> : <Send className="h-3.5 w-3.5 text-white" />}
                  </button>
                </div>
                <p className="text-center text-[10px] text-white/15 mt-2">Enter — yuborish · Shift+Enter — yangi qator</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
