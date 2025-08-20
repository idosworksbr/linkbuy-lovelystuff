import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  ShoppingBag, 
  Package, 
  Plus, 
  Settings, 
  Menu,
  LogOut,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useProfile } from "@/hooks/useProfile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { profile } = useProfile();

  const navigation = [
    {
      name: "Meu Catálogo",
      href: "/dashboard",
      icon: Package,
      current: location.pathname === "/dashboard"
    },
    {
      name: "Adicionar Produto",
      href: "/dashboard/add-product",
      icon: Plus,
      current: location.pathname === "/dashboard/add-product"
    },
    {
      name: "Configurações",
      href: "/dashboard/settings",
      icon: Settings,
      current: location.pathname === "/dashboard/settings"
    }
  ];

  const handleLogout = () => {
    navigate('/');
  };

  const handleViewCatalog = () => {
    if (profile?.store_url) {
      window.open(`/catalog/${profile.store_url}`, '_blank');
    } else {
      // Se não tem store_url, redireciona para configurações
      navigate('/dashboard/settings');
    }
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 p-6 border-b">
        <ShoppingBag className="h-8 w-8 text-whatsapp" />
        <span className="text-xl font-bold">LinkBuy</span>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-6 py-6">
        <nav className="space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                item.current
                  ? "bg-whatsapp text-whatsapp-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          ))}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="p-6 border-t space-y-2">
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleViewCatalog}
        >
          <Eye className="h-4 w-4 mr-2" />
          Ver meu catálogo
        </Button>
        
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-catalog">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-50 lg:block lg:w-72 lg:overflow-y-auto lg:bg-card lg:border-r">
        <Sidebar />
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex items-center justify-between bg-card border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-whatsapp" />
            <span className="text-lg font-bold">LinkBuy</span>
          </div>
          
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <Sidebar />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        <main className="py-6 px-4 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
