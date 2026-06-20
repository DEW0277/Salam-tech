import { useEffect } from "react";
import { initApiAuth } from "@/lib/api";
import { initTheme } from "@/hooks/use-theme";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { AppLayout } from "@/components/layout/app-layout";
import { AdminLayout } from "@/components/layout/admin-layout";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Pos from "@/pages/pos";
import Inventory from "@/pages/inventory";
import CRM from "@/pages/crm";
import Employees from "@/pages/employees";
import Finance from "@/pages/finance";
import Documents from "@/pages/documents";
import Ai from "@/pages/ai";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import Suppliers from "@/pages/suppliers";
import Purchases from "@/pages/purchases";
import Services from "@/pages/services";
import Categories from "@/pages/categories";

import AdminDashboard from "@/pages/admin/admin-dashboard";
import AdminCompanies from "@/pages/admin/admin-companies";
import AdminCompanyDetail from "@/pages/admin/admin-company-detail";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Super-admin section — separate layout, role-gated inside AdminLayout */}
      <Route path="/admin">
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      </Route>
      <Route path="/admin/companies">
        <AdminLayout>
          <AdminCompanies />
        </AdminLayout>
      </Route>
      <Route path="/admin/companies/:id">
        {(params) => (
          <AdminLayout>
            <AdminCompanyDetail id={params.id} />
          </AdminLayout>
        )}
      </Route>

      <Route>
        <AppLayout>
          <Switch>
            <Route path="/dashboard" component={Dashboard} />
            <Route path="/kassa" component={Pos} />
            <Route path="/inventory" component={Inventory} />
            <Route path="/crm" component={CRM} />
            <Route path="/employees" component={Employees} />
            <Route path="/finance" component={Finance} />
            <Route path="/documents" component={Documents} />
            <Route path="/ai" component={Ai} />
            <Route path="/reports" component={Reports} />
            <Route path="/settings" component={Settings} />
            <Route path="/suppliers" component={Suppliers} />
            <Route path="/purchases" component={Purchases} />
            <Route path="/xizmatlar" component={Services} />
            <Route path="/categories" component={Categories} />
            <Route component={NotFound} />
          </Switch>
        </AppLayout>
      </Route>
    </Switch>
  );
}

initTheme();

function App() {
  useEffect(() => {
    initApiAuth();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
