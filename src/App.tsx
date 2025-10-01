import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { MasterAuthProvider } from "@/hooks/useMasterAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { registerServiceWorker } from "@/lib/pwaUtils";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import CustomLinks from "@/pages/CustomLinks";
import Settings from "@/pages/Settings";
import Plans from "@/pages/Plans";
import Subscription from "@/pages/Subscription";
import StripeDebug from "@/pages/StripeDebug";
import CustomerPortal from "@/pages/CustomerPortal";
import Analytics from "./pages/Analytics";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import AllCategories from "./pages/AllCategories";
import CategoryProducts from "./pages/CategoryProducts";
import Categories from "./pages/Categories";
import MasterLogin from "./pages/MasterLogin";
import MasterDashboard from "./pages/MasterDashboard";
import LeadsManagement from "./pages/LeadsManagement";

// Demo pages
import DemoRestaurante from "./pages/demos/DemoRestaurante";
import DemoLojaCelular from "./pages/demos/DemoLojaCelular";
import DemoCosmeticos from "./pages/demos/DemoCosmeticos";
import DemoJoalheria from "./pages/demos/DemoJoalheria";
import DemoLanchonete from "./pages/demos/DemoLanchonete";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Register service worker for PWA
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MasterAuthProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <PWAInstallPrompt />
          <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Demo Routes */}
            <Route path="/demo/restaurante-elegante" element={<DemoRestaurante />} />
            <Route path="/demo/loja-celular" element={<DemoLojaCelular />} />
            <Route path="/demo/cosmeticos-premium" element={<DemoCosmeticos />} />
            <Route path="/demo/joalheria-luxo" element={<DemoJoalheria />} />
            <Route path="/demo/lanchonete-delivery" element={<DemoLanchonete />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/add-product" element={
              <ProtectedRoute>
                <AddProduct />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/analytics" element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/custom-links" element={
              <ProtectedRoute>
                <CustomLinks />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/settings" element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/plans" element={
              <ProtectedRoute>
                <Plans />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/subscription" element={
              <ProtectedRoute>
                <Subscription />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/stripe-debug" element={
              <ProtectedRoute>
                <StripeDebug />
              </ProtectedRoute>
            } />
            <Route path="/dashboard/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/dashboard/leads" element={<ProtectedRoute><LeadsManagement /></ProtectedRoute>} />
            
            {/* Master routes */}
            <Route path="/loginmaster" element={<MasterLogin />} />
            <Route path="/master/dashboard" element={<MasterDashboard />} />
            
            {/* Rotas do catálogo em inglês */}
            <Route path="/catalog/:storeUrl" element={<Catalog />} />
            <Route path="/catalog/:storeUrl/categories" element={<AllCategories />} />
            <Route path="/catalog/:storeUrl/category/:categoryId" element={<CategoryProducts />} />
            <Route path="/catalog/:storeUrl/product/:productId" element={<ProductDetail />} />
            
            {/* Rotas do catálogo em português (aliases) */}
            <Route path="/catalogo/:storeUrl" element={<Catalog />} />
            <Route path="/catalogo/:storeUrl/categorias" element={<AllCategories />} />
            <Route path="/catalogo/:storeUrl/categoria/:categoryId" element={<CategoryProducts />} />
            <Route path="/catalogo/:storeUrl/produto/:productId" element={<ProductDetail />} />
            
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </MasterAuthProvider>
    </AuthProvider>
  </QueryClientProvider>
  );
};

export default App;
