import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
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

          {/* Fundo do Texto dos Produtos */}
          <div className="space-y-4 pt-4 border-t">
            {profile.product_grid_layout === 'round' && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                <strong>Nota:</strong> O estilo "Arredondado" tem design fixo. Estas configurações não se aplicam.
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Fundo do texto no produto</Label>
                <p className="text-sm text-muted-foreground">
                  Adiciona fundo ao nome e preço
                </p>
              </div>
              <Switch
                checked={(profile as any).product_text_background_enabled ?? true}
                onCheckedChange={(checked) => handleUpdate({ product_text_background_enabled: checked } as any)}
                disabled={loading || profile.product_grid_layout === 'round'}
              />
            </div>

            {((profile as any).product_text_background_enabled ?? true) && (
              <>
                <div className="space-y-2">
                  <Label>Cor do Fundo</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="color"
                      value={(profile as any).product_text_background_color || '#000000'}
                      onChange={(e) => handleUpdate({ product_text_background_color: e.target.value } as any)}
                      className="w-16 h-10 p-1 border rounded cursor-pointer"
                      disabled={loading}
                    />
                    <Input
                      value={(profile as any).product_text_background_color || '#000000'}
                      onChange={(e) => handleUpdate({ product_text_background_color: e.target.value } as any)}
                      placeholder="#000000"
                      className="flex-1"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>
                    Opacidade: {(profile as any).product_text_background_opacity ?? 70}%
                  </Label>
                  <Slider
                    value={[(profile as any).product_text_background_opacity ?? 70]}
                    onValueChange={(value) => handleUpdate({ product_text_background_opacity: value[0] } as any)}
                    min={0}
                    max={100}
                    step={5}
                    className="w-full"
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                  <div className="space-y-2">
                    <Label>Cor do Nome</Label>
                    <Input
                      type="color"
                      value={(profile as any).product_name_text_color || '#ffffff'}
                      onChange={(e) => handleUpdate({ product_name_text_color: e.target.value } as any)}
                      className="w-full h-10 p-1 border rounded cursor-pointer"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Cor do Preço</Label>
                    <Input
                      type="color"
                      value={(profile as any).product_price_text_color || '#ffffff'}
                      onChange={(e) => handleUpdate({ product_price_text_color: e.target.value } as any)}
                      className="w-full h-10 p-1 border rounded cursor-pointer"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};