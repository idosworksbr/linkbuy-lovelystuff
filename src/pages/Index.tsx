import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingBag, Smartphone, Zap, ArrowRight, Star, Quote, CheckCircle, Eye, Crown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

      {/* Catalog Previews Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Modelos Profissionais</h2>
          <p className="text-lg text-muted-foreground">Veja exemplos de catálogos criados com MyLinkBuy</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-7xl mx-auto">
          {[
            {
              title: "Restaurante",
              description: "Menu digital completo",
              image: "/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png",
              theme: "gold"
            },
            {
              title: "Loja de Celular", 
              description: "Smartphones e acessórios",
              image: "/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png",
              theme: "dark"
            },
            {
              title: "Cosméticos",
              description: "Produtos de beleza",
              image: "/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png",
              theme: "rose"
            },
            {
              title: "Joias",
              description: "Peças exclusivas",
              image: "/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png",
              theme: "purple"
            },
            {
              title: "Lanchonete",
              description: "Lanches e bebidas",
              image: "/lovable-uploads/0b16b51f-a5ac-4326-b699-6209a7d083da.png",
              theme: "mint"
            }
          ].map((catalog, index) => (
            <Card key={catalog.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-4">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg mb-3 overflow-hidden">
                  <img 
                    src={catalog.image} 
                    alt={catalog.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-lg mb-1">{catalog.title}</h3>
                <p className="text-sm text-muted-foreground mb-3">{catalog.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Demo
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">O que nossos clientes dizem</h2>
          <p className="text-lg text-muted-foreground">Depoimentos reais de quem transformou suas vendas</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              name: "Marina Silva",
              business: "Loja de Cosméticos",
              text: "Desde que criei meu catálogo no MyLinkBuy, minhas vendas pelo WhatsApp aumentaram 300%! A organização por categorias e os temas lindos impressionam meus clientes.",
              rating: 5
            },
            {
              name: "Carlos Santos", 
              business: "Restaurante Família",
              text: "O catálogo digital revolucionou nosso delivery. Os clientes adoram navegar pelo cardápio, e eu acompanho quais pratos mais vendem pelo analytics.",
              rating: 5
            },
            {
              name: "Ana Costa",
              business: "Joalheria Premium",
              text: "Com o selo verificado e os temas elegantes, minha loja ganhou muito mais credibilidade. Agora vendo peças de alto valor sem medo!",
              rating: 5
            }
          ].map((testimonial, index) => (
            <Card key={index} className="relative">
              <CardContent className="p-6">
                <Quote className="h-8 w-8 text-whatsapp/20 mb-4" />
                <p className="text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <div>
                  <p className="font-semibold">{testimonial.name}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.business}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Persuasive Content Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">Por que um catálogo profissional é essencial?</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-6">
              <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Crown className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Primeira Impressão Decide</h3>
              <p className="text-muted-foreground">
                Um catálogo bem organizado e visualmente atrativo gera confiança instantânea. 
                Clientes preferem comprar de lojas que demonstram profissionalismo.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Vendas Organizadas = Mais Lucro</h3>
              <p className="text-muted-foreground">
                Com produtos bem categorizados e informações claras, seus clientes encontram 
                rapidamente o que procuram, aumentando suas conversões em até 250%.
              </p>
            </Card>

            <Card className="text-center p-6">
              <div className="bg-purple-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Credibilidade é Tudo</h3>
              <p className="text-muted-foreground">
                Um catálogo profissional com fotos de qualidade e design moderno transmite 
                seriedade, fazendo clientes comprarem valores maiores com confiança.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Funcionalidades Profissionais</h2>
          <p className="text-lg text-muted-foreground">Tudo que você precisa para vender online</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="text-center p-6">
            <div className="bg-blue-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Drag & Drop</h3>
            <p className="text-muted-foreground">
              Reorganize produtos e categorias arrastando. Reordene tudo com facilidade.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-purple-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-purple-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Temas Personalizados</h3>
            <p className="text-muted-foreground">
              8 temas lindos, layouts personalizados e grids de produto únicos.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-green-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Analytics Avançado</h3>
            <p className="text-muted-foreground">
              Acompanhe visualizações, conversões e performance de cada produto.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-red-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Zap className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Animações Premium</h3>
            <p className="text-muted-foreground">
              LED piscante em produtos com desconto. Chame atenção para ofertas especiais.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-orange-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="h-8 w-8 text-orange-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Gestão Completa</h3>
            <p className="text-muted-foreground">
              Controle estoque, custos, códigos de produtos e status de ativo/inativo.
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="bg-indigo-500/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Crown className="h-8 w-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Selo Verificado</h3>
            <p className="text-muted-foreground">
              Mostre credibilidade com o selo de verificação oficial no seu catálogo.
            </p>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-6">
            Pronto para transformar suas vendas?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Junte-se a milhares de empreendedores que já descobriram o poder de um catálogo profissional
          </p>
          <Link to="/login">
            <Button size="lg" className="text-lg px-8 py-4">
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2024 <a href="https://www.mylinkbuy.com.br" target="_blank" rel="noopener noreferrer" className="hover:underline font-medium">MyLinkBuy</a>. Feito com ❤️ para empreendedores.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;