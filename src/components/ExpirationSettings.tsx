import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Clock, Save, AlertTriangle } from 'lucide-react';

export const ExpirationSettings = () => {
  const [enabled, setEnabled] = useState(true);
  const [expirationHours, setExpirationHours] = useState('24');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('account_expiration_settings')
        .select('*')
        .single();

      if (error) throw error;
      if (data) {
        setEnabled(data.enabled);
        setExpirationHours(data.expiration_hours.toString());
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('account_expiration_settings')
        .update({
          enabled,
          expiration_hours: parseInt(expirationHours),
          updated_at: new Date().toISOString()
        })
        .eq('id', (await supabase.from('account_expiration_settings').select('id').single()).data.id);

      if (error) throw error;

      toast({
        title: 'Configurações salvas',
        description: 'As configurações de expiração foram atualizadas com sucesso',
      });
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          <CardTitle>Expiração Automática de Contas</CardTitle>
        </div>
        <CardDescription>
          Configure o tempo para deletar automaticamente contas não verificadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="enabled">Ativar limpeza automática</Label>
            <p className="text-sm text-muted-foreground">
              Deletar contas que não confirmaram o email
            </p>
          </div>
          <Switch
            id="enabled"
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expiration">Tempo de expiração</Label>
          <Select value={expirationHours} onValueChange={setExpirationHours}>
            <SelectTrigger id="expiration">
              <SelectValue placeholder="Selecione o tempo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 hora</SelectItem>
              <SelectItem value="5">5 horas</SelectItem>
              <SelectItem value="12">12 horas</SelectItem>
              <SelectItem value="24">1 dia (24 horas)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Contas não verificadas serão deletadas após este período
          </p>
        </div>

        <div className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
          <div className="text-xs text-yellow-800 dark:text-yellow-200">
            <strong>Atenção:</strong> Esta ação é irreversível. Contas deletadas não podem ser recuperadas.
          </div>
        </div>

        <Button onClick={handleSave} disabled={loading} className="w-full">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </CardContent>
    </Card>
  );
};