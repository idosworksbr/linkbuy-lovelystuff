import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, Filter, ChevronLeft, ChevronRight, ExternalLink, 
  Trash2, AlertTriangle, X, CheckCircle, Clock 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface User {
  id: string;
  name: string;
  email: string;
  store_name: string;
  store_url: string;
  subscription_plan: string;
  subscription_expires_at: string | null;
  is_verified: boolean;
  product_count: number;
  lead_count: number;
  created_at: string;
  catalog_url: string;
}

interface MasterUserManagementProps {
  users: User[];
  onRefresh: () => void;
}

export const MasterUserManagement = ({ users, onRefresh }: MasterUserManagementProps) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtrar e ordenar usuários
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.store_name?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesPlan = planFilter === 'all' || user.subscription_plan === planFilter;
      const matchesVerified = verifiedFilter === 'all' || 
        (verifiedFilter === 'verified' && user.is_verified) ||
        (verifiedFilter === 'not_verified' && !user.is_verified);
      
      return matchesSearch && matchesPlan && matchesVerified;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'name_asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name_desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'products_desc':
          return b.product_count - a.product_count;
        default:
          return 0;
      }
    });

  // Paginação
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, startIndex + itemsPerPage);

  const handleDeleteUser = async () => {
    if (!userToDelete || deleteConfirmation !== 'DELETAR') {
      toast({
        title: 'Confirmação inválida',
        description: 'Digite DELETAR para confirmar',
        variant: 'destructive',
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data, error } = await supabase.functions.invoke('delete-user-by-master', {
        body: { 
          userId: userToDelete.id
        }
      });

      if (error) throw error;

      toast({
        title: 'Usuário deletado',
        description: `Conta de ${userToDelete.name} foi deletada com sucesso`,
      });

      setUserToDelete(null);
      setDeleteConfirmation('');
      onRefresh();
    } catch (error: any) {
      console.error('Erro ao deletar usuário:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao deletar usuário',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const getAccountStatus = (user: User) => {
    const now = new Date();
    const expiresAt = user.subscription_expires_at ? new Date(user.subscription_expires_at) : null;
    
    if (user.subscription_plan === 'free') {
      return { label: 'Gratuito', color: 'bg-gray-500' };
    }
    
    if (!expiresAt) {
      return { label: 'Ativo', color: 'bg-green-500' };
    }
    
    if (expiresAt < now) {
      return { label: 'Expirado', color: 'bg-red-500' };
    }
    
    const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry <= 7) {
      return { label: `Expira em ${daysUntilExpiry}d`, color: 'bg-orange-500' };
    }
    
    return { label: 'Ativo', color: 'bg-green-500' };
  };

  const getPlanBadgeColor = (plan: string) => {
    switch (plan) {
      case 'pro_plus_verified':
      case 'pro_plus':
        return 'bg-purple-500';
      case 'pro':
        return 'bg-blue-500';
      case 'verified':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros e Busca */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou loja..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por plano" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os planos</SelectItem>
            <SelectItem value="free">Free</SelectItem>
            <SelectItem value="pro">Pro</SelectItem>
            <SelectItem value="pro_plus">Pro+</SelectItem>
            <SelectItem value="verified">Verificado</SelectItem>
            <SelectItem value="pro_plus_verified">Pro+ Verificado</SelectItem>
          </SelectContent>
        </Select>

        <Select value={verifiedFilter} onValueChange={setVerifiedFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status verificação" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="verified">Verificados</SelectItem>
            <SelectItem value="not_verified">Não verificados</SelectItem>
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_desc">Mais recentes</SelectItem>
            <SelectItem value="created_asc">Mais antigos</SelectItem>
            <SelectItem value="name_asc">Nome (A-Z)</SelectItem>
            <SelectItem value="name_desc">Nome (Z-A)</SelectItem>
            <SelectItem value="products_desc">Mais produtos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Resultados */}
      <div className="text-sm text-muted-foreground">
        Mostrando {paginatedUsers.length} de {filteredUsers.length} usuários
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Loja</TableHead>
              <TableHead>Plano</TableHead>
              <TableHead>Status Conta</TableHead>
              <TableHead>Verificação</TableHead>
              <TableHead className="text-right">Produtos</TableHead>
              <TableHead className="text-right">Leads</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{user.name || 'Sem nome'}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{user.store_name}</div>
                  <div className="text-xs text-muted-foreground">{user.store_url}</div>
                </TableCell>
                <TableCell>
                  <Badge className={getPlanBadgeColor(user.subscription_plan)}>
                    {user.subscription_plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={getAccountStatus(user).color}>
                    <Clock className="h-3 w-3 mr-1" />
                    {getAccountStatus(user).label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.is_verified && (
                    <Badge variant="outline" className="gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Verificado
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">{user.product_count}</TableCell>
                <TableCell className="text-right">{user.lead_count}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(user.catalog_url, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setUserToDelete(user)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialog de Confirmação de Deleção */}
      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Deletar Usuário Permanentemente
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Você está prestes a deletar <strong>{userToDelete?.name}</strong> ({userToDelete?.email}).
              </p>
              <p className="text-destructive font-semibold">
                ⚠️ Esta ação é IRREVERSÍVEL e irá deletar:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>{userToDelete?.product_count} produtos</li>
                <li>Todas as categorias</li>
                <li>{userToDelete?.lead_count} leads capturados</li>
                <li>Links personalizados</li>
                <li>Imagens e arquivos</li>
                <li>Analytics e estatísticas</li>
                <li>Assinaturas ativas no Stripe</li>
              </ul>
              <div className="mt-4">
                <label className="text-sm font-medium">
                  Digite <strong>DELETAR</strong> para confirmar:
                </label>
                <Input
                  value={deleteConfirmation}
                  onChange={(e) => setDeleteConfirmation(e.target.value)}
                  placeholder="DELETAR"
                  className="mt-2"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setUserToDelete(null);
              setDeleteConfirmation('');
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleteConfirmation !== 'DELETAR' || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? 'Deletando...' : 'Deletar Permanentemente'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};