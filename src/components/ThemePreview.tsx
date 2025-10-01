import React from 'react';
import { cn } from '@/lib/utils';

interface ThemePreviewProps {
  selectedTheme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'coral' | 'charcoal' | 'cream';
  onSelect: (theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'coral' | 'charcoal' | 'cream') => void;
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
      colors: ['#111827', '#1f2937', '#f3f4f6'],
    },
    {
      value: 'beige' as const,
      label: 'Bege',
      colors: ['#fffbeb', '#fed7aa', '#451a03'],
    },
    {
      value: 'rose' as const,
      label: 'Rosa',
      colors: ['#fff1f2', '#fecdd3', '#881337'],
    },
    {
      value: 'gold' as const,
      label: 'Dourado',
      colors: ['#fefce8', '#fef08a', '#713f12'],
    },
    {
      value: 'purple' as const,
      label: 'Roxo',
      colors: ['#faf5ff', '#e9d5ff', '#581c87'],
    },
    {
      value: 'mint' as const,
      label: 'Menta',
      colors: ['#ecfdf5', '#6ee7b7', '#064e3b'],
    },
    {
      value: 'sunset' as const,
      label: 'Pôr do Sol',
      colors: ['#fff7ed', '#fdba74', '#7c2d12'],
    },
    {
      value: 'ocean' as const,
      label: 'Oceano',
      colors: ['#172554', '#1e40af', '#dbeafe'],
    },
    {
      value: 'forest' as const,
      label: 'Floresta',
      colors: ['#052e16', '#166534', '#d1fae5'],
    },
    {
      value: 'lavender' as const,
      label: 'Lavanda',
      colors: ['#f5f3ff', '#ddd6fe', '#5b21b6'],
    },
    {
      value: 'coral' as const,
      label: 'Coral',
      colors: ['#fef2f2', '#fecaca', '#7f1d1d'],
    },
    {
      value: 'charcoal' as const,
      label: 'Carvão',
      colors: ['#0f172a', '#1e293b', '#cbd5e1'],
    },
    {
      value: 'cream' as const,
      label: 'Creme',
      colors: ['#fafaf9', '#e7e5e4', '#44403c'],
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
