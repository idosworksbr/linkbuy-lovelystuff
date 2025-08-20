
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Package, Settings, User, LogOut, ExternalLink } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await signOut();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleViewCatalog = () => {
    if (profile?.store_url) {
      // Abrir em nova aba
      window.open(`/catalog/${profile.store_url}`, '_blank');
    } else {
      navigate("/dashboard/settings");
    }
  };

  const menuItems = [
    {
      label: "Dashboard",
      icon: Home,
      path: "/dashboard",
      active: location.pathname === "/dashboard"
    },
    {
      label: "Adicionar Produto",
      icon: Package,
      path: "/dashboard/add-product",
      active: location.pathname === "/dashboard/add-product"
    },
    {
      label: "Configurações",
      icon: Settings,
      path: "/dashboard/settings",
      active: location.pathname === "/dashboard/settings"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">LinkBuy</h1>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex space-x-8">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    item.active
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCatalog}
                className="hidden sm:flex items-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Ver meu catálogo</span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.profile_photo_url || ""} alt={profile?.name || "Usuário"} />
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{profile?.name || "Usuário"}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate("/dashboard/settings")}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? "Saindo..." : "Sair"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-2 w-full px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    item.active
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewCatalog}
                className="w-full mt-2 flex items-center justify-center space-x-2"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Ver meu catálogo</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
