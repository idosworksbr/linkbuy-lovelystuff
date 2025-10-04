import { useState, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, Trash2 } from 'lucide-react';
import { NotificationItem } from '@/components/NotificationItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'announcement';
  action_url: string | null;
  action_label: string | null;
  read: boolean;
  created_at: string;
}

interface NotificationSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMarkAllAsRead: () => void;
}

export const NotificationSheet = ({ open, onOpenChange, onMarkAllAsRead }: NotificationSheetProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (open && user) {
      fetchNotifications();
    }
  }, [open, user]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setNotifications(data as Notification[]);
    }
    setLoading(false);
  };

  const handleMarkAsRead = async (notificationId: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    onMarkAllAsRead();
    
    toast({
      title: 'Sucesso',
      description: 'Todas as notificações foram marcadas como lidas'
    });
  };

  const handleDeleteAll = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setNotifications([]);
      toast({
        title: 'Sucesso',
        description: 'Todas as notificações foram excluídas'
      });
    }
  };

  const filteredNotifications = activeTab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications;

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-xl">Notificações</SheetTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount > 0 ? `${unreadCount} não lidas` : 'Todas lidas'}
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
              className="flex-1"
            >
              <CheckCheck className="h-4 w-4 mr-2" />
              Marcar todas como lidas
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="all">
                Todas ({notifications.length})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Não lidas ({unreadCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>

        <ScrollArea className="flex-1 px-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Carregando notificações...
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              {activeTab === 'unread' 
                ? 'Nenhuma notificação não lida'
                : 'Nenhuma notificação'}
            </div>
          ) : (
            <div className="divide-y">
              {filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClose={() => onOpenChange(false)}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
