import { useState, useEffect } from "react";
import { Download, Filter, Calendar, Search, MapPin, Phone, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import DashboardLayout from "@/components/DashboardLayout";
import { useToast } from "@/hooks/use-toast";
import { useProfile } from "@/hooks/useProfile";
import { usePlans } from "@/hooks/usePlans";
import { PlanFeatureRestriction } from "@/components/PlanFeatureRestriction";
import { supabase } from "@/integrations/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";

interface Lead {
  id: string;
  name: string;
  phone: string;
  city: string;
  captured_at: string;
  source_button: string;
}

const LeadsManagement = () => {
  usePageTitle("Gestão de Leads");
  const { profile } = useProfile();
  const { canAccessFeature } = usePlans();
  const { toast } = useToast();
  
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  useEffect(() => {
    if (canAccessFeature(profile, 'lead_capture')) {
      loadLeads();
    } else {
      setLoading(false);
    }
  }, [profile, canAccessFeature]);

  const loadLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('catalog_leads')
        .select('*')
        .eq('store_id', profile?.id)
        .order('captured_at', { ascending: false });

      if (error) throw error;
      setLeads(data || []);
    } catch (error) {
      console.error('Error loading leads:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExportLeads = async () => {
    try {
      const filteredLeads = getFilteredLeads();
      
      if (filteredLeads.length === 0) {
        toast({
          title: "Nenhum lead",
          description: "Não há leads para exportar com os filtros atuais.",
          variant: "destructive",
        });
        return;
      }

      const csvContent = [
        ['Nome', 'WhatsApp', 'Cidade', 'Data de Captura', 'Origem'],
        ...filteredLeads.map(lead => [
          lead.name,
          lead.phone,
          lead.city,
          formatDate(lead.captured_at),
          getSourceDisplayName(lead.source_button)
        ])
      ].map(row => row.join(',')).join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `leads-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Sucesso",
        description: "Leads exportados com sucesso!",
      });
    } catch (error) {
      console.error('Error exporting leads:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar leads",
        variant: "destructive",
      });
    }
  };

  const getFilteredLeads = () => {
    return leads.filter(lead => {
      const matchesSearch = 
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.phone.includes(searchTerm) ||
        lead.city.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSource = sourceFilter === "all" || lead.source_button === sourceFilter;
      
      let matchesDate = true;
      if (dateFilter !== "all") {
        const leadDate = new Date(lead.captured_at);
        const now = new Date();
        
        switch (dateFilter) {
          case "today":
            matchesDate = leadDate.toDateString() === now.toDateString();
            break;
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            matchesDate = leadDate >= weekAgo;
            break;
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            matchesDate = leadDate >= monthAgo;
            break;
        }
      }
      
      return matchesSearch && matchesSource && matchesDate;
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSourceDisplayName = (source: string) => {
    switch (source) {
      case 'whatsapp_feed':
        return 'WhatsApp do Feed';
      case 'whatsapp_product':
        return 'WhatsApp do Produto';
      case 'instagram':
        return 'Instagram';
      default:
        return source;
    }
  };

  const getSourceBadgeVariant = (source: string) => {
    switch (source) {
      case 'whatsapp_feed':
      case 'whatsapp_product':
        return 'default';
      case 'instagram':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  if (!canAccessFeature(profile, 'lead_capture')) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">Gestão de Leads</h1>
            <p className="text-muted-foreground">
              Capture e gerencie leads do seu catálogo
            </p>
          </div>
          
          <PlanFeatureRestriction 
            requiredPlan="pro_plus"
            featureName="Captura de Leads"
            description="A captura de leads está disponível nos planos Pro+ e superiores"
          />
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-whatsapp mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando leads...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const filteredLeads = getFilteredLeads();

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Leads</h1>
          <p className="text-muted-foreground">
            Gerencie os leads capturados no seu catálogo
          </p>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Leads</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{leads.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(lead => {
                  const leadDate = new Date(lead.captured_at);
                  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                  return leadDate >= weekAgo;
                }).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">WhatsApp</CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(lead => 
                  lead.source_button.includes('whatsapp')
                ).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Instagram</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {leads.filter(lead => 
                  lead.source_button === 'instagram'
                ).length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Actions */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Lista de Leads</CardTitle>
                <CardDescription>
                  {filteredLeads.length} leads encontrados
                </CardDescription>
              </div>
              <Button onClick={handleExportLeads} disabled={filteredLeads.length === 0}>
                <Download className="mr-2 h-4 w-4" />
                Exportar Excel
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome, telefone ou cidade..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por origem" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as origens</SelectItem>
                  <SelectItem value="whatsapp_feed">WhatsApp do Feed</SelectItem>
                  <SelectItem value="whatsapp_product">WhatsApp do Produto</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                </SelectContent>
              </Select>

              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filtrar por período" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os períodos</SelectItem>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Última semana</SelectItem>
                  <SelectItem value="month">Último mês</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            {filteredLeads.length === 0 ? (
              <div className="text-center py-8">
                <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Nenhum lead encontrado</h3>
                <p className="text-muted-foreground">
                  {leads.length === 0 
                    ? "Configure a captura de leads nas configurações do catálogo."
                    : "Tente ajustar os filtros para encontrar os leads desejados."
                  }
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Cidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Origem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phone}</TableCell>
                      <TableCell>{lead.city}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(lead.captured_at)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getSourceBadgeVariant(lead.source_button)}>
                          {getSourceDisplayName(lead.source_button)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default LeadsManagement;