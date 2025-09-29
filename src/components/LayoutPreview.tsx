import React from 'react';
import { cn } from '@/lib/utils';

interface LayoutPreviewProps {
  selectedLayout: 'overlay' | 'bottom';
  onSelect: (layout: 'overlay' | 'bottom') => void;
  disabled?: boolean;
}

export const LayoutPreview: React.FC<LayoutPreviewProps> = ({
  selectedLayout,
  onSelect,
  disabled = false,
}) => {
  const layouts = [
    {
      value: 'overlay' as const,
      label: 'Sobreposição',
      description: 'Informações aparecem ao passar o mouse',
      preview: (
        <div className="relative w-full aspect-square bg-gradient-to-br from-green-200 to-green-300 rounded-lg overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="absolute bottom-2 left-2 right-2">
              <div className="h-2 bg-white/80 rounded w-3/4 mb-1" />
              <div className="h-1.5 bg-white/60 rounded w-1/2" />
            </div>
          </div>
        </div>
      ),
    },
    {
      value: 'bottom' as const,
      label: 'Embaixo',
      description: 'Informações sempre visíveis',
      preview: (
        <div className="space-y-2">
          <div className="w-full aspect-square bg-gradient-to-br from-orange-200 to-orange-300 rounded-lg" />
          <div className="bg-card p-2 rounded-md border">
            <div className="h-2 bg-foreground/20 rounded w-3/4 mb-1" />
            <div className="h-1.5 bg-foreground/10 rounded w-1/2" />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {layouts.map((layout) => (
        <button
          key={layout.value}
          type="button"
          onClick={() => !disabled && onSelect(layout.value)}
          disabled={disabled}
          className={cn(
            "p-3 border-2 rounded-lg transition-all hover:shadow-md text-left",
            selectedLayout === layout.value
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="mb-3">{layout.preview}</div>
          <div>
            <p className="text-sm font-medium">{layout.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{layout.description}</p>
          </div>
        </button>
      ))}
    </div>
  );
};
