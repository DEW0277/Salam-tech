import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Calendar, Clock, Plus, Trash2, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const getToken = () => localStorage.getItem("salam_tech_token");
const authHeaders = (): Record<string, string> => {
  const t = getToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (t) {
    headers["Authorization"] = `Bearer ${t}`;
  }
  return headers;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Kutilmoqda", confirmed: "Tasdiqlangan", completed: "Bajarilgan", cancelled: "Bekor qilingan",
};
const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  confirmed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  completed: "bg-green-500/20 text-green-400 border-green-500/30",
  cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function Bookings() {
  const { toast } = useToast();
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [dateFilter, setDateFilter] = useState("");
  const [form, setForm] = useState({
    customerName: "", customerPhone: "", serviceName: "", customServiceName: "", employeeName: "",
    bookingDate: "", bookingTime: "", duration: "60", amount: "", notes: "",
  });

  const today = new Date().toISOString().split("T")[0];

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = dateFilter ? `?date=${dateFilter}` : "";
      const r = await fetch(`/api/bookings${params}`, { headers: authHeaders() });
      if (r.ok) setBookings(await r.json());
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  const fetchServices = useCallback(async () => {
    const r = await fetch("/api/services", { headers: authHeaders() });
    if (r.ok) setServices(await r.json());
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);
  useEffect(() => { fetchServices(); }, [fetchServices]);

  const getEffectiveServiceName = () =>
    form.serviceName === "custom_other" ? form.customServiceName.trim() : form.serviceName;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveServiceName = getEffectiveServiceName();
    if (!form.customerName.trim()) {
      toast({ title: "Mijoz ismi kiritilmagan", variant: "destructive" }); return;
    }
    if (!effectiveServiceName) {
      toast({ title: "Xizmat tanlanmagan", description: "Xizmat tanlang yoki nomini kiriting", variant: "destructive" }); return;
    }
    if (!form.bookingDate || !form.bookingTime) {
      toast({ title: "Sana va vaqt kiritilmagan", variant: "destructive" }); return;
    }
    setSaving(true);
    try {
      const body = { ...form, serviceName: effectiveServiceName };
      const r = await fetch("/api/bookings", {
        method: "POST", headers: authHeaders(), body: JSON.stringify(body),
      });
      if (r.ok) {
        setOpen(false);
        setForm({ customerName: "", customerPhone: "", serviceName: "", customServiceName: "", employeeName: "", bookingDate: "", bookingTime: "", duration: "60", amount: "", notes: "" });
        fetchBookings();
        toast({ title: "Bron yaratildi", description: "Yangi bron muvaffaqiyatli qo'shildi" });
      } else {
        const err = await r.json().catch(() => ({}));
        toast({ title: "Xato", description: err.error || "Bron yaratishda xato yuz berdi", variant: "destructive" });
      }
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (id: number, status: string) => {
    const r = await fetch(`/api/bookings/${id}`, {
      method: "PUT", headers: authHeaders(), body: JSON.stringify({ status }),
    });
    if (r.ok) { fetchBookings(); toast({ title: "Status yangilandi" }); }
  };

  const deleteBooking = async (id: number) => {
    await fetch(`/api/bookings/${id}`, { method: "DELETE", headers: authHeaders() });
    fetchBookings();
    toast({ title: "Bron o'chirildi" });
  };

  const todayBookings = bookings.filter(b => b.bookingDate === today);

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Bronlar / Jadval</h1>
          <p className="text-sm text-muted-foreground mt-1">Mijoz bronlarini boshqaring</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 gap-2">
              <Plus className="h-4 w-4" /><span className="hidden sm:inline">Yangi bron</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="glass-strong border-white/10 max-w-lg">
            <DialogHeader><DialogTitle className="gradient-text">Yangi Bron</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Mijoz ismi *</Label>
                  <Input value={form.customerName} onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
                    placeholder="Ism familya" className="glass border-white/10" required />
                </div>
                <div className="space-y-1">
                  <Label>Telefon</Label>
                  <Input value={form.customerPhone} onChange={e => setForm(f => ({ ...f, customerPhone: e.target.value }))}
                    placeholder="+998 90 000 00 00" className="glass border-white/10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Xizmat *</Label>
                <Select value={form.serviceName} onValueChange={v => {
                  const svc = services.find((s: any) => s.name === v);
                  setForm(f => ({ ...f, serviceName: v, duration: svc ? String(svc.duration) : f.duration, amount: svc ? String(svc.price) : f.amount }));
                }}>
                  <SelectTrigger className="glass border-white/10"><SelectValue placeholder="Xizmat tanlang" /></SelectTrigger>
                  <SelectContent className="glass-strong border-white/10">
                    {services.map((s: any) => (
                      <SelectItem key={s.id} value={s.name}>{s.name} — {Number(s.price).toLocaleString()} so'm</SelectItem>
                    ))}
                    <SelectItem value="custom_other">Boshqa...</SelectItem>
                  </SelectContent>
                </Select>
                {form.serviceName === "custom_other" && (
                  <Input value={form.customServiceName}
                    onChange={e => setForm(f => ({ ...f, customServiceName: e.target.value }))}
                    placeholder="Xizmat nomini kiriting" className="glass border-white/10 mt-2" autoFocus />
                )}
              </div>
              <div className="space-y-1">
                <Label>Xodim</Label>
                <Input value={form.employeeName} onChange={e => setForm(f => ({ ...f, employeeName: e.target.value }))}
                  placeholder="Xodim ismi" className="glass border-white/10" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Sana *</Label>
                  <Input type="date" value={form.bookingDate} onChange={e => setForm(f => ({ ...f, bookingDate: e.target.value }))}
                    className="glass border-white/10" required />
                </div>
                <div className="space-y-1">
                  <Label>Vaqt *</Label>
                  <Input type="time" value={form.bookingTime} onChange={e => setForm(f => ({ ...f, bookingTime: e.target.value }))}
                    className="glass border-white/10" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Davomiyligi (daqiqa)</Label>
                  <Input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="glass border-white/10" />
                </div>
                <div className="space-y-1">
                  <Label>Narxi (so'm)</Label>
                  <Input type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} className="glass border-white/10" />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Izoh</Label>
                <Input value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Qo'shimcha ma'lumot" className="glass border-white/10" />
              </div>
              <Button type="submit" className="w-full bg-primary" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}Bron yaratish
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Bugungi bronlar", value: todayBookings.length, color: "from-blue-500/20 to-blue-600/10" },
          { label: "Kutilmoqda", value: bookings.filter(b => b.status === "pending").length, color: "from-yellow-500/20 to-yellow-600/10" },
          { label: "Tasdiqlangan", value: bookings.filter(b => b.status === "confirmed").length, color: "from-green-500/20 to-green-600/10" },
          { label: "Jami bronlar", value: bookings.length, color: "from-purple-500/20 to-purple-600/10" },
        ].map(stat => (
          <div key={stat.label} className={`glass rounded-xl p-4 bg-gradient-to-br ${stat.color}`}>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3 items-center">
        <div className="flex items-center gap-2 glass rounded-xl px-3 py-2 flex-1 max-w-xs border border-white/10">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)}
            className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0" />
        </div>
        {dateFilter && <Button variant="ghost" size="sm" onClick={() => setDateFilter("")}>Tozalash</Button>}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : bookings.length === 0 ? (
        <div className="text-center py-16 glass rounded-2xl">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-lg font-medium">Bronlar yo'q</p>
          <p className="text-sm text-muted-foreground mt-1">Yangi bron yarating</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking: any) => (
            <div key={booking.id} className="glass rounded-xl p-4 border border-white/5 hover:border-white/10 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold">{booking.customerName}</p>
                    <Badge className={`text-xs border ${STATUS_COLORS[booking.status] || STATUS_COLORS.pending}`}>
                      {STATUS_LABELS[booking.status] || booking.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary mt-1">{booking.serviceName}</p>
                  {booking.employeeName && <p className="text-xs text-muted-foreground">Xodim: {booking.employeeName}</p>}
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />{booking.bookingDate}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />{booking.bookingTime}
                    </span>
                    {booking.amount > 0 && (
                      <span className="text-xs font-medium text-green-400">{Number(booking.amount).toLocaleString()} so'm</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {booking.status === "pending" && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-green-400 hover:text-green-300"
                      onClick={() => updateStatus(booking.id, "confirmed")} title="Tasdiqlash">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  {booking.status === "confirmed" && (
                    <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-400 hover:text-blue-300"
                      onClick={() => updateStatus(booking.id, "completed")} title="Bajarildi">
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-300"
                    onClick={() => deleteBooking(booking.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
