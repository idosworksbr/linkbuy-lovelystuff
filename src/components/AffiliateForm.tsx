import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Save } from "lucide-react";

interface Affiliate {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  affiliate_code: string;
  commission_rate: number;
  status: string;
}

interface AffiliateFormProps {
  affiliate: Affiliate | null;
  onClose: () => void;
}

export const AffiliateForm = ({ affiliate, onClose }: AffiliateFormProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    commission_rate: '30',
    status: 'active'
  });

  useEffect(() => {
    if (affiliate) {
      setFormData({
        name: affiliate.name,
        email: affiliate.email,
        phone: affiliate.phone || '',
        commission_rate: affiliate.commission_rate.toString(),
        status: affiliate.status
      });
    }
  }, [affiliate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (affiliate) {
        // Update
        const { error } = await supabase
          .from('affiliates')
          .update({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            commission_rate: parseFloat(formData.commission_rate),
            status: formData.status
          })
          .eq('id', affiliate.id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Afiliado atualizado com sucesso'
        });
      } else {
        // Create - Generate affiliate code on the database side
        const affiliateCode = await generateAffiliateCode();
        const affiliateUrl = `${window.location.origin}?ref=${affiliateCode}`;

        const { error } = await supabase
          .from('affiliates')
          .insert({
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            affiliate_code: affiliateCode,
            affiliate_url: affiliateUrl,
            commission_rate: parseFloat(formData.commission_rate),
            status: formData.status
          });

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Afiliado criado com sucesso'
        });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving affiliate:', error);
      toast({
        title: 'Erro',
        description: error.message || 'Erro ao salvar afiliado',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAffiliateCode = async (): Promise<string> => {
    const { data, error } = await supabase.rpc('generate_affiliate_code');
    if (error) throw error;
    return data;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <CardTitle>
            {affiliate ? 'Editar Afiliado' : 'Novo Afiliado'}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+55 11 98765-4321"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="commission_rate">Taxa de Comissão (%)</Label>
              <Input
                id="commission_rate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.commission_rate}
                onChange={(e) => setFormData({ ...formData, commission_rate: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                  <SelectItem value="suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};