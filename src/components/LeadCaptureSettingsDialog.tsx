import { useState, useEffect } from "react";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useProfile } from "@/hooks/useProfile";

interface LeadCaptureSettings {
  whatsapp_feed_enabled: boolean;
  whatsapp_product_enabled: boolean;
  instagram_enabled: boolean;
  show_on_catalog_open: boolean;
  trigger_mode: 'always' | 'once_per_session';
}

export const LeadCaptureSettingsDialog = () => {
  const { profile } = useProfile();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<LeadCaptureSettings>({
    whatsapp_feed_enabled: true,
    whatsapp_product_enabled: true,
    instagram_enabled: true,
    show_on_catalog_open: false,
    trigger_mode: 'always',
  });

  useEffect(() => {
    if (open && profile?.id) {
      loadSettings();
    }
  }, [open, profile?.id]);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('lead_capture_settings')
        .select('*')
        .eq('user_id', profile?.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          whatsapp_feed_enabled: data.whatsapp_feed_enabled,
          whatsapp_product_enabled: data.whatsapp_product_enabled,
          instagram_enabled: data.instagram_enabled,
          show_on_catalog_open: data.show_on_catalog_open,
          trigger_mode: (data.trigger_mode === 'once_per_session' ? 'once_per_session' : 'always'),
        });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('lead_capture_settings')
        .upsert({
          user_id: profile?.id,
          ...settings,
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!",
      });
      
      setOpen(false);
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings className="mr-2 h-4 w-4" />
          Configurar Captura
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Configurações de Captura de Leads</DialogTitle>
          <DialogDescription>
            Escolha quais botões vão acionar a captura de leads no seu catálogo
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="whatsapp-feed" className="flex flex-col space-y-1">
                <span className="font-medium">WhatsApp do Feed</span>
                <span className="text-sm text-muted-foreground">
                  Botão WhatsApp no topo do catálogo
                </span>
              </Label>
              <Switch
                id="whatsapp-feed"
                checked={settings.whatsapp_feed_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, whatsapp_feed_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="whatsapp-product" className="flex flex-col space-y-1">
                <span className="font-medium">WhatsApp dos Produtos</span>
                <span className="text-sm text-muted-foreground">
                  Botão WhatsApp em cada produto
                </span>
              </Label>
              <Switch
                id="whatsapp-product"
                checked={settings.whatsapp_product_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, whatsapp_product_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="instagram" className="flex flex-col space-y-1">
                <span className="font-medium">Instagram</span>
                <span className="text-sm text-muted-foreground">
                  Botão Instagram no catálogo
                </span>
              </Label>
              <Switch
                id="instagram"
                checked={settings.instagram_enabled}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, instagram_enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2 border-t">
              <Label htmlFor="catalog-open" className="flex flex-col space-y-1">
                <span className="font-medium">Assim que abrir o catálogo</span>
                <span className="text-sm text-muted-foreground">
                  Exibe popup automaticamente ao acessar
                </span>
              </Label>
              <Switch
                id="catalog-open"
                checked={settings.show_on_catalog_open}
                onCheckedChange={(checked) =>
                  setSettings({ ...settings, show_on_catalog_open: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between space-x-2 pt-2 border-t">
              <Label htmlFor="trigger-mode" className="flex flex-col space-y-1">
                <span className="font-medium">Quando acionar</span>
                <span className="text-sm text-muted-foreground">
                  Controla a frequência da captura
                </span>
              </Label>
              <select
                id="trigger-mode"
                value={settings.trigger_mode}
                onChange={(e) =>
                  setSettings({ ...settings, trigger_mode: e.target.value as 'always' | 'once_per_session' })
                }
                className="border rounded-md px-3 py-2 text-sm"
              >
                <option value="always">Sempre</option>
                <option value="once_per_session">Uma vez por sessão</option>
              </select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={saveSettings} disabled={saving || loading}>
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
