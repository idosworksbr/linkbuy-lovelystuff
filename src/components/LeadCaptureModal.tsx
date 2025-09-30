import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Phone, User, Gift } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface LeadCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  sourceButton: string;
  onSubmit: (captured?: boolean) => void;
  theme?: string;
}

export const LeadCaptureModal = ({ 
  open, 
  onOpenChange, 
  storeId, 
  sourceButton, 
  onSubmit,
  theme = 'light'
}: LeadCaptureModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    city: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim() || !formData.city.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.functions.invoke('capture-lead', {
        body: {
          store_id: storeId,
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          source_button: sourceButton,
          user_agent: navigator.userAgent,
          ip_address: null // Will be captured server-side
        }
      });

      if (error) throw error;

      toast({
        title: "Obrigado!",
        description: "Seus dados foram registrados com sucesso.",
      });

      // Clear form and close modal
      setFormData({ name: '', phone: '', city: '' });
      onOpenChange(false);
      onSubmit(true);
    } catch (error) {
      console.error('Error capturing lead:', error);
      toast({
        title: "Erro",
        description: "Erro ao registrar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isDarkTheme = theme === 'dark';
  const cardClass = isDarkTheme 
    ? "bg-gray-800 border-gray-700 text-white" 
    : "bg-white border-gray-200";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-md ${cardClass}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-center justify-center">
            <Gift className="h-5 w-5 text-primary" />
            Oferta Especial para Você!
          </DialogTitle>
        </DialogHeader>
        
        <Card className={cardClass}>
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-2">
                🎁 Antes de continuar, que tal receber ofertas exclusivas?
              </p>
              <p className="text-xs text-muted-foreground">
                Deixe seus dados e seja o primeiro a saber das novidades!
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nome
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Seu nome"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  WhatsApp
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="(11) 99999-9999"
                  type="tel"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Cidade
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="São Paulo, SP"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    onOpenChange(false);
                    onSubmit(false);
                  }}
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  Agora não
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  {isSubmitting ? "Enviando..." : "Receber Ofertas"}
                </Button>
              </div>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-4">
              🔒 Seus dados estão seguros conosco
            </p>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};