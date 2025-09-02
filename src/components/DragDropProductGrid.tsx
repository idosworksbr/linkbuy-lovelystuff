import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
}

interface DragDropProductGridProps {
  products: Product[];
  onReorder: (productIds: string[]) => void;
  isEditMode: boolean;
  gridLayout: 'default' | 'round' | 'instagram';
  themeClasses: any;
  storeUrl: string;
  renderProduct: (product: Product, index: number) => React.ReactNode;
}

export const DragDropProductGrid: React.FC<DragDropProductGridProps> = ({
  products,
  onReorder,
  isEditMode,
  gridLayout,
  themeClasses,
  storeUrl,
  renderProduct,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedItem = useRef<Product | null>(null);
  const navigate = useNavigate();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    
    setDraggedIndex(index);
    draggedItem.current = products[index];
    e.dataTransfer.effectAllowed = 'move';
    
    // Adicionar classe visual ao elemento sendo arrastado
    setTimeout(() => {
      const element = e.target as HTMLElement;
      element.style.opacity = '0.5';
    }, 0);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    if (!isEditMode) return;
    
    const element = e.target as HTMLElement;
    element.style.opacity = '1';
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedItem.current = null;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!isEditMode || draggedIndex === null) return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (index !== draggedIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDragLeave = () => {
    if (!isEditMode) return;
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    if (!isEditMode || draggedIndex === null || !draggedItem.current) return;
    
    e.preventDefault();
    
    if (draggedIndex !== index) {
      const newProducts = [...products];
      const draggedProduct = newProducts[draggedIndex];
      
      // Remove o produto da posição original
      newProducts.splice(draggedIndex, 1);
      
      // Insere na nova posição
      newProducts.splice(index, 0, draggedProduct);
      
      // Chama a função de reordenação com os IDs na nova ordem
      onReorder(newProducts.map(p => p.id));
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedItem.current = null;
  };

  const handleProductClick = (product: Product) => {
    if (!isEditMode) {
      navigate(`/catalogo/${storeUrl}/produto/${product.id}`);
    }
  };

  const getGridClasses = () => {
    switch (gridLayout) {
      case 'instagram':
        return 'grid grid-cols-3 gap-1';
      case 'round':
        return 'grid grid-cols-3 gap-2';
      case 'default':
      default:
        return 'grid grid-cols-3 gap-1';
    }
  };

  return (
    <div className={getGridClasses()}>
      {products.map((product, index) => (
        <div
          key={product.id}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => handleProductClick(product)}
          className={`
            relative transition-all duration-200
            ${isEditMode ? 'cursor-move' : 'cursor-pointer'}
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index ? 'transform scale-105' : ''}
            ${isEditMode ? 'hover:scale-105' : 'hover:scale-105'}
          `}
          style={{
            zIndex: draggedIndex === index ? 1000 : 1,
          }}
        >
          {isEditMode && (
            <div className="absolute top-1 right-1 z-10 bg-blue-500 text-white text-xs px-1 rounded">
              ✋
            </div>
          )}
          {renderProduct(product, index)}
        </div>
      ))}
    </div>
  );
};