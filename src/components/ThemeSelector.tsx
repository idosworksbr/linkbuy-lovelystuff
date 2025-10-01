import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ThemeSelectorProps {
  selectedTheme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'coral' | 'charcoal' | 'cream';
  onThemeChange: (theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset' | 'ocean' | 'forest' | 'lavender' | 'coral' | 'charcoal' | 'cream') => void;
}

const themes = [
  { 
    key: 'light' as const, 
    name: 'Claro', 
    colors: ['#ffffff', '#f8fafc', '#1f2937'],
    description: 'Limpo e profissional'
  },
  { 
    key: 'dark' as const, 
    name: 'Escuro', 
    colors: ['#111827', '#1f2937', '#f3f4f6'],
    description: 'Moderno e elegante'
  },
  { 
    key: 'beige' as const, 
    name: 'Bege', 
    colors: ['#fffbeb', '#fed7aa', '#451a03'],
    description: 'Caloroso e acolhedor'
  },
  { 
    key: 'rose' as const, 
    name: 'Rosa', 
    colors: ['#fff1f2', '#fecdd3', '#881337'],
    description: 'Delicado e feminino'
  },
  { 
    key: 'gold' as const, 
    name: 'Dourado', 
    colors: ['#fefce8', '#fef08a', '#713f12'],
    description: 'Luxuoso e premium'
  },
  { 
    key: 'purple' as const, 
    name: 'Roxo', 
    colors: ['#faf5ff', '#e9d5ff', '#581c87'],
    description: 'Criativo e único'
  },
  { 
    key: 'mint' as const, 
    name: 'Menta', 
    colors: ['#ecfdf5', '#6ee7b7', '#064e3b'],
    description: 'Fresco e natural'
  },
  { 
    key: 'sunset' as const, 
    name: 'Pôr do Sol', 
    colors: ['#fff7ed', '#fdba74', '#7c2d12'],
    description: 'Vibrante e energético'
  },
  { 
    key: 'ocean' as const, 
    name: 'Oceano', 
    colors: ['#172554', '#1e40af', '#dbeafe'],
    description: 'Profundo e sereno'
  },
  { 
    key: 'forest' as const, 
    name: 'Floresta', 
    colors: ['#052e16', '#166534', '#d1fae5'],
    description: 'Natural e tranquilo'
  },
  { 
    key: 'lavender' as const, 
    name: 'Lavanda', 
    colors: ['#f5f3ff', '#ddd6fe', '#5b21b6'],
    description: 'Suave e relaxante'
  },
  { 
    key: 'coral' as const, 
    name: 'Coral', 
    colors: ['#fef2f2', '#fecaca', '#7f1d1d'],
    description: 'Vibrante e acolhedor'
  },
  { 
    key: 'charcoal' as const, 
    name: 'Carvão', 
    colors: ['#0f172a', '#1e293b', '#cbd5e1'],
    description: 'Sofisticado e moderno'
  },
  { 
    key: 'cream' as const, 
    name: 'Creme', 
    colors: ['#fafaf9', '#e7e5e4', '#44403c'],
    description: 'Clássico e elegante'
  }
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({ 
  selectedTheme, 
  onThemeChange 
}) => {
  return (
    <div className="space-y-3">
      {themes.map((theme) => (
        <div 
          key={theme.key}
          className={`
            p-3 rounded-lg border-2 cursor-pointer transition-all duration-200
            ${selectedTheme === theme.key 
              ? 'border-primary bg-primary/5 shadow-md' 
              : 'border-border hover:border-primary/50 hover:bg-muted/50'
            }
          `}
          onClick={() => onThemeChange(theme.key)}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {/* Color Preview */}
              <div className="flex gap-1">
                {theme.colors.map((color, index) => (
                  <div
                    key={index}
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div>
                <div className="font-medium text-sm">{theme.name}</div>
                <div className="text-xs text-muted-foreground">{theme.description}</div>
              </div>
            </div>
            
            {selectedTheme === theme.key && (
              <Badge variant="default" className="text-xs">
                Ativo
              </Badge>
            )}
          </div>
        </div>
      ))}
      
      <div className="pt-2 text-xs text-muted-foreground text-center">
        Clique em um tema para aplicar
      </div>
    </div>
  );
};