import React from 'react';
import { cn } from '@/lib/utils';

interface GridLayoutPreviewProps {
  selectedLayout: 'default' | 'round' | 'instagram';
  onSelect: (layout: 'default' | 'round' | 'instagram') => void;
  disabled?: boolean;
}

export const GridLayoutPreview: React.FC<GridLayoutPreviewProps> = ({
  selectedLayout,
  onSelect,
  disabled = false,
}) => {
  const layouts = [
    {
      value: 'default' as const,
      label: 'Padrão',
      preview: (
        <div className="space-y-2">
          <div className="w-full aspect-square bg-gradient-to-br from-blue-200 to-blue-300 rounded-lg" />
          <div className="space-y-1">
            <div className="h-2 bg-gray-300 rounded w-3/4" />
            <div className="h-2 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      ),
    },
    {
      value: 'round' as const,
      label: 'Arredondado',
      preview: (
        <div className="space-y-2">
          <div className="w-full aspect-square bg-gradient-to-br from-purple-200 to-purple-300 rounded-full" />
          <div className="space-y-1">
            <div className="h-2 bg-gray-300 rounded w-3/4 mx-auto" />
            <div className="h-2 bg-gray-200 rounded w-1/2 mx-auto" />
          </div>
        </div>
      ),
    },
    {
      value: 'instagram' as const,
      label: 'Instagram',
      preview: (
        <div className="grid grid-cols-3 gap-0">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
            <div
              key={i}
              className={cn(
                "aspect-square",
                i % 3 === 0 ? "bg-pink-200" : i % 3 === 1 ? "bg-pink-300" : "bg-pink-400"
              )}
            />
          ))}
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {layouts.map((layout) => (
        <button
          key={layout.value}
          type="button"
          onClick={() => !disabled && onSelect(layout.value)}
          disabled={disabled}
          className={cn(
            "p-3 border-2 rounded-lg transition-all hover:shadow-md",
            selectedLayout === layout.value
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="mb-2">{layout.preview}</div>
          <p className="text-xs font-medium text-center">{layout.label}</p>
        </button>
      ))}
    </div>
  );
};
