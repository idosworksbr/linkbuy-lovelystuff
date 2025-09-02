import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Profile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';

interface CatalogEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile;
  onUpdateProfile: (data: Partial<Profile>) => Promise<Profile>;
  canAccessFeature: (profile: Profile, feature: string) => boolean;
}

export const CatalogEditDialog: React.FC<CatalogEditDialogProps> = ({
  open,
  onOpenChange,
  profile,
  onUpdateProfile,
  canAccessFeature,
}) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleUpdate = async (updates: Partial<Profile>) => {
    setLoading(true);
    try {
      await onUpdateProfile(updates);
      toast({
        title: "Configurações atualizadas!",
        description: "Suas alterações foram salvas.",
      });
    } catch (error) {
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const themes = [
    { value: 'light', label: 'Claro' },
    { value: 'dark', label: 'Escuro' },
    { value: 'beige', label: 'Bege' },
    { value: 'rose', label: 'Rosa' },
    { value: 'gold', label: 'Dourado' },
    { value: 'purple', label: 'Roxo' },
    { value: 'mint', label: 'Menta' },
    { value: 'sunset', label: 'Pôr do Sol' },
  ];

  const layouts = [
    { value: 'overlay', label: 'Sobreposição' },
    { value: 'bottom', label: 'Embaixo' },
  ];

  const gridLayouts = [
    { value: 'default', label: 'Padrão' },
    { value: 'round', label: 'Arredondado' },
    { value: 'instagram', label: 'Instagram' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Personalizar Catálogo</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tema */}
          <div className="space-y-2">
            <Label>Tema</Label>
            <Select
              value={profile.catalog_theme}
              onValueChange={(value) => handleUpdate({ catalog_theme: value as any })}
              disabled={loading || !canAccessFeature(profile, 'themes')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((theme) => (
                  <SelectItem key={theme.value} value={theme.value}>
                    {theme.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canAccessFeature(profile, 'themes') && (
              <p className="text-sm text-muted-foreground">
                Disponível no plano Pro
              </p>
            )}
          </div>

          {/* Layout */}
          <div className="space-y-2">
            <Label>Layout dos Produtos</Label>
            <Select
              value={profile.catalog_layout}
              onValueChange={(value) => handleUpdate({ catalog_layout: value as any })}
              disabled={loading || !canAccessFeature(profile, 'layouts')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {layouts.map((layout) => (
                  <SelectItem key={layout.value} value={layout.value}>
                    {layout.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canAccessFeature(profile, 'layouts') && (
              <p className="text-sm text-muted-foreground">
                Disponível no plano Pro
              </p>
            )}
          </div>

          {/* Grid */}
          <div className="space-y-2">
            <Label>Estilo da Grade</Label>
            <Select
              value={profile.product_grid_layout}
              onValueChange={(value) => handleUpdate({ product_grid_layout: value as any })}
              disabled={loading || !canAccessFeature(profile, 'grid_layouts')}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {gridLayouts.map((grid) => (
                  <SelectItem key={grid.value} value={grid.value}>
                    {grid.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!canAccessFeature(profile, 'grid_layouts') && (
              <p className="text-sm text-muted-foreground">
                Disponível no plano Pro
              </p>
            )}
          </div>

          {/* Esconder Footer */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Esconder Créditos</Label>
              <p className="text-sm text-muted-foreground">
                Remove a assinatura no rodapé
              </p>
            </div>
            <Switch
              checked={profile.hide_footer || false}
              onCheckedChange={(checked) => handleUpdate({ hide_footer: checked })}
              disabled={loading || !canAccessFeature(profile, 'hide_footer')}
            />
          </div>
          {!canAccessFeature(profile, 'hide_footer') && (
            <p className="text-sm text-muted-foreground">
              Disponível no plano Pro+
            </p>
          )}

          {/* Selo Verificado */}
          {profile.is_verified && (
            <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-blue-700">
                Selo verificado ativo
              </span>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};