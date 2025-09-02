import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ThemeSelectorProps {
  selectedTheme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset';
  onThemeChange: (theme: 'light' | 'dark' | 'beige' | 'rose' | 'gold' | 'purple' | 'mint' | 'sunset') => void;
}

const themes = [
  { 
    key: 'light' as const, 
    name: 'Claro', 
    colors: ['#ffffff', '#f8fafc', '#e2e8f0'],
    description: 'Limpo e profissional'
  },
  { 
    key: 'dark' as const, 
    name: 'Escuro', 
    colors: ['#0f172a', '#1e293b', '#334155'],
    description: 'Moderno e elegante'
  },
  { 
    key: 'beige' as const, 
    name: 'Bege', 
    colors: ['#f5f5dc', '#deb887', '#d2b48c'],
    description: 'Caloroso e acolhedor'
  },
  { 
    key: 'rose' as const, 
    name: 'Rosa', 
    colors: ['#fdf2f8', '#fce7f3', '#fbcfe8'],
    description: 'Delicado e feminino'
  },
  { 
    key: 'gold' as const, 
    name: 'Dourado', 
    colors: ['#fffbeb', '#fef3c7', '#fcd34d'],
    description: 'Luxuoso e premium'
  },
  { 
    key: 'purple' as const, 
    name: 'Roxo', 
    colors: ['#faf5ff', '#f3e8ff', '#ddd6fe'],
    description: 'Criativo e único'
  },
  { 
    key: 'mint' as const, 
    name: 'Menta', 
    colors: ['#f0fdfa', '#ccfbf1', '#99f6e4'],
    description: 'Fresco e natural'
  },
  { 
    key: 'sunset' as const, 
    name: 'Pôr do Sol', 
    colors: ['#fff7ed', '#fed7aa', '#fb923c'],
    description: 'Vibrante e energético'
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