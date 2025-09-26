import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

interface Category {
  id: string;
  name: string;
  image_url: string | null;
  display_order: number;
  product_count?: number;
}

interface DragDropCategoryGridProps {
  categories: Category[];
  onReorder: (categoryUpdates: Array<{ id: string; display_order: number }>) => void;
  isEditMode: boolean;
  themeClasses: any;
  storeUrl: string;
}

export const DragDropCategoryGrid: React.FC<DragDropCategoryGridProps> = ({
  categories,
  onReorder,
  isEditMode,
  themeClasses,
  storeUrl,
}) => {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedItem = useRef<Category | null>(null);
  const navigate = useNavigate();

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!isEditMode) return;
    
    setDraggedIndex(index);
    draggedItem.current = categories[index];
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
      const newCategories = [...categories];
      const draggedCategory = newCategories[draggedIndex];
      
      // Remove a categoria da posição original
      newCategories.splice(draggedIndex, 1);
      
      // Insere na nova posição
      newCategories.splice(index, 0, draggedCategory);
      
      // Cria os updates com as novas posições
      const updates = newCategories.map((category, idx) => ({
        id: category.id,
        display_order: idx + 1
      }));
      
      onReorder(updates);
    }
    
    setDraggedIndex(null);
    setDragOverIndex(null);
    draggedItem.current = null;
  };

  const handleCategoryClick = (category: Category) => {
    if (!isEditMode) {
      navigate(`/catalog/${storeUrl}/category/${category.id}`);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-2 mb-4">
      {categories.map((category, index) => (
        <div
          key={category.id}
          draggable={isEditMode}
          onDragStart={(e) => handleDragStart(e, index)}
          onDragEnd={handleDragEnd}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, index)}
          onClick={() => handleCategoryClick(category)}
          className={`
            relative rounded-lg overflow-hidden shadow-sm border transition-all duration-200
            ${isEditMode ? 'cursor-move' : 'cursor-pointer'}
            ${draggedIndex === index ? 'opacity-50 scale-95' : ''}
            ${dragOverIndex === index ? 'transform scale-105' : ''}
            ${isEditMode ? 'hover:scale-105' : 'hover:scale-105'}
            ${themeClasses.border}
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
          
          <div className="aspect-square">
            {category.image_url ? (
              <img
                src={category.image_url}
                alt={category.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className={`w-full h-full flex items-center justify-center ${themeClasses.secondary}`}>
                <span className="text-2xl">📁</span>
              </div>
            )}
          </div>
          
          <div className={`absolute bottom-0 left-0 right-0 p-2 ${themeClasses.overlay}`}>
            <h4 className="font-medium text-sm text-white truncate">{category.name}</h4>
            <p className="text-xs text-gray-200">{category.product_count || 0} produtos</p>
          </div>
        </div>
      ))}
    </div>
  );
};