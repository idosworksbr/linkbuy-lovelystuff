import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CheckCheck, ExternalLink, X } from 'lucide-react';
import { NotificationItem } from '@/components/NotificationItem';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

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

interface NotificationDropdownProps {
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationDropdown = ({ onClose, onMarkAllAsRead }: NotificationDropdownProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [user]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const fetchNotifications = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

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
  };

  const handleViewAll = () => {
    navigate('/dashboard/notifications');
    onClose();
  };

  return (
    <Card ref={dropdownRef} className="absolute right-0 sm:right-0 left-0 sm:left-auto top-12 w-[90vw] sm:w-96 max-w-md mx-auto sm:mx-0 max-h-[70vh] shadow-lg z-50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-lg">Notificações</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.read)}
            className="hidden sm:flex"
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={onClose}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(70vh-8rem)] sm:h-[400px]">
          {loading ? (
            <div className="p-4 text-center text-muted-foreground">
              Carregando...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              Nenhuma notificação
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onClose={onClose}
                />
              ))}
            </div>
          )}
        </ScrollArea>
        <div className="p-3 border-t space-y-2">
          <Button
            variant="outline"
            className="w-full sm:hidden"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={notifications.every(n => n.read)}
          >
            <CheckCheck className="h-4 w-4 mr-1" />
            Marcar todas como lidas
          </Button>
          <Button
            variant="outline"
            className="w-full"
            size="sm"
            onClick={handleViewAll}
          >
            <ExternalLink className="h-3 w-3 mr-2" />
            Ver todas as notificações
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};