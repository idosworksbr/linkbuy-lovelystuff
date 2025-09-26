
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
            <span className="text-2xl font-bold">MyLinkBuy</span>
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
            <span className="text-whatsapp block">profissional</span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Crie um catálogo completo com drag & drop, personalize temas, organize por categorias 
            e acompanhe suas vendas com analytics avançado.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/login">
              <Button className="btn-hero text-lg px-8 py-4">
                Criar meu catálogo grátis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* New Features Showcase */}
      <section className="container mx-auto px-4 py-16 bg-gray-50">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Funcionalidades Profissionais</h2>
          <p className="text-lg text-muted-foreground">Tudo que você precisa para vender online</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="dashboard-card text-center scale-in">
            <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag & Drop</h3>
            <p className="text-muted-foreground">
              Reorganize produtos e categorias arrastando. Reordene tudo com facilidade.
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-purple-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Temas Personalizados</h3>
            <p className="text-muted-foreground">
              8 temas lindos, layouts personalizados e grids de produto únicos.
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Avançado</h3>
            <p className="text-muted-foreground">
              Acompanhe visualizações, conversões e performance de cada produto.
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Animações Premium</h3>
            <p className="text-muted-foreground">
              LED piscante em produtos com desconto. Chame atenção para ofertas especiais.
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão Completa</h3>
            <p className="text-muted-foreground">
              Controle estoque, custos, códigos de produtos e status de ativo/inativo.
            </p>
          </div>

          <div className="dashboard-card text-center scale-in">
            <div className="bg-indigo-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Selo Verificado</h3>
            <p className="text-muted-foreground">
              Mostre credibilidade com o selo de verificação oficial no seu catálogo.
            </p>
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
          <p>&copy; 2024 <a href="https://mylinkbuy.com" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">MyLinkBuy</a>. Feito com ❤️ para empreendedores.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
