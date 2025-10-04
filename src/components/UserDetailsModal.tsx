import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calendar, Mail, Phone, Store, Package, Users, DollarSign, ExternalLink, Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  store_name: string;
  store_url: string;
  subscription_plan: string;
  created_at: string;
  whatsapp_number: string | null;
  product_count: number;
  category_count: number;
  lead_count: number;
  subscription_expires_at: string | null;
  is_verified: boolean;
  instagram_url: string | null;
  first_login_at: string | null;
  last_login_at: string | null;
  traffic_source: string | null;
}

interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

export const UserDetailsModal = ({ user, open, onClose }: UserDetailsModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);

  if (!user) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro_plus_verified': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'pro_plus': return 'bg-blue-500 text-white';
      case 'pro': return 'bg-green-500 text-white';
      case 'verified': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      toast({
        title: "Copiado!",
        description: `${label} copiado para a área de transferência`,
      });
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Detalhes do Usuário
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações Pessoais */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="h-4 w-4" />
              Informações Pessoais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="font-medium">{user.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  Email
                </p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{user.email}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(user.email, "Email")}
                  >
                    {copied === "Email" ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
              {user.phone && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    Telefone
                  </p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.phone}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(user.phone!, "Telefone")}
                    >
                      {copied === "Telefone" ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
              {user.whatsapp_number && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">WhatsApp</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.whatsapp_number}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(user.whatsapp_number!, "WhatsApp")}
                    >
                      {copied === "WhatsApp" ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Dados da Loja */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Store className="h-4 w-4" />
              Dados da Loja
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Nome da Loja</p>
                <p className="font-medium">{user.store_name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">URL da Loja</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-sm">{user.store_url}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => window.open(`/catalog/${user.store_url}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              {user.instagram_url && (
                <div className="space-y-1 col-span-2">
                  <p className="text-sm text-muted-foreground">Instagram</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-sm">{user.instagram_url}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => window.open(user.instagram_url!, '_blank')}
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Plano & Assinatura */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Plano & Assinatura
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Plano Atual</p>
                <div className="flex items-center gap-2">
                  <Badge className={getPlanBadgeColor(user.subscription_plan)}>
                    {user.subscription_plan?.toUpperCase().replace('_', ' ')}
                  </Badge>
                  {user.is_verified && <Badge variant="secondary">✓ Verificado</Badge>}
                </div>
              </div>
              {user.subscription_expires_at && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Expira em</p>
                  <p className="font-medium">{formatDate(user.subscription_expires_at)}</p>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Estatísticas */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Package className="h-4 w-4" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1 text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{user.product_count}</p>
                <p className="text-sm text-muted-foreground">Produtos</p>
              </div>
              <div className="space-y-1 text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{user.category_count}</p>
                <p className="text-sm text-muted-foreground">Categorias</p>
              </div>
              <div className="space-y-1 text-center p-4 bg-muted rounded-lg">
                <p className="text-2xl font-bold">{user.lead_count}</p>
                <p className="text-sm text-muted-foreground">Leads</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Datas & Atividade */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Datas & Atividade
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Cadastrado em</p>
                <p className="font-medium">{formatDate(user.created_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Primeiro Acesso</p>
                <p className="font-medium">{formatDate(user.first_login_at)}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Último Acesso</p>
                <p className="font-medium">{formatDate(user.last_login_at)}</p>
              </div>
              {user.traffic_source && (
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Fonte de Tráfego</p>
                  <p className="font-medium">{user.traffic_source}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};