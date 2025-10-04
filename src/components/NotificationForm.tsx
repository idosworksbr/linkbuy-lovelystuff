import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Send } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

interface NotificationFormProps {
  onClose: () => void;
}

export const NotificationForm = ({ onClose }: NotificationFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [broadcast, setBroadcast] = useState(true);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error' | 'announcement',
    action_url: '',
    action_label: '',
    user_email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let user_ids: string[] = [];

      if (broadcast) {
        // Get all user IDs
        const { data: users, error: usersError } = await supabase
          .from('profiles')
          .select('id');

        if (usersError) throw usersError;
        user_ids = users.map(u => u.id);
      } else {
        // Get specific user ID
        const { data: profiles, error: userError } = await supabase
          .from('profiles')
          .select('id')
          .ilike('email', formData.user_email)
          .limit(1);

        if (userError || !profiles || profiles.length === 0) {
          throw new Error('Usuário não encontrado');
        }

        user_ids = [profiles[0].id];
      }

      // Call the edge function to send notifications
      const { error: sendError } = await supabase.functions.invoke('send-notification', {
        body: {
          user_ids,
          title: formData.title,
          message: formData.message,
          type: formData.type,
          action_url: formData.action_url || null,
          action_label: formData.action_label || null
        }
      });

      if (sendError) throw sendError;

      toast({
        title: 'Sucesso',
        description: `Notificação enviada para ${user_ids.length} usuário(s)`
      });

      onClose();
    } catch (error: any) {
      console.error('Error sending notification:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao enviar notificação',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <CardTitle>Nova Notificação</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Broadcast Toggle */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="space-y-0.5">
              <Label>Enviar para todos os usuários</Label>
              <p className="text-sm text-muted-foreground">
                Ativar para enviar notificação em massa
              </p>
            </div>
            <Switch
              checked={broadcast}
              onCheckedChange={setBroadcast}
            />
          </div>

          {/* User Email (only if not broadcast) */}
          {!broadcast && (
            <div className="space-y-2">
              <Label htmlFor="user_email">Email do Usuário *</Label>
              <Input
                id="user_email"
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                placeholder="usuario@email.com"
                required={!broadcast}
              />
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Título *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Título da notificação"
              required
            />
          </div>

          {/* Message */}
          <div className="space-y-2">
            <Label htmlFor="message">Mensagem *</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              placeholder="Conteúdo da notificação"
              rows={4}
              required
            />
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Tipo</Label>
            <Select
              value={formData.type}
              onValueChange={(value: any) => setFormData({ ...formData, type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">Informação</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
                <SelectItem value="error">Erro</SelectItem>
                <SelectItem value="announcement">Anúncio</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Action URL */}
          <div className="space-y-2">
            <Label htmlFor="action_url">URL de Ação (opcional)</Label>
            <Input
              id="action_url"
              value={formData.action_url}
              onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
              placeholder="/dashboard ou https://..."
            />
          </div>

          {/* Action Label */}
          {formData.action_url && (
            <div className="space-y-2">
              <Label htmlFor="action_label">Texto do Botão</Label>
              <Input
                id="action_label"
                value={formData.action_label}
                onChange={(e) => setFormData({ ...formData, action_label: e.target.value })}
                placeholder="Ver detalhes"
              />
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Send className="h-4 w-4 mr-2" />
              {loading ? 'Enviando...' : 'Enviar Notificação'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};