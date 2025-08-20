
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Smartphone, Zap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-whatsapp/5 to-catalog flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp/5 to-catalog">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-8 w-8 text-whatsapp" />
            <span className="text-2xl font-bold">LinkBuy</span>
          </div>
          <Link to="/login">
            <Button variant="outline">Entrar</Button>
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto animate-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Seu catálogo digital
            <span className="text-whatsapp block">em segundos</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Crie um catálogo profissional para seu negócio e receba pedidos pelo WhatsApp. 
            Simples, rápido e sem complicações.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button className="btn-hero text-lg px-8 py-4">
                Criar meu catálogo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" className="text-lg px-8 py-4">
              Ver exemplo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="dashboard-card text-center scale-in">
            <div className="bg-whatsapp/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-whatsapp" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Super Rápido</h3>
            <p className="text-muted-foreground">
              Configure seu catálogo em menos de 5 minutos
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-whatsapp/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-whatsapp" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Mobile First</h3>
            <p className="text-muted-foreground">
              Perfeito para compartilhar no Instagram e WhatsApp
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-whatsapp/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-whatsapp" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Pedidos Diretos</h3>
            <p className="text-muted-foreground">
              Seus clientes fazem pedidos direto pelo WhatsApp
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 LinkBuy. Feito com ❤️ para empreendedores.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
