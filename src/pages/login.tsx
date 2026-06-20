import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, ArrowRight, Building2, Search, CheckCircle2, Loader2 } from "lucide-react";
import { useLogin } from "@/api-client";
import { setToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type Step = "lookup" | "credentials";

interface CompanyInfo {
  companyId: string;
  businessName: string;
}

const credentialsSchema = z.object({
  email: z.string().min(1, { message: "Email kiriting" }),
  password: z.string().min(1, { message: "Parol kiriting" }),
});

const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' };
const inputFocusIn = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
  e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
};
const inputFocusOut = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
};

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const loginMutation = useLogin();

  const [step, setStep] = useState<Step>("lookup");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [lookupId, setLookupId] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

  const form = useForm<z.infer<typeof credentialsSchema>>({
    resolver: zodResolver(credentialsSchema),
  });

  const handleLookup = async () => {
    const id = lookupId.trim().toUpperCase();
    if (!id) { setLookupError("Kompaniya ID kiriting"); return; }
    if (!/^C-\d+$/.test(id)) { setLookupError("Format noto'g'ri. Masalan: C-12345"); return; }
    setLookupError("");
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/auth/lookup-company/${id}`);
      const data = await res.json();
      if (!res.ok) {
        setLookupError("Kompaniya topilmadi. ID ni tekshiring.");
      } else {
        setCompanyInfo(data as CompanyInfo);
        setStep("credentials");
      }
    } catch {
      setLookupError("Tarmoq xatosi. Qayta urinib ko'ring.");
    } finally {
      setLookupLoading(false);
    }
  };

  const onSubmit = (values: z.infer<typeof credentialsSchema>) => {
    loginMutation.mutate(
      { data: { email: values.email, password: values.password } },
      {
        onSuccess: (data) => {
          setToken(data.token);
          // Super-admin goes to the platform panel; everyone else to the
          // normal business dashboard.
          const role = (data as { user?: { role?: string } }).user?.role;
          setLocation(role === "super_admin" ? "/admin" : "/dashboard");
        },
        onError: () => toast({ title: "Noto'g'ri ma'lumot", description: "Email yoki parol noto'g'ri", variant: "destructive" }),
      }
    );
  };

  return (
    <div className="min-h-screen mesh-bg grid-bg relative overflow-hidden">
      <div className="absolute top-[-15%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[90px] pointer-events-none" />

      <div className="relative z-10 px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Bosh sahifa
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4), 0 8px 20px rgba(0,0,0,0.4)' }}>
              <span className="text-white font-extrabold text-sm">ST</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Xush kelibsiz!</h1>
            <p className="text-sm text-white/40">Tizimga kirish</p>
          </div>

          <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>

            {/* ── STEP 1: Company ID lookup ── */}
            {step === "lookup" && (
              <div className="space-y-4">
                <div className="mb-5">
                  <h2 className="text-sm font-semibold text-white mb-1">Kompaniya ID kiriting</h2>
                  <p className="text-xs text-white/35">Sizning kompaniyangizning unikal identifikatori</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Kompaniya ID</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-400" />
                    <input
                      value={lookupId}
                      onChange={(e) => { setLookupId(e.target.value); setLookupError(""); }}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleLookup(); } }}
                      type="text"
                      placeholder="C-12345"
                      className="w-full h-11 rounded-xl pl-10 pr-4 text-sm text-white font-mono placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/60"
                      style={inputStyle}
                      onFocus={inputFocusIn}
                      onBlur={inputFocusOut}
                      autoFocus
                    />
                  </div>
                  {lookupError && (
                    <p className="text-xs text-red-400">{lookupError}</p>
                  )}
                </div>

                <button
                  onClick={handleLookup}
                  disabled={lookupLoading}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                  {lookupLoading
                    ? <Loader2 className="h-4 w-4 animate-spin" />
                    : <><Search className="h-4 w-4" /><span>Izlash</span></>
                  }
                </button>
              </div>
            )}

            {/* ── STEP 2: Email + Password ── */}
            {step === "credentials" && companyInfo && (
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Company found card */}
                <div className="rounded-xl p-3.5 flex items-center gap-3 mb-5" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                  <div className="h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{companyInfo.businessName}</p>
                    <p className="text-[11px] text-indigo-300/70 font-mono">{companyInfo.companyId}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-400 flex-shrink-0" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Email</label>
                  <input
                    {...form.register("email")}
                    type="email"
                    placeholder="admin@kompaniya.uz"
                    className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/60"
                    style={inputStyle}
                    onFocus={inputFocusIn}
                    onBlur={inputFocusOut}
                    autoFocus
                  />
                  {form.formState.errors.email && <p className="text-xs text-red-400">{form.formState.errors.email.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Parol</label>
                  <input
                    {...form.register("password")}
                    type="password"
                    placeholder="Parolingizni kiriting"
                    className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-white/25 outline-none focus:ring-1 focus:ring-indigo-500/60"
                    style={inputStyle}
                    onFocus={inputFocusIn}
                    onBlur={inputFocusOut}
                  />
                  {form.formState.errors.password && <p className="text-xs text-red-400">{form.formState.errors.password.message}</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => { setStep("lookup"); setCompanyInfo(null); form.reset(); }}
                    className="h-11 px-4 rounded-xl text-sm font-medium text-white/50 transition-all hover:text-white hover:bg-white/6"
                    style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
                    Orqaga
                  </button>
                  <button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="flex-1 h-11 rounded-xl text-sm font-semibold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                    {loginMutation.isPending
                      ? <Loader2 className="h-4 w-4 animate-spin" />
                      : <><span>Kirish</span><ArrowRight className="h-4 w-4" /></>
                    }
                  </button>
                </div>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-white/6 text-center">
              <p className="text-xs text-white/30">
                Hisobingiz yo'qmi?{" "}
                <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Ro'yxatdan o'tish</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
