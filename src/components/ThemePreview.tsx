import React from 'react';
import { cn } from '@/lib/utils';

interface ThemePreviewProps {
  selectedTheme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  onSelect: (theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset') => void;
  disabled?: boolean;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({
  selectedTheme,
  onSelect,
  disabled = false,
}) => {
  const themes = [
    {
      value: 'light' as const,
      label: 'Claro',
      colors: ['#ffffff', '#f3f4f6', '#1f2937'],
    },
    {
      value: 'dark' as const,
      label: 'Escuro',
      colors: ['#1f2937', '#111827', '#f9fafb'],
    },
    {
      value: 'beige' as const,
      label: 'Bege',
      colors: ['#f5f5dc', '#d4c5a0', '#5c4f3d'],
    },
    {
      value: 'rose' as const,
      label: 'Rosa',
      colors: ['#fff1f2', '#fecdd3', '#881337'],
    },
    {
      value: 'gold' as const,
      label: 'Dourado',
      colors: ['#fef3c7', '#fbbf24', '#78350f'],
    },
    {
      value: 'purple' as const,
      label: 'Roxo',
      colors: ['#faf5ff', '#e9d5ff', '#581c87'],
    },
    {
      value: 'mint' as const,
      label: 'Menta',
      colors: ['#f0fdfa', '#5eead4', '#134e4a'],
    },
    {
      value: 'sunset' as const,
      label: 'Pôr do Sol',
      colors: ['#fff7ed', '#fb923c', '#7c2d12'],
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-3">
      {themes.map((theme) => (
        <button
          key={theme.value}
          type="button"
          onClick={() => !disabled && onSelect(theme.value)}
          disabled={disabled}
          className={cn(
            "p-2 border-2 rounded-lg transition-all hover:shadow-md",
            selectedTheme === theme.value
              ? "border-primary ring-2 ring-primary/20"
              : "border-border hover:border-primary/50",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="flex gap-1 mb-2">
            {theme.colors.map((color, i) => (
              <div
                key={i}
                className="flex-1 h-8 rounded"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <p className="text-xs font-medium text-center">{theme.label}</p>
        </button>
      ))}
    </div>
  );
};
