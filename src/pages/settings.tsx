import { useState } from "react";
import { useGetMe } from "@/api-client";
import { useToast } from "@/hooks/use-toast";
import {
  Building2, Users, Lock, Settings2, Shield, Crown, MapPin,
  Plus, Trash2, Globe, Zap, CheckCircle, X, Edit, ChevronRight
} from "lucide-react";

type Tab = "kompaniya" | "foydalanuvchilar" | "xavfsizlik" | "umumiy" | "filiallar" | "integratsiyalar";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "kompaniya", label: "Kompaniya", icon: Building2 },
  { id: "filiallar", label: "Filiallar", icon: MapPin },
  { id: "foydalanuvchilar", label: "Foydalanuvchilar", icon: Users },
  { id: "xavfsizlik", label: "Xavfsizlik", icon: Lock },
  { id: "integratsiyalar", label: "Integratsiyalar", icon: Zap },
  { id: "umumiy", label: "Umumiy", icon: Settings2 },
];

const card = { background: 'var(--st-surface)', border: '1px solid var(--st-border)' };
const inputCls = "w-full h-10 px-3 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors";
const selectCls = "w-full h-10 px-3 rounded-xl text-sm text-white outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 appearance-none cursor-pointer";


const INTEGRATIONS = [
  { id: "click", name: "Click", desc: "Click to'lov tizimi", logo: "💳", category: "To'lov", connected: true },
  { id: "payme", name: "Payme", desc: "Payme orqali to'lov qabul qilish", logo: "💰", category: "To'lov", connected: false },
  { id: "telegram", name: "Telegram Bot", desc: "Buyurtmalar va bildirishnomalar", logo: "✈️", category: "Xabarlar", connected: true },
  { id: "eskiz", name: "Eskiz SMS", desc: "SMS bildirishnomalar", logo: "📱", category: "Xabarlar", connected: false },
  { id: "uzcard", name: "UzCard/Humo", desc: "POS terminal integratsiyasi", logo: "🏦", category: "To'lov", connected: false },
];

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>("kompaniya");
  const { data: user } = useGetMe();
  const { toast } = useToast();
  const [branches, setBranches] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState(INTEGRATIONS);
  const [lang, setLang] = useState("uz");
  const [currency, setCurrency] = useState("uzs");
  const [dateFormat, setDateFormat] = useState("dmy");

  const handleSave = () => {
    toast({ title: "Saqlandi", description: "O'zgarishlar saqlandi" });
  };

  const toggleIntegration = (id: string) => {
    setIntegrations(prev => prev.map(i => i.id === id ? { ...i, connected: !i.connected } : i));
    const intg = integrations.find(i => i.id === id);
    toast({ title: intg?.connected ? "Uzilib qoldi" : "Ulandi", description: `${intg?.name} ${intg?.connected ? "o'chirildi" : "faollashtirildi"}` });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold text-white">Sozlamalar</h1>
        <p className="text-xs text-white/30 mt-0.5">Kompaniya, foydalanuvchilar va tizim sozlamalari</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 rounded-xl p-1" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
        {tabs.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all flex-shrink-0"
            style={activeTab === id
              ? { background: 'rgba(99,102,241,0.25)', border: '1px solid rgba(99,102,241,0.4)', color: 'white' }
              : { color: 'rgba(255,255,255,0.40)' }
            }>
            <Icon className="h-3.5 w-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Kompaniya */}
      {activeTab === "kompaniya" && (
        <div className="rounded-2xl p-5 space-y-5" style={card}>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl flex items-center justify-center text-2xl font-extrabold flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.4), rgba(139,92,246,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}>
              {(user?.businessName || "B").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-semibold text-white">{user?.businessName || "Kompaniya"}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(99,102,241,0.2)', color: '#818cf8' }}>
                {user?.subscriptionPlan === "enterprise" ? "Enterprise" : user?.subscriptionPlan === "business" ? "Business" : "Free"} Rejim
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Kompaniya nomi", placeholder: "SALAM TECH", val: user?.businessName || "" },
              { label: "Soha", placeholder: "Savdo, ishlab chiqarish..." },
              { label: "Email", placeholder: "info@kompaniya.uz", val: user?.email || "" },
              { label: "Telefon", placeholder: "+998 90 123 45 67" },
              { label: "Veb-sayt", placeholder: "https://kompaniya.uz" },
              { label: "Manzil", placeholder: "Toshkent, O'zbekiston" },
            ].map(({ label, placeholder, val }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
                <input defaultValue={val} placeholder={placeholder} className={inputCls} />
              </div>
            ))}
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-white/40 uppercase tracking-wider">Kompaniya haqida</label>
            <textarea rows={3} placeholder="Qisqa tavsif..." className="w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/50 bg-white/5 border border-white/8 transition-colors resize-none" />
          </div>
          <button onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Saqlash
          </button>
        </div>
      )}

      {/* Filiallar */}
      {activeTab === "filiallar" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/50">{branches.length} ta filial ro'yxatga olingan</p>
            <button
              onClick={() => toast({ title: "Tez orada", description: "Yangi filial qo'shish funksiyasi" })}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Plus className="h-4 w-4" /> Yangi filial
            </button>
          </div>
          <div className="space-y-3">
            {branches.map((branch) => (
              <div key={branch.id} className="rounded-2xl p-4" style={card}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                      style={{ background: branch.active ? 'rgba(16,185,129,0.12)' : 'rgba(107,114,128,0.12)' }}>
                      <MapPin className="h-5 w-5" style={{ color: branch.active ? '#10b981' : '#6b7280' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-semibold text-white/85">{branch.name}</h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 ${
                          branch.active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/8 text-white/35'
                        }`}>{branch.active ? "Faol" : "Nofaol"}</span>
                      </div>
                      <p className="text-[11px] text-white/35 mt-0.5">{branch.address}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-[11px] text-white/40">Menejer: <span className="text-white/60">{branch.manager}</span></span>
                        <span className="text-[11px] text-white/40">Xodimlar: <span className="text-white/60">{branch.staff} ta</span></span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button className="h-8 w-8 rounded-lg flex items-center justify-center text-white/25 hover:text-white/60 hover:bg-white/5 transition-all">
                      <Edit className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setBranches(prev => prev.filter(b => b.id !== branch.id))}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white/25 hover:text-red-400 hover:bg-red-500/10 transition-all">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Foydalanuvchilar */}
      {activeTab === "foydalanuvchilar" && (
        <div className="rounded-2xl overflow-hidden space-y-4" style={card}>
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/80">Foydalanuvchilar va rollar</h2>
              <p className="text-[11px] text-white/30 mt-0.5">Tizimga kirish huquqlarini boshqaring</p>
            </div>
            <button
              onClick={() => toast({ title: "Tez orada", description: "Foydalanuvchi qo'shish" })}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <Plus className="h-3.5 w-3.5" /> Qo'shish
            </button>
          </div>

          <div className="divide-y divide-white/5">
            {[
              { name: user?.name || "Admin", email: user?.email || "", role: "Admin", active: true, color: "#6366f1" },
              { name: "Sarvar Toshmatov", email: "sarvar@kompaniya.uz", role: "Kassir", active: true, color: "#10b981" },
              { name: "Mohira Xasanova", email: "mohira@kompaniya.uz", role: "Menejer", active: false, color: "#f59e0b" },
            ].map((u, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3 hover:bg-white/2 transition-colors">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                  style={{ background: `${u.color}18`, color: u.color }}>
                  {u.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white/80">{u.name}</p>
                  <p className="text-[10px] text-white/35">{u.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] px-2.5 py-1 rounded-lg" style={{ background: `${u.color}15`, color: u.color }}>
                    {u.role}
                  </span>
                  <div className={`h-2 w-2 rounded-full ${u.active ? 'bg-emerald-400' : 'bg-white/15'}`} title={u.active ? "Faol" : "Nofaol"} />
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-2 text-xs rounded-xl p-3" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <Crown className="h-4 w-4 text-yellow-400 flex-shrink-0" />
              <span className="text-white/50">Tarif rejangizda <span className="text-white/70 font-medium">5 foydalanuvchigacha</span> ruxsat.</span>
              <button className="text-indigo-400 hover:text-indigo-300 ml-auto flex-shrink-0 font-medium">Yangilash →</button>
            </div>
          </div>
        </div>
      )}

      {/* Xavfsizlik */}
      {activeTab === "xavfsizlik" && (
        <div className="space-y-4">
          <div className="rounded-2xl p-5 space-y-4" style={card}>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-400" />
              <h2 className="text-sm font-semibold text-white/80">Parolni yangilash</h2>
            </div>
            <div className="space-y-3">
              {["Joriy parol", "Yangi parol", "Yangi parolni tasdiqlang"].map((label) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
                  <input type="password" placeholder="••••••••" className={inputCls} />
                </div>
              ))}
            </div>
            <button onClick={handleSave}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              Parolni yangilash
            </button>
          </div>

          <div className="rounded-2xl p-5 space-y-3" style={card}>
            <h3 className="text-sm font-semibold text-white/80">Faol sessiyalar</h3>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
              <div>
                <p className="text-sm font-medium text-white/75">Joriy sessiya</p>
                <p className="text-[11px] text-white/35">Toshkent, O'zbekiston · Chrome · Hozir faol</p>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-[10px] text-emerald-400">Faol</span>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
              style={{ border: '1px solid rgba(239,68,68,0.3)' }}>
              Barcha sessiyalarni yopish
            </button>
          </div>
        </div>
      )}

      {/* Integratsiyalar */}
      {activeTab === "integratsiyalar" && (
        <div className="space-y-4">
          <p className="text-sm text-white/40">Tashqi xizmatlar va to'lov tizimlari bilan bog'laning</p>

          {["To'lov", "Xabarlar", "Buxgalteriya"].map((category) => {
            const catIntegrations = integrations.filter(i => i.category === category);
            return (
              <div key={category}>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-white/30 mb-2 px-1">{category}</h3>
                <div className="space-y-2">
                  {catIntegrations.map((intg) => (
                    <div key={intg.id} className="rounded-2xl p-4 flex items-center gap-4" style={card}>
                      <div className="h-11 w-11 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                        style={{ background: 'rgba(255,255,255,0.05)' }}>
                        {intg.logo}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white/85">{intg.name}</p>
                        <p className="text-[11px] text-white/35">{intg.desc}</p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {intg.connected && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400">
                            <CheckCircle className="h-3 w-3" /> Ulangan
                          </span>
                        )}
                        <button
                          onClick={() => toggleIntegration(intg.id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                          style={intg.connected
                            ? { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }
                            : { background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8' }
                          }>
                          {intg.connected ? "Uzish" : "Ulash"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Umumiy */}
      {activeTab === "umumiy" && (
        <div className="rounded-2xl p-5 space-y-5" style={card}>
          <h2 className="text-sm font-semibold text-white/80">Umumiy sozlamalar</h2>
          <div className="space-y-4">
            {[
              {
                label: "Tizim tili", state: lang, setState: setLang,
                options: [{ val: "uz", label: "O'zbekcha" }, { val: "ru", label: "Русский" }, { val: "en", label: "English" }]
              },
              {
                label: "Asosiy valyuta", state: currency, setState: setCurrency,
                options: [{ val: "uzs", label: "UZS — O'zbek so'mi" }, { val: "usd", label: "USD — Dollar" }, { val: "eur", label: "EUR — Yevro" }]
              },
              {
                label: "Sana formati", state: dateFormat, setState: setDateFormat,
                options: [{ val: "dmy", label: "DD.MM.YYYY" }, { val: "mdy", label: "MM/DD/YYYY" }, { val: "ymd", label: "YYYY-MM-DD" }]
              },
            ].map(({ label, state, setState, options }) => (
              <div key={label} className="space-y-1.5">
                <label className="text-xs text-white/40 uppercase tracking-wider">{label}</label>
                <select value={state} onChange={(e) => setState(e.target.value)} className={selectCls}>
                  {options.map(opt => <option key={opt.val} value={opt.val} className="bg-[#1a1a2e]">{opt.label}</option>)}
                </select>
              </div>
            ))}

            <div className="flex items-center justify-between p-3.5 rounded-xl" style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}>
              <div>
                <p className="text-sm font-medium text-white/75">Qorong'u rejim</p>
                <p className="text-[11px] text-white/35">Har doim yoqilgan — dizayn tamoyili</p>
              </div>
              <div className="h-5 w-9 rounded-full bg-indigo-500/60 flex items-center justify-end px-0.5">
                <div className="h-4 w-4 rounded-full bg-white" />
              </div>
            </div>
          </div>
          <button onClick={handleSave}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            Saqlash
          </button>
        </div>
      )}
    </div>
  );
}
