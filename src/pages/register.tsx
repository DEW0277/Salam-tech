import { Link, useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ChevronLeft, ArrowRight, Building2, Copy, CheckCircle } from "lucide-react";
import { useRegister } from "@/api-client";
import { setToken } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const registerSchema = z.object({
  businessName: z.string().min(2, { message: "Kamida 2 ta belgi" }),
  name: z.string().min(2, { message: "Kamida 2 ta belgi" }),
  email: z.string().email({ message: "Noto'g'ri email" }),
  password: z.string().min(6, { message: "Kamida 6 ta belgi" }),
});

export default function Register() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const registerMutation = useRegister();
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
  });

  function onSubmit(values: z.infer<typeof registerSchema>) {
    registerMutation.mutate(
      { data: { name: values.name, email: values.email, password: values.password, businessName: values.businessName } },
      {
        onSuccess: (data) => {
          const cId = (data.user as any).companyId;
          if (cId) {
            setCompanyId(cId);
            setToken(data.token);
          } else {
            setToken(data.token);
            setLocation("/dashboard");
          }
        },
        onError: () => {
          toast({ title: "Xatolik", description: "Ro'yxatdan o'tishda xatolik", variant: "destructive" });
        },
      }
    );
  }

  const copyId = () => {
    if (companyId) {
      navigator.clipboard.writeText(companyId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const inputStyle = { background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' };

  const Field = ({ label, name, type = "text", placeholder, error }: {
    label: string; name: any; type?: string; placeholder: string; error?: string
  }) => (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
      <input {...register(name)} type={type} placeholder={placeholder}
        className="w-full h-11 rounded-xl px-4 text-sm text-white placeholder:text-white/25 transition-all outline-none focus:ring-1 focus:ring-indigo-500/60"
        style={inputStyle}
        onFocus={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)'; }}
        onBlur={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen mesh-bg grid-bg relative overflow-hidden">
      <div className="absolute top-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[90px] pointer-events-none" />

      <div className="relative z-10 px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors">
          <ChevronLeft className="h-4 w-4" /> Bosh sahifa
        </Link>
      </div>

      <div className="relative z-10 flex items-center justify-center px-4 pb-12">
        <div className="w-full max-w-md">
          <div className="flex flex-col items-center mb-8">
            <div className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 30px rgba(99,102,241,0.4), 0 8px 20px rgba(0,0,0,0.4)' }}>
              <span className="text-white font-extrabold text-sm">ST</span>
            </div>
            <h1 className="text-xl font-bold text-white mb-1">Kompaniyani yaratish</h1>
            <p className="text-sm text-white/40">Asosiy ma'lumotlarni to'ldiring</p>
          </div>

          {/* Company ID success screen */}
          {companyId ? (
            <div className="rounded-2xl p-7 text-center" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              <div className="h-14 w-14 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle className="h-7 w-7 text-emerald-400" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1">Kompaniya yaratildi!</h2>
              <p className="text-sm text-white/40 mb-6">Kompaniya ID sini saqlang — keyinchalik kirish uchun kerak bo'ladi</p>

              <div className="rounded-xl p-4 mb-4" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)' }}>
                <p className="text-xs text-white/40 mb-2 uppercase tracking-wider">Kompaniya ID</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-3xl font-mono font-extrabold text-indigo-300">{companyId}</span>
                  <button onClick={copyId} className="h-8 w-8 rounded-lg flex items-center justify-center text-white/40 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                    {copied ? <CheckCircle className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="rounded-xl p-3 mb-6" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <p className="text-xs text-amber-400/80">Bu ID ni yodda tuting! Keyingi kirishda kompaniya ID va parolni kiritasiz</p>
              </div>

              <button onClick={() => setLocation("/dashboard")}
                className="w-full h-11 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.35)' }}>
                Boshqaruv paneliga kirish <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="rounded-2xl p-7" style={{ background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.5)' }}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Field label="Kompaniya nomi *" name="businessName" placeholder="Biznes LLC" error={errors.businessName?.message} />
                <Field label="Admin ismi *" name="name" placeholder="Sarvar Toshmatov" error={errors.name?.message} />
                <Field label="Admin email *" name="email" type="email" placeholder="admin@kompaniya.uz" error={errors.email?.message} />
                <Field label="Parol *" name="password" type="password" placeholder="Kamida 6 ta belgi" error={errors.password?.message} />

                <button type="submit" disabled={registerMutation.isPending}
                  className="w-full h-11 rounded-xl text-sm font-semibold text-white transition-all mt-2 flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', boxShadow: '0 0 20px rgba(99,102,241,0.35), 0 4px 12px rgba(0,0,0,0.3)' }}>
                  {registerMutation.isPending ? (
                    <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : (<>Kompaniyani yaratish <ArrowRight className="h-4 w-4" /></>)}
                </button>
              </form>

              <div className="mt-5 pt-5 border-t border-white/6 text-center">
                <p className="text-xs text-white/30">
                  Hisobingiz bormi?{" "}
                  <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">Kirish</Link>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
