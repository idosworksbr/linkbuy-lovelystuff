import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Image, List, Grid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import ProductFormAdvanced from "@/components/ProductFormAdvanced";
import { ProductListView } from "@/components/ProductListView";
import { OnboardingForm } from "@/components/OnboardingForm";
import { useNavigate } from "react-router-dom";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useProfile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { Skeleton } from "@/components/ui/skeleton";

const Dashboard = () => {
  const { products, loading, updateProduct, deleteProduct, createProduct } = useProducts();
  const { categories } = useCategories();
  const { profile, updateProfile } = useProfile();
  const { storeAnalytics, loading: analyticsLoading } = useAnalytics();
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  // Check if user needs onboarding and show automatically for first-time users
  const needsOnboarding = !profile?.store_name;
  
  // Auto-show onboarding for new users
  useEffect(() => {
    if (needsOnboarding && !loading && profile && !showOnboarding) {
      setShowOnboarding(true);
    }
  }, [needsOnboarding, loading, profile, showOnboarding]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M'
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k'
    }
    return num.toString()
  }

  const handleDeleteProduct = async (id: string) => {
    await deleteProduct(id);
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (data: any) => {
    if (!editingProduct) return;
    
    setIsLoading(true);
    try {
        await updateProduct(editingProduct.id, {
          name: data.name,
          description: data.description,
          price: parseFloat(data.price),
          images: data.images || [],
          category_id: data.category_id || null,
          code: data.code || null,
          weight: data.weight || null,
          cost: data.cost ? parseFloat(data.cost) : null,
          discount: data.discount ? parseFloat(data.discount) : null,
          status: data.status || 'active',
          discount_animation_enabled: data.discount_animation_enabled || false,
          discount_animation_color: data.discount_animation_color || '#ff0000',
        } as any);
        setEditingProduct(null);
    } catch (error) {
        console.error('Error updating product:', error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    setIsLoading(true);
    try {
      // TODO: Process onboarding data
      // Create category, product, update profile, etc.
      console.log('Onboarding data:', data);
      setShowOnboarding(false);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProduct = (product: Product) => {
    if (profile?.store_url) {
      navigate(`/catalog/${profile.store_url}/product/${product.id}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Onboarding Dialog */}
        {showOnboarding && (
          <Dialog open={showOnboarding} onOpenChange={setShowOnboarding}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <OnboardingForm
                onComplete={handleOnboardingComplete}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        )}

        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos e acompanhe o desempenho da sua loja
            </p>
          </div>
          <div className="flex gap-2">
            {needsOnboarding && (
              <Button 
                onClick={() => setShowOnboarding(true)}
                variant="outline"
              >
                Configurar Loja
              </Button>
            )}
            <Button onClick={() => navigate("/dashboard/add-product")}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total de Produtos</CardDescription>
              <CardTitle className="text-3xl">{products.length}</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Visualizações do Catálogo</CardDescription>
              {analyticsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <CardTitle className="text-3xl">
                  {formatNumber(storeAnalytics?.total_catalog_views || 0)}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Cliques no WhatsApp</CardDescription>
              {analyticsLoading ? (
                <Skeleton className="h-9 w-16" />
              ) : (
                <CardTitle className="text-3xl">
                  {formatNumber(storeAnalytics?.total_whatsapp_clicks || 0)}
                </CardTitle>
              )}
            </CardHeader>
          </Card>
        </div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Produtos</h2>
              <p className="text-sm text-muted-foreground">
                {products.length} produto(s) cadastrado(s)
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => profile && updateProfile({ 
                  show_all_products_in_feed: !profile.show_all_products_in_feed 
                })}
                className="text-xs"
              >
                {profile?.show_all_products_in_feed ? 'Mostrar todos' : 'Só sem categoria'}
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <ProductListView
                  products={products as any}
                  categories={categories}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onView={handleViewProduct}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Image className="h-8 w-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2 truncate">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex justify-between items-center mb-4">
                          <span className="font-bold text-lg">
                            R$ {product.price?.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditProduct(product)}
                            className="flex-1"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Editar
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Nenhum produto ainda</h3>
                <p className="text-muted-foreground mb-4">
                  Comece adicionando seu primeiro produto ao catálogo
                </p>
                <Button onClick={() => navigate("/dashboard/add-product")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Produto
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Product Dialog */}
        {editingProduct && (
          <Dialog open={!!editingProduct} onOpenChange={() => setEditingProduct(null)}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <ProductFormAdvanced
                product={editingProduct as any}
                onSubmit={handleUpdateProduct}
                onCancel={() => setEditingProduct(null)}
                isLoading={isLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;