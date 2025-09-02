import { useState } from "react";
import { Search, Filter, Eye, Edit, Trash2, MoreHorizontal, Package, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  images: string[];
  created_at: string;
  category_id?: string | null;
  weight?: string;
  cost?: number;
  discount?: number;
  code?: string;
  status?: 'active' | 'inactive';
  display_order?: number;
}

interface Category {
  id: string;
  name: string;
}

interface ProductListViewProps {
  products: Product[];
  categories: Category[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onView: (product: Product) => void;
}

export const ProductListView = ({ 
  products, 
  categories, 
  onEdit, 
  onDelete, 
  onView 
}: ProductListViewProps) => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created_at");

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase()) ||
                           product.code?.toLowerCase().includes(search.toLowerCase()) ||
                           product.description?.toLowerCase().includes(search.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || product.status === statusFilter;
      const matchesCategory = categoryFilter === "all" || 
                             (categoryFilter === "uncategorized" && !product.category_id) ||
                             product.category_id === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return b.price - a.price;
        case "created_at":
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return "Sem categoria";
    return categories.find(cat => cat.id === categoryId)?.name || "Categoria não encontrada";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getDiscountedPrice = (price: number, discount?: number) => {
    if (!discount || discount <= 0) return price;
    return price - (price * (discount / 100));
  };

  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar produtos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 w-full md:w-[300px]"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas categorias</SelectItem>
                  <SelectItem value="uncategorized">Sem categoria</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="created_at">Mais recentes</SelectItem>
              <SelectItem value="name">Nome (A-Z)</SelectItem>
              <SelectItem value="price">Preço (maior)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* Products Table - Mobile Cards / Desktop Table */}
      <Card>
        {/* Mobile View - Cards */}
        <div className="block md:hidden">
          <div className="space-y-4 p-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-2">
                  <Package className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    {search || statusFilter !== "all" || categoryFilter !== "all"
                      ? "Nenhum produto encontrado com os filtros aplicados"
                      : "Nenhum produto encontrado"
                    }
                  </p>
                </div>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <Card key={product.id} className="p-4">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center flex-shrink-0">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    
                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium truncate">{product.name}</h3>
                          {product.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {product.description}
                            </p>
                          )}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onView(product)}>
                              <Eye className="h-4 w-4 mr-2" />
                              Visualizar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => onEdit(product)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDelete(product.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      
                      {/* Price and Status */}
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-2">
                          {product.discount && product.discount > 0 ? (
                            <>
                              <span className="font-medium text-green-600 text-sm">
                                {formatPrice(getDiscountedPrice(product.price, product.discount))}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{product.discount}%
                              </Badge>
                            </>
                          ) : (
                            <span className="font-medium text-sm">
                              {formatPrice(product.price)}
                            </span>
                          )}
                        </div>
                        <Badge 
                          variant={product.status === 'active' ? 'default' : 'secondary'}
                          className={`text-xs ${product.status === 'active' ? 'bg-green-100 text-green-800' : ''}`}
                        >
                          {product.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                      
                      {/* Category and Code */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <span>{getCategoryName(product.category_id)}</span>
                        {product.code && (
                          <>
                            <span>•</span>
                            <span className="font-mono">{product.code}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Desktop View - Table */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Produto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <Package className="h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        {search || statusFilter !== "all" || categoryFilter !== "all"
                          ? "Nenhum produto encontrado com os filtros aplicados"
                          : "Nenhum produto encontrado"
                        }
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProducts.map((product) => (
                  <TableRow key={product.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-6 w-6 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium leading-none">{product.name}</p>
                        {product.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {product.description}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge variant="secondary">
                        {getCategoryName(product.category_id)}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <div className="space-y-1">
                        {product.discount && product.discount > 0 ? (
                          <>
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-green-600">
                                {formatPrice(getDiscountedPrice(product.price, product.discount))}
                              </span>
                              <Badge variant="destructive" className="text-xs">
                                -{product.discount}%
                              </Badge>
                            </div>
                            <span className="text-sm text-muted-foreground line-through">
                              {formatPrice(product.price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-medium">
                            {formatPrice(product.price)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    
                    <TableCell>
                      <Badge 
                        variant={product.status === 'active' ? 'default' : 'secondary'}
                        className={product.status === 'active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {product.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>
                      <span className="font-mono text-sm">
                        {product.code || "-"}
                      </span>
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(product.created_at)}
                      </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onView(product)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Visualizar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onEdit(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onDelete(product.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            </Table>
          </div>
        </div>
        
        {filteredProducts.length > 0 && (
          <div className="p-4 border-t">
            <p className="text-sm text-muted-foreground">
              Mostrando {filteredProducts.length} de {products.length} produtos
            </p>
          </div>
        )}
      </Card>
    </div>
  );
};