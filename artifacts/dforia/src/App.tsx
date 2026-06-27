import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";

import { CartProvider } from "./contexts/CartContext";
import { Layout } from "./components/Layout";
import { AdminLayout } from "./components/AdminLayout";
import { useDailyQuotaReset } from "./hooks/useDailyQuotaReset";

// Customer Pages
import Home from "./pages/Home";
import Menu from "./pages/Menu";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";

// Admin Pages
import AdminLogin from "./pages/admin/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import MenuManage from "./pages/admin/MenuManage";
import BannersManage from "./pages/admin/Banners";
import OrdersManage from "./pages/admin/OrdersManage";
import KasirPOS from "./pages/admin/Kasir";
import Keuangan from "./pages/admin/Keuangan";
import Laporan from "./pages/admin/Laporan";
import Settings from "./pages/admin/Settings";
import KuponManage from "./pages/admin/Kupon";

const queryClient = new QueryClient();

function A({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}

function AppInner() {
  useDailyQuotaReset();
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppInner />
            <Switch>
              {/* Admin Login — standalone */}
              <Route path="/admin/login" component={AdminLogin} />

              {/* Admin pages */}
              <Route path="/admin"><A><AdminDashboard /></A></Route>
              <Route path="/admin/menu"><A><MenuManage /></A></Route>
              <Route path="/admin/banners"><A><BannersManage /></A></Route>
              <Route path="/admin/orders"><A><OrdersManage /></A></Route>
              <Route path="/admin/kasir"><A><KasirPOS /></A></Route>
              <Route path="/admin/keuangan"><A><Keuangan /></A></Route>
              <Route path="/admin/laporan"><A><Laporan /></A></Route>
              <Route path="/admin/settings"><A><Settings /></A></Route>
              <Route path="/admin/kupon"><A><KuponManage /></A></Route>

              {/* Customer pages */}
              <Route path="/"><Layout><Home /></Layout></Route>
              <Route path="/menu"><Layout><Menu /></Layout></Route>
              <Route path="/menu/:id"><Layout><ProductDetail /></Layout></Route>
              <Route path="/cart"><Layout><Cart /></Layout></Route>
              <Route path="/checkout"><Layout><Checkout /></Layout></Route>
              <Route path="/orders"><Layout><Orders /></Layout></Route>
              <Route path="/profile"><Layout><Profile /></Layout></Route>

              <Route component={NotFound} />
            </Switch>
          </WouterRouter>
          <Toaster />
          <Sonner position="top-center" />
        </TooltipProvider>
      </CartProvider>
    </QueryClientProvider>
  );
}

export default App;
