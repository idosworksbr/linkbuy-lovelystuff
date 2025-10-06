import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Loader2 } from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  affiliate_code: string;
  status: string;
  created_at: string;
}

interface AffiliatesListProps {
  affiliates: Affiliate[];
  onEdit: (affiliate: Affiliate) => void;
  onViewDetails: (affiliate: Affiliate) => void;
  loading: boolean;
}

export const AffiliatesList = ({ affiliates, onEdit, onViewDetails, loading }: AffiliatesListProps) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!affiliates || affiliates.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Nenhum afiliado cadastrado
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Código</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Criado em</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {affiliates.map((affiliate) => (
          <TableRow key={affiliate.id}>
            <TableCell className="font-medium">{affiliate.name}</TableCell>
            <TableCell>{affiliate.email}</TableCell>
            <TableCell>
              <code className="bg-muted px-2 py-1 rounded text-xs">
                {affiliate.affiliate_code}
              </code>
            </TableCell>
            <TableCell>
              <Badge variant={affiliate.status === 'active' ? 'default' : 'secondary'}>
                {affiliate.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Date(affiliate.created_at).toLocaleDateString('pt-BR')}
            </TableCell>
            <TableCell className="text-right">
              <div className="flex gap-2 justify-end">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewDetails(affiliate)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEdit(affiliate)}
                >
                  <Edit className="h-3 w-3 mr-1" />
                  Editar
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};