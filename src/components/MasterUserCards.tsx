import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Trash2, Mail, Phone, Store, Calendar } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  store_name: string;
  store_url: string;
  subscription_plan: string;
  created_at: string;
  product_count: number;
  is_verified: boolean;
  last_login_at: string | null;
  traffic_source: string | null;
}

interface MasterUserCardsProps {
  users: User[];
  onViewDetails: (user: User) => void;
  onDelete: (user: User) => void;
}

export const MasterUserCards = ({ users, onViewDetails, onDelete }: MasterUserCardsProps) => {
  const getPlanBadgeColor = (plan: string) => {
    switch (plan?.toLowerCase()) {
      case 'pro_plus_verified': return 'bg-gradient-to-r from-purple-500 to-pink-500 text-white';
      case 'pro_plus': return 'bg-blue-500 text-white';
      case 'pro': return 'bg-green-500 text-white';
      case 'verified': return 'bg-yellow-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4">
      {users.map((user) => (
        <Card key={user.id} className="overflow-hidden">
          <CardContent className="p-4 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-base">{user.name}</h3>
                  {user.is_verified && <span className="text-xs">✓</span>}
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                  <Store className="h-3 w-3" />
                  <span className="truncate">{user.store_name}</span>
                </div>
                <Badge className={`${getPlanBadgeColor(user.subscription_plan)} text-xs`}>
                  {user.subscription_plan?.toUpperCase().replace('_', ' ')}
                </Badge>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-3 w-3" />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Cadastrado: {formatDate(user.created_at)}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-3 text-xs">
              <div className="text-center p-2 bg-muted rounded">
                <div className="font-bold">{user.product_count}</div>
                <div className="text-muted-foreground">Produtos</div>
              </div>
              {user.traffic_source && (
                <div className="text-center p-2 bg-muted rounded flex-1">
                  <div className="font-bold truncate">{user.traffic_source}</div>
                  <div className="text-muted-foreground">Fonte</div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="flex-1"
                onClick={() => onViewDetails(user)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Detalhes
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => onDelete(user)}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};