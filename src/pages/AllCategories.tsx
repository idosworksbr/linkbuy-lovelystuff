import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CatalogTheme, useThemeClasses } from "@/components/CatalogTheme";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getProductPrices } from "@/lib/priceUtils";
import { DiscountAnimation } from "@/components/DiscountAnimation";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discount?: number | null;
  discount_animation_enabled?: boolean;
  discount_animation_color?: string | null;
  images: string[];
  category_id: string | null;
  categories?: {
    id: string;
    name: string;
    image_url: string | null;
  };
}

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
}

interface StoreProfile {
  catalog_theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  background_color: string;
  background_image_url?: string | null;
  background_type?: 'color' | 'image';
}

const AllCategories = () => {
  const { storeUrl } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [storeProfile, setStoreProfile] = useState<StoreProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [priceSort, setPriceSort] = useState<string>("none");
  
  const theme = storeProfile?.catalog_theme || 'light';
  const themeClasses = useThemeClasses(theme);

  useEffect(() => {
    const fetchData = async () => {
      if (!storeUrl) return;
      
      try {
        setLoading(true);
        
        // Fetch catalog data
        const response = await fetch(`https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/catalog/${storeUrl}`);
        if (!response.ok) throw new Error('Failed to fetch catalog');
        
        const catalogData = await response.json();
        setStoreProfile(catalogData.store);
        setCategories(catalogData.categories || []);
        setProducts(catalogData.products || []);
        setFilteredProducts(catalogData.products || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Erro ao carregar categorias",
          description: "Não foi possível carregar os dados.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeUrl, toast]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      if (selectedCategory === "uncategorized") {
        filtered = filtered.filter(product => !product.category_id);
      } else {
        filtered = filtered.filter(product => product.category_id === selectedCategory);
      }
    }

    // Sort by price
    if (priceSort === "low-to-high") {
      filtered.sort((a, b) => {
        const pricesA = getProductPrices({ id: a.id, name: a.name, price: a.price, discount: a.discount || 0 });
        const pricesB = getProductPrices({ id: b.id, name: b.name, price: b.price, discount: b.discount || 0 });
        return pricesA.finalPrice - pricesB.finalPrice;
      });
    } else if (priceSort === "high-to-low") {
      filtered.sort((a, b) => {
        const pricesA = getProductPrices({ id: a.id, name: a.name, price: a.price, discount: a.discount || 0 });
        const pricesB = getProductPrices({ id: b.id, name: b.name, price: b.price, discount: b.discount || 0 });
        return pricesB.finalPrice - pricesA.finalPrice;
      });
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory, priceSort]);

  const handleProductClick = (product: Product) => {
    navigate(`/catalog/${storeUrl}/product/${product.id}`);
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={themeClasses.textMuted}>Carregando categorias...</p>
        </div>
      </div>
    );
  }

  return (
    <CatalogTheme 
      theme={theme} 
      backgroundColor={storeProfile?.background_color || '#ffffff'}
      backgroundImage={storeProfile?.background_image_url}
      backgroundType={storeProfile?.background_type}
    >
      <div className={`max-w-md mx-auto ${themeClasses.card} min-h-screen shadow-lg`}>
        
        {/* Header */}
        <div className={`px-4 pt-6 pb-4 border-b ${themeClasses.header}`}>
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate(`/catalog/${storeUrl}`)}
              className={`rounded-full hover:scale-105 transition-all ${themeClasses.buttonOutline}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
            <h1 className={`text-xl font-semibold ${themeClasses.text}`}>Todas as Categorias</h1>
            <div className="w-16"></div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar produtos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  <SelectItem value="uncategorized">Sem categoria</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={priceSort} onValueChange={setPriceSort}>
                <SelectTrigger className="flex-1">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Preço" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sem ordenação</SelectItem>
                  <SelectItem value="low-to-high">Menor preço</SelectItem>
                  <SelectItem value="high-to-low">Maior preço</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="p-4">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12">
              <p className={`${themeClasses.textMuted} mb-2`}>
                Nenhum produto encontrado
              </p>
              <p className={`text-sm ${themeClasses.textMuted}`}>
                Tente ajustar os filtros de busca
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((product, index) => {
                const prices = getProductPrices({
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  discount: product.discount || 0,
                });
                const hasDiscount = prices.hasDiscount;
                const discountAnimationEnabled = product.discount_animation_enabled && hasDiscount;

                const productCard = (
                  <div 
                    key={product.id}
                    onClick={() => handleProductClick(product)}
                    className="cursor-pointer group animate-fade-in bg-white rounded-xl p-3 shadow-sm hover:shadow-lg transition-all duration-300 border"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Product Image */}
                    <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-gray-100 relative">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          Sem imagem
                        </div>
                      )}
                      
                      {/* Category Badge */}
                      {product.categories && (
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                          {product.categories.name}
                        </div>
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="space-y-1">
                      <h3 className="font-medium text-sm line-clamp-2 text-gray-900">
                        {product.name}
                      </h3>
                      <div className="flex items-baseline gap-2">
                        {hasDiscount && (
                          <span className="text-xs line-through opacity-70">
                            R$ {prices.formattedOriginalPrice}
                          </span>
                        )}
                        <p className="text-lg font-bold text-green-600">
                          R$ {prices.formattedFinalPrice}
                        </p>
                      </div>
                    </div>
                  </div>
                );

                return discountAnimationEnabled ? (
                  <DiscountAnimation 
                    key={product.id}
                    enabled={true} 
                    color={product.discount_animation_color || '#ff0000'}
                    className="rounded-xl"
                  >
                    {productCard}
                  </DiscountAnimation>
                ) : productCard;
              })}
            </div>
          )}
        </div>

        {/* Results Counter */}
        <div className={`px-4 py-3 text-center text-sm border-t ${themeClasses.textMuted}`}>
          {filteredProducts.length} produto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </div>
      </div>
    </CatalogTheme>
  );
};

export default AllCategories;