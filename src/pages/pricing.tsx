import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { useGetMe } from "@/api-client";

export default function Pricing() {
  const { data: user } = useGetMe();

  const plans = [
    {
      id: "start",
      name: "START",
      price: "299,000 UZS",
      period: "/ oyiga",
      description: "Kichik biznes va do'konlar uchun",
      features: [
        "5 tagacha foydalanuvchi",
        "1,000 tagacha mahsulot",
        "POS Kassa terminali",
        "Ombor nazorati",
        "Moliya (Kirim/Chiqim)",
        "Baza darajadagi hisobotlar"
      ]
    },
    {
      id: "business",
      name: "BUSINESS",
      price: "599,000 UZS",
      period: "/ oyiga",
      description: "O'rta biznes va tarmoqlar uchun",
      features: [
        "25 tagacha foydalanuvchi",
        "10,000 tagacha mahsulot",
        "Mijozlar bazasi (CRM)",
        "Xodimlar boshqaruvi",
        "Kengaytirilgan hisobotlar",
        "Hujjatlar aylanmasi",
        "AI Direktor (Cheklangan)"
      ],
      popular: true
    },
    {
      id: "enterprise",
      name: "ENTERPRISE",
      price: "Kelishilgan",
      period: "",
      description: "Katta kompaniyalar uchun to'liq yechim",
      features: [
        "Cheksiz foydalanuvchilar",
        "Cheksiz mahsulotlar",
        "API va integratsiyalar",
        "White label (O'z brendingiz)",
        "Shaxsiy menejer",
        "Maxsus hisobotlar",
        "AI Direktor (To'liq)",
        "24/7 Texnik qo'llab-quvvatlash"
      ]
    }
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tarif Rejalar</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Biznesingiz hajmiga mos tarifni tanlang va faoliyatingizni raqamlashtiring. 
          Istalgan vaqtda tarifni o'zgartirishingiz mumkin.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mt-8">
        {plans.map((plan) => (
          <Card 
            key={plan.name} 
            className={`relative flex flex-col bg-card border-border ${
              plan.popular ? 'border-primary shadow-lg shadow-primary/10 scale-105 z-10' : ''
            }`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-0 right-0 flex justify-center">
                <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Eng ommabop
                </span>
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
                <span className="text-muted-foreground font-medium">{plan.period}</span>
              </div>
              <ul className="space-y-3">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                variant={plan.popular ? "default" : "outline"} 
                className="w-full h-12 text-md font-semibold"
                disabled={user?.subscriptionPlan === plan.id}
              >
                {user?.subscriptionPlan === plan.id ? "Sizning taripingiz" : "Ulanish"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
