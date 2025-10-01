import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Image, List, Grid, ChevronLeft, ChevronRight, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import DashboardLayout from "@/components/DashboardLayout";
import ProductFormAdvanced from "@/components/ProductFormAdvanced";
import { ProductListView } from "@/components/ProductListView";
import { OnboardingForm } from "@/components/OnboardingForm";
import { ProductFilters } from "@/components/ProductFilters";
import { useNavigate } from "react-router-dom";
import { useProducts, Product } from "@/hooks/useProducts";
import { useCategories } from "@/hooks/useCategories";
import { useProfile } from "@/hooks/useProfile";
import { useAnalytics } from "@/hooks/useAnalytics";
import { usePageTitle } from "@/hooks/usePageTitle";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductPrices } from '@/lib/priceUtils';
import { useStoreUrlGeneration } from "@/hooks/useStoreUrlGeneration";
import { useAuth } from "@/hooks/useAuth";

const Dashboard = () => {
  usePageTitle(); // Set dynamic page title
  const { user } = useAuth();
  const { products, loading, updateProduct, deleteProduct, createProduct } = useProducts();
  const { categories } = useCategories();
  const { profile, updateProfile } = useProfile();
  const { storeAnalytics, loading: analyticsLoading } = useAnalytics();
  
  // Gerar store_url no primeiro login se for NULL
  useStoreUrlGeneration(user?.id, profile?.store_url);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(() => {
    const saved = localStorage.getItem('dashboard-items-per-page');
    return saved ? parseInt(saved) : 10;
  });

  // Save pagination preferences
  useEffect(() => {
    localStorage.setItem('dashboard-items-per-page', itemsPerPage.toString());
    localStorage.setItem('dashboard-current-page', currentPage.toString());
  }, [itemsPerPage, currentPage]);

  // Load current page from localStorage on mount
  useEffect(() => {
    const savedPage = localStorage.getItem('dashboard-current-page');
    if (savedPage) {
      setCurrentPage(parseInt(savedPage));
    }
  }, []);

  // Use filtered products for display
  const displayProducts = filteredProducts.length > 0 ? filteredProducts : products;
  
  // Calculate pagination
  const totalPages = Math.ceil(displayProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = displayProducts.slice(startIndex, endIndex);
  const navigate = useNavigate();

  // Check if user needs onboarding - usar onboarding_completed ao invés de store_name/url
  const needsOnboarding = profile && !profile.onboarding_completed;
  
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

  const handleToggleProductStatus = async (product: Product) => {
    const newStatus = product.status === 'inactive' ? 'active' : 'inactive';
    
    try {
      await updateProduct(product.id, {
        ...product,
        status: newStatus
      } as any);
    } catch (error) {
      console.error('Error toggling product status:', error);
    }
  };

  const handleOnboardingComplete = async (data: any) => {
    setIsLoading(true);
    try {
      // Marcar onboarding como completo
      await updateProfile({ onboarding_completed: true });
      console.log('Onboarding data:', data);
      setShowOnboarding(false);
      // Reload para pegar dados atualizados
      setTimeout(() => {
        window.location.reload();
      }, 500);
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

  const handleActivateCatalog = async () => {
    setIsActivating(true);
    try {
      await updateProfile({ catalog_visible: true });
      setShowActivateDialog(false);
      window.location.reload();
    } catch (error) {
      console.error('Error activating catalog:', error);
    } finally {
      setIsActivating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Catalog Inactive Badge */}
        {profile?.catalog_visible === false && (
          <Badge 
            variant="destructive" 
            className="cursor-pointer hover:bg-red-700 transition-colors flex items-center gap-2 w-fit py-2 px-4"
            onClick={() => setShowActivateDialog(true)}
          >
            <EyeOff className="h-4 w-4" />
            <span>Catálogo Inativo - Clique para ativar</span>
          </Badge>
        )}

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
          {/* Product Filters */}
          <ProductFilters 
            products={products}
            categories={categories}
            onFiltersChange={setFilteredProducts}
          />
          
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Produtos</h2>
              <p className="text-sm text-muted-foreground">
                {displayProducts.length} produto(s) {displayProducts.length !== products.length ? `filtrado(s) de ${products.length}` : 'cadastrado(s)'}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              
              {/* Items per page selector */}
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
                className="text-xs px-2 py-1 border rounded-md bg-background"
              >
                <option value={10}>10 por página</option>
                <option value={20}>20 por página</option>
                <option value={30}>30 por página</option>
              </select>
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
            ) : displayProducts.length > 0 ? (
            <>
              {viewMode === 'list' ? (
                <ProductListView
                  products={paginatedProducts as any}
                  categories={categories}
                  onEdit={handleEditProduct}
                  onDelete={handleDeleteProduct}
                  onView={handleViewProduct}
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product) => {
                    const isInactive = product.status === 'inactive';
                    return (
                      <Card key={product.id} className={`group hover:shadow-lg transition-shadow ${isInactive ? 'opacity-60' : ''}`}>
                        <CardContent className="p-4">
                          <div className="aspect-square bg-muted rounded-lg mb-4 overflow-hidden relative">
                            {isInactive && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                <span className="text-white text-xs font-medium bg-red-600 px-2 py-1 rounded">
                                  INATIVO
                                </span>
                              </div>
                            )}
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
                            {(() => {
                              const prices = getProductPrices(product);
                              return (
                                <div className="flex flex-col">
                                  {prices.hasDiscount ? (
                                    <>
                                      <span className="text-sm text-muted-foreground line-through">
                                        R$ {prices.formattedOriginalPrice}
                                      </span>
                                      <span className="font-bold text-lg text-success">
                                        R$ {prices.formattedFinalPrice}
                                      </span>
                                    </>
                                  ) : (
                                    <span className="font-bold text-lg">
                                      R$ {prices.formattedFinalPrice}
                                    </span>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleProductStatus(product)}
                              className={`${isInactive ? 'text-green-600 hover:text-green-700 hover:border-green-300' : 'text-orange-600 hover:text-orange-700 hover:border-orange-300'}`}
                            >
                              {isInactive ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
                              {isInactive ? 'Ativar' : 'Inativar'}
                            </Button>
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
                    );
                  })}
                </div>
              )}
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando {startIndex + 1} a {Math.min(endIndex, displayProducts.length)} de {displayProducts.length} produtos
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Anterior
                    </Button>
                    
                    <span className="text-sm px-3 py-1 bg-muted rounded">
                      {currentPage} de {totalPages}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Próximo
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : displayProducts.length === 0 && products.length > 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-4">
                  Nenhum produto corresponde aos filtros aplicados
                </p>
              </CardContent>
            </Card>
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

        {/* Activate Catalog Dialog */}
        <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ativar Catálogo Público?</AlertDialogTitle>
              <AlertDialogDescription>
                Seu catálogo voltará a ser visível para todos os visitantes.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleActivateCatalog}
                disabled={isActivating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isActivating ? "Ativando..." : "Ativar"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;