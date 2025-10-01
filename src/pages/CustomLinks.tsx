import { useState } from "react";
import { Plus, Edit, Trash2, GripVertical, ExternalLink, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DashboardLayout from "@/components/DashboardLayout";
import { useCustomLinks, CustomLink } from "@/hooks/useCustomLinks";
import { useToast } from "@/hooks/use-toast";
import { usePlans } from "@/hooks/usePlans";
import { useProfile } from "@/hooks/useProfile";
import { PlanFeatureRestriction } from "@/components/PlanFeatureRestriction";

// Popular icon options for links
const iconOptions = [
  { value: 'ExternalLink', label: 'Link Externo', icon: ExternalLink },
  { value: 'Link', label: 'Link', icon: LinkIcon },
  { value: 'Instagram', label: 'Instagram', icon: LinkIcon },
  { value: 'Facebook', label: 'Facebook', icon: LinkIcon },
  { value: 'Twitter', label: 'Twitter', icon: LinkIcon },
  { value: 'Youtube', label: 'YouTube', icon: LinkIcon },
  { value: 'Mail', label: 'Email', icon: LinkIcon },
  { value: 'Phone', label: 'Telefone', icon: LinkIcon },
  { value: 'MapPin', label: 'Localização', icon: LinkIcon },
  { value: 'Globe', label: 'Website', icon: LinkIcon },
];

const CustomLinks = () => {
  const { customLinks, loading, createCustomLink, updateCustomLink, deleteCustomLink } = useCustomLinks();
  const { toast } = useToast();
  const { profile } = useProfile();
  const { canAccessFeature } = usePlans();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    icon: 'ExternalLink',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      url: '',
      icon: 'ExternalLink',
      is_active: true,
    });
    setEditingLink(null);
  };

  const handleOpenDialog = (link?: CustomLink) => {
    if (link) {
      setEditingLink(link);
      setFormData({
        title: link.title,
        url: link.url,
        icon: link.icon || 'ExternalLink',
        is_active: link.is_active,
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const validateUrl = (url: string) => {
    try {
      new URL(url);
      return true;
    } catch {
      return url.startsWith('/') || url.startsWith('#');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, preencha o título do link.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.url.trim()) {
      toast({
        title: "URL obrigatória",
        description: "Por favor, preencha a URL do link.",
        variant: "destructive",
      });
      return;
    }

    if (!validateUrl(formData.url)) {
      toast({
        title: "URL inválida",
        description: "Por favor, insira uma URL válida (deve começar com http://, https:// ou /).",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingLink) {
        await updateCustomLink(editingLink.id, formData);
      } else {
        await createCustomLink({
          ...formData,
          display_order: customLinks.length,
        });
      }
      handleCloseDialog();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este link?')) {
      setIsDeleting(id);
      try {
        await deleteCustomLink(id);
      } catch (error) {
        // Error handling is done in the hook
      } finally {
        setIsDeleting(null);
      }
    }
  };

  const handleToggleActive = async (link: CustomLink) => {
    try {
      await updateCustomLink(link.id, { is_active: !link.is_active });
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-muted-foreground">Carregando links personalizados...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Check if user has access to custom links feature (Pro plan or higher)
  if (!canAccessFeature(profile, 'custom_links')) {
    return (
      <DashboardLayout>
        <div className="space-y-6 max-w-4xl mx-auto">
          <div>
            <h1 className="text-3xl font-bold">Links Personalizados</h1>
            <p className="text-muted-foreground">
              Adicione links personalizados que aparecerão no seu catálogo
            </p>
          </div>
          <PlanFeatureRestriction 
            requiredPlan="pro"
            featureName="Links Personalizados"
            description="Esta funcionalidade está disponível a partir do plano Pro. Faça upgrade para adicionar links personalizados ao seu catálogo."
          />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold">Links Personalizados</h1>
          <p className="text-muted-foreground">
            Adicione links personalizados que aparecerão no seu catálogo
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Seus Links</CardTitle>
                <CardDescription>
                  Gerencie os links que aparecerão no seu catálogo público
                </CardDescription>
              </div>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Link
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {customLinks.length > 0 ? (
              <div className="space-y-4">
                {customLinks.map((link) => {
                  const IconComponent = iconOptions.find(opt => opt.value === link.icon)?.icon || ExternalLink;
                  
                  return (
                    <div
                      key={link.id}
                      className={`flex items-center gap-4 p-4 border rounded-lg ${
                        link.is_active ? 'bg-white' : 'bg-gray-50 opacity-60'
                      }`}
                    >
                      <div className="cursor-grab">
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      <div className="flex items-center gap-3 flex-1">
                        <IconComponent className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <h3 className="font-medium">{link.title}</h3>
                          <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Switch
                          checked={link.is_active}
                          onCheckedChange={() => handleToggleActive(link)}
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenDialog(link)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(link.id)}
                          disabled={isDeleting === link.id}
                        >
                          {isDeleting === link.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <LinkIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Nenhum link ainda</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Adicione links personalizados para que seus clientes possam acessar suas redes sociais e outros sites.
                </p>
                <Button onClick={() => handleOpenDialog()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Primeiro Link
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog for Add/Edit Link */}
        <Dialog open={isDialogOpen} onOpenChange={handleCloseDialog}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingLink ? 'Editar Link' : 'Adicionar Link'}
              </DialogTitle>
              <DialogDescription>
                {editingLink 
                  ? 'Edite as informações do seu link personalizado.'
                  : 'Adicione um novo link personalizado ao seu catálogo.'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Ex: Meu Instagram"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://instagram.com/seuusuario"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon">Ícone</Label>
                  <Select
                    value={formData.icon}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um ícone" />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <option.icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label htmlFor="is_active">Link ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingLink ? 'Salvar Alterações' : 'Adicionar Link'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default CustomLinks;