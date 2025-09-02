import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogTheme, useThemeClasses } from "@/components/CatalogTheme";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  image_url: string | null;
}

interface StoreProfile {
  id: string;
  store_name: string;
  catalog_theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  background_color: string;
  background_image_url?: string | null;
  background_type?: 'color' | 'image';
  product_grid_layout?: 'default' | 'round' | 'instagram';
  catalog_layout?: 'overlay' | 'bottom';
  hide_footer?: boolean;
}

interface CategoryData {
  store: StoreProfile;
  category: Category;
  products: Product[];
  meta: {
    total_products: number;
    generated_at: string;
  };
}

const CategoryProducts = () => {
  const { storeUrl, categoryId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [categoryData, setCategoryData] = useState<CategoryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const theme = categoryData?.store.catalog_theme || 'light';
  const layout = categoryData?.store.catalog_layout || 'bottom';
  const themeClasses = useThemeClasses(theme);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      if (!storeUrl || !categoryId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`https://rpkawimruhfqhxbpavce.supabase.co/functions/v1/category-products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            store_url: storeUrl,
            category_id: categoryId
          })
        });

        if (!response.ok) {
          throw new Error('Failed to fetch category products');
        }

        const data: CategoryData = await response.json();
        setCategoryData(data);
      } catch (error) {
        console.error('Error fetching category products:', error);
        const errorMessage = error instanceof Error ? error.message : 'Não foi possível carregar os produtos';
        setError(errorMessage);
        toast({
          title: "Erro ao carregar produtos",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryProducts();
  }, [storeUrl, categoryId, toast]);

  const handleProductClick = (product: Product) => {
    navigate(`/catalog/${storeUrl}/product/${product.id}`);
  };

  const renderProduct = (product: Product, index: number) => {
    const gridLayout = categoryData?.store.product_grid_layout || 'default';
    const baseClasses = "cursor-pointer group animate-fade-in relative";
    const animationStyle = { animationDelay: `${index * 50}ms` };

    if (gridLayout === 'instagram') {
      return (
        <div 
          key={product.id} 
          onClick={() => handleProductClick(product)} 
          className={`${baseClasses} aspect-square overflow-hidden`}
          style={animationStyle}
        >
          {product.images && product.images.length > 0 ? (
            <img 
              src={product.images[0]} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400 text-xs text-center p-2">Sem imagem</span>
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
              <h3 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-xs font-bold">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      );
    }

    if (gridLayout === 'round') {
      return (
        <div 
          key={product.id} 
          onClick={() => handleProductClick(product)} 
          className={`${baseClasses} bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all`}
          style={animationStyle}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 mb-2 ring-2 ring-gray-200 group-hover:ring-4 group-hover:ring-primary/20 transition-all">
              {product.images && product.images.length > 0 ? (
                <img 
                  src={product.images[0]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-xs">Sem imagem</span>
                </div>
              )}
            </div>
            
            <div className="text-center">
              <h3 className="text-xs font-medium text-gray-800 line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-xs font-bold text-green-600">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        </div>
      );
    }

    // Default layout
    return (
      <div 
        key={product.id} 
        onClick={() => handleProductClick(product)} 
        className={`${baseClasses} aspect-square bg-white rounded-sm overflow-hidden shadow-sm hover:shadow-md transition-all`}
        style={animationStyle}
      >
        {product.images && product.images.length > 0 ? (
          <img 
            src={product.images[0]} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center p-2">Sem imagem</span>
          </div>
        )}
        
        {layout === 'overlay' ? (
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
              <h3 className="text-xs font-medium line-clamp-2 mb-1">{product.name}</h3>
              <p className="text-xs font-bold">R$ {product.price.toFixed(2).replace('.', ',')}</p>
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <h3 className="text-xs font-medium line-clamp-2 mb-1 text-white drop-shadow-lg">{product.name}</h3>
              <p className="drop-shadow-lg text-green-600 text-left font-semibold text-xs">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className={themeClasses.textMuted}>Carregando produtos...</p>
        </div>
      </div>
    );
  }

  if (error || !categoryData) {
    return (
      <div className={`min-h-screen ${themeClasses.container} flex items-center justify-center`}>
        <div className={`text-center max-w-md mx-auto p-6 ${themeClasses.card} rounded-lg shadow-sm border`}>
          <h1 className={`text-2xl font-bold ${themeClasses.text} mb-3`}>Categoria não encontrada</h1>
          <p className={`${themeClasses.textMuted} mb-4`}>
            {error || "A categoria que você está procurando não existe ou foi removida."}
          </p>
          <Button onClick={() => navigate(`/catalog/${storeUrl}`)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao catálogo
          </Button>
        </div>
      </div>
    );
  }

  const { store, category, products } = categoryData;
  const gridLayout = store.product_grid_layout || 'default';

  return (
    <CatalogTheme 
      theme={theme} 
      backgroundColor={store.background_color}
      backgroundImage={store.background_image_url}
      backgroundType={store.background_type}
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
            <div className="text-center flex-1">
              <h1 className={`text-xl font-semibold ${themeClasses.text}`}>{category.name}</h1>
              <p className={`text-sm ${themeClasses.textMuted}`}>
                {products.length} produto{products.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="w-16"></div>
          </div>

          {/* Category Image */}
          {category.image_url && (
            <div className="flex justify-center mb-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-tr from-purple-400 via-pink-400 to-red-400 p-1">
                <div className="w-full h-full rounded-full overflow-hidden bg-white p-1">
                  <img 
                    src={category.image_url} 
                    alt={category.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="p-1 animate-fade-in">
          {products.length > 0 ? (
            <div className={gridLayout === 'instagram' ? 'grid grid-cols-3' : gridLayout === 'round' ? 'grid grid-cols-3 gap-2' : 'grid grid-cols-3 gap-1'}>
              {products.map((product, index) => renderProduct(product, index))}
            </div>
          ) : (
            <div className={`text-center py-16 ${themeClasses.card} rounded-lg mx-2 bg-white/90 backdrop-blur-sm`}>
              <div className={`w-16 h-16 ${themeClasses.accent} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <Grid3X3 className={`h-8 w-8 ${themeClasses.textMuted}`} />
              </div>
              <h3 className={`font-medium ${themeClasses.text} mb-2`}>Nenhum produto nesta categoria</h3>
              <p className={`text-sm ${themeClasses.textMuted}`}>
                Esta categoria ainda não possui produtos cadastrados.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!store.hide_footer && (
          <div className={`text-center py-6 text-xs ${themeClasses.textMuted} border-t rounded-t-xl mx-4`} 
               style={{ backgroundColor: theme === 'light' ? '#f8f9fa' : theme === 'dark' ? '#374151' : '#fef3c7' }}>
            Criado com 💚 no LinkBuy
          </div>
        )}
      </div>
    </CatalogTheme>
  );
};

export default CategoryProducts;