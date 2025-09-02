
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AddProduct from "./pages/AddProduct";
import CustomLinks from "@/pages/CustomLinks";
import Settings from "@/pages/Settings";
import Plans from "@/pages/Plans";
import Subscription from "@/pages/Subscription";
import Analytics from "./pages/Analytics";
import Catalog from "./pages/Catalog";
import ProductDetail from "./pages/ProductDetail";
import NotFound from "./pages/NotFound";
import AllCategories from "./pages/AllCategories";
import CategoryProducts from "./pages/CategoryProducts";
import Categories from "./pages/Categories";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="/dashboard/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
            <Route path="/catalog/:storeUrl" element={<Catalog />} />
            <Route path="/catalog/:storeUrl/categories" element={<AllCategories />} />
            <Route path="/catalog/:storeUrl/category/:categoryId" element={<CategoryProducts />} />
            <Route path="/catalog/:storeUrl/product/:productId" element={<ProductDetail />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
