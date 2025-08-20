
import { useState } from "react";
import { Plus, Edit, Trash2, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import ProductForm from "@/components/ProductForm";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

// Mock data - em produção viria de uma API
const mockProducts = [
  {
    id: 1,
    name: "Tênis Esportivo Premium",
    price: 299.90,
    image: "/api/placeholder/300/300",
    description: "Tênis confortável para atividades físicas"
  },
  {
    id: 2,
    name: "Camiseta Básica",
    price: 49.90,
    image: "/api/placeholder/300/300", 
    description: "Camiseta 100% algodão"
  },
  {
    id: 3,
    name: "Jaqueta Jeans",
    price: 159.90,
    image: "/api/placeholder/300/300",
    description: "Jaqueta jeans clássica"
  }
];

const Dashboard = () => {
  const [products, setProducts] = useState(mockProducts);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDeleteProduct = (id: number) => {
    setProducts(products.filter(p => p.id !== id));
    toast({
      title: "Produto removido",
      description: "O produto foi removido do seu catálogo.",
    });
  };

  const handleEditProduct = (product: any) => {
    setEditingProduct(product);
  };

  const handleUpdateProduct = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Simular atualização do produto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedProducts = products.map(p => 
        p.id === editingProduct.id 
          ? { ...p, ...data, price: parseFloat(data.price) }
          : p
      );
      
      setProducts(updatedProducts);
      setEditingProduct(null);
      
      toast({
        title: "Produto atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Ocorreu um erro ao atualizar o produto. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
  };

  const handleAddProduct = () => {
    navigate("/dashboard/add-product");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Meu Catálogo</h1>
            <p className="text-muted-foreground">
              Gerencie seus produtos e organize seu catálogo
            </p>
          </div>
          
          <Button className="btn-hero" onClick={handleAddProduct}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Produto
          </Button>
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
              <CardDescription>Visualizações</CardDescription>
              <CardTitle className="text-3xl">1.2k</CardTitle>
            </CardHeader>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pedidos WhatsApp</CardDescription>
              <CardTitle className="text-3xl">47</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Products Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id} className="dashboard-card group">
                <CardContent className="p-4">
                  <div className="aspect-square bg-muted rounded-lg mb-4 flex items-center justify-center relative overflow-hidden">
                    {product.image ? (
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Image className="h-12 w-12 text-muted-foreground" />
                    )}
                    
                    {/* Action buttons on hover */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {product.description}
                    </p>
                    <p className="text-lg font-bold text-whatsapp">
                      R$ {product.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="dashboard-card text-center py-12">
            <CardContent>
              <Image className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="mb-2">Nenhum produto cadastrado</CardTitle>
              <CardDescription className="mb-4">
                Comece adicionando seu primeiro produto ao catálogo
              </CardDescription>
              <Button className="btn-hero" onClick={handleAddProduct}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Produto
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Edit Product Dialog */}
        <Dialog open={!!editingProduct} onOpenChange={handleCancelEdit}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
            {editingProduct && (
              <ProductForm
                product={editingProduct}
                onSubmit={handleUpdateProduct}
                onCancel={handleCancelEdit}
                isLoading={isLoading}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
