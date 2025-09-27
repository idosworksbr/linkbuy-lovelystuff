import { useState, useEffect } from 'react';
import { Filter, X, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/hooks/useProducts';

interface Category {
  id: string;
  name: string;
}

interface FilterState {
  status: 'all' | 'active' | 'inactive';
  discount: 'all' | 'with_discount' | 'without_discount';
  priceMin: string;
  priceMax: string;
  category: string;
}

interface ProductFiltersProps {
  products: Product[];
  categories: Category[];
  onFiltersChange: (filteredProducts: Product[]) => void;
  className?: string;
}

export const ProductFilters = ({ products, categories, onFiltersChange, className }: ProductFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>(() => {
    // Load saved filters from localStorage
    const saved = localStorage.getItem('product-filters');
    return saved ? JSON.parse(saved) : {
      status: 'all',
      discount: 'all',
      priceMin: '',
      priceMax: '',
      category: 'all'
    };
  });

  const [showFilters, setShowFilters] = useState(false);

  // Save filters to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('product-filters', JSON.stringify(filters));
  }, [filters]);

  // Apply filters whenever products or filters change
  useEffect(() => {
    const filteredProducts = products.filter(product => {
      // Status filter
      if (filters.status !== 'all') {
        const isActive = product.status === 'active' || !product.status; // default to active if no status
        if (filters.status === 'active' && !isActive) return false;
        if (filters.status === 'inactive' && isActive) return false;
      }

      // Discount filter
      if (filters.discount !== 'all') {
        const hasDiscount = product.discount && product.discount > 0;
        if (filters.discount === 'with_discount' && !hasDiscount) return false;
        if (filters.discount === 'without_discount' && hasDiscount) return false;
      }

      // Price range filter
      if (filters.priceMin && product.price < parseFloat(filters.priceMin)) return false;
      if (filters.priceMax && product.price > parseFloat(filters.priceMax)) return false;

      // Category filter
      if (filters.category !== 'all') {
        if (filters.category === 'no_category' && product.category_id) return false;
        if (filters.category !== 'no_category' && product.category_id !== filters.category) return false;
      }

      return true;
    });

    onFiltersChange(filteredProducts);
  }, [products, filters, onFiltersChange]);

  const handleFilterChange = (key: keyof FilterState, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterState = {
      status: 'all',
      discount: 'all',
      priceMin: '',
      priceMax: '',
      category: 'all'
    };
    setFilters(defaultFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status !== 'all') count++;
    if (filters.discount !== 'all') count++;
    if (filters.priceMin || filters.priceMax) count++;
    if (filters.category !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className={className}>
      {/* Filter Toggle Button */}
      <div className="flex items-center gap-2 mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filtros
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 min-w-5 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <Card className="mb-6">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Produtos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Filter */}
              <div className="space-y-2">
                <Label>Desconto</Label>
                <Select value={filters.discount} onValueChange={(value) => handleFilterChange('discount', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="with_discount">Com desconto</SelectItem>
                    <SelectItem value="without_discount">Sem desconto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-2">
                <Label>Preço mínimo</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0"
                    value={filters.priceMin}
                    onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preço máximo</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="999999"
                    value={filters.priceMax}
                    onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                    className="pl-10"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="no_category">Sem categoria</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};