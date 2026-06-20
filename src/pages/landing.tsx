import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useGetMe } from "@/api-client";
import { ShoppingCart, LayoutGrid, BrainCircuit, ArrowRight, Zap, Shield, TrendingUp } from "lucide-react";

export default function Landing() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading, isError } = useGetMe();

  useEffect(() => {
    if (!isLoading && !isError && user) {
      setLocation("/dashboard");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, isError]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center mesh-bg">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen mesh-bg grid-bg relative overflow-hidden flex flex-col">
      {/* Decorative blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/10 blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[60%] w-[300px] h-[300px] rounded-full bg-blue-600/6 blur-[80px] pointer-events-none" />

      {/* Top nav */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-extrabold text-xs tracking-wider">ST</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">Salam Tech</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-white/5">
            Kirish
          </Link>
          <Link href="/register" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
            Boshlash
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-16 relative z-10">
        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-xs font-medium text-primary">
          <Zap className="h-3 w-3" />
          O'zbekistonning #1 Biznes Tizimi
        </div>

        {/* Main heading */}
        <h1 className="text-center font-extrabold text-foreground leading-tight mb-4" style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)' }}>
          Biznesingizni{' '}
          <span className="gradient-text-primary">
            yangi darajaga
          </span>
          <br />
          olib chiqing
        </h1>

        <p className="text-center text-muted-foreground max-w-lg mb-10 leading-relaxed" style={{ fontSize: 'clamp(1rem, 2vw, 1.125rem)' }}>
          Savdo, inventar, moliya, xodimlar va mijozlarni bitta platformada boshqaring. 
          Real vaqtda AI tahlil bilan qarorlar qabul qiling.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-16">
          <Link
            href="/register"
            className="group inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 glow-primary-sm text-sm"
          >
            Bepul boshlash
            <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 glass border border-white/10 text-foreground font-semibold rounded-xl hover:bg-white/8 transition-all text-sm"
          >
            Kompaniyaga kirish
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-8 mb-16 text-center">
          {[
            { value: "500+", label: "Kompaniya" },
            { value: "98%", label: "Mijoz mamnunligi" },
            { value: "24/7", label: "Qo'llab-quvvatlash" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-extrabold gradient-text-primary">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
          {[
            {
              icon: ShoppingCart,
              label: "POS Kassa",
              desc: "Tez va qulay savdo, barcode skaneri, hisobotlar",
              gradient: "from-indigo-500/20 to-indigo-500/5",
              iconColor: "text-indigo-400",
              glow: "shadow-indigo-500/10",
            },
            {
              icon: LayoutGrid,
              label: "ERP Tizim",
              desc: "Inventar, moliya, xodimlar – barchasi bir joyda",
              gradient: "from-violet-500/20 to-violet-500/5",
              iconColor: "text-violet-400",
              glow: "shadow-violet-500/10",
            },
            {
              icon: BrainCircuit,
              label: "AI Direktor",
              desc: "Sun'iy intellekt bilan aqlli tahlil va maslahatlar",
              gradient: "from-blue-500/20 to-blue-500/5",
              iconColor: "text-blue-400",
              glow: "shadow-blue-500/10",
            },
          ].map(({ icon: Icon, label, desc, gradient, iconColor, glow }) => (
            <div
              key={label}
              className={`group relative rounded-2xl p-5 border border-white/6 bg-gradient-to-br ${gradient} backdrop-blur-sm hover:border-white/12 transition-all duration-300 hover:-translate-y-1 shadow-xl ${glow} cursor-default`}
            >
              <div className={`h-9 w-9 rounded-xl bg-white/8 flex items-center justify-center mb-3 ${iconColor}`}>
                <Icon className="h-4.5 w-4.5" style={{ width: '18px', height: '18px' }} />
              </div>
              <h3 className="font-bold text-foreground text-sm mb-1">{label}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div className="flex items-center gap-6 mt-12 text-xs text-muted-foreground">
          {[
            { icon: Shield, text: "Xavfsiz SSL shifrlash" },
            { icon: Zap, text: "99.9% uptime" },
            { icon: TrendingUp, text: "Bepul 14 kun sinab ko'ring" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5">
              <Icon className="h-3.5 w-3.5 text-primary/70" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
