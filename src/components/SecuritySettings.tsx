import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Shield, Key, Mail, Smartphone, Activity, Clock, AlertTriangle, RefreshCcw, Eye, EyeOff, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";

export const SecuritySettings = () => {
  const { user } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

  // Delete account state
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Reset catalog state
  const [resetPassword, setResetPassword] = useState("");
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  // Catalog visibility state
  const [catalogVisible, setCatalogVisible] = useState(profile?.catalog_visible ?? true);

  // Password strength checker
  const checkPasswordStrength = (password: string) => {
    if (password.length < 6) return 'weak';
    if (password.length >= 8 && /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return 'strong';
    return 'medium';
  };

  const handlePasswordStrengthCheck = (password: string) => {
    setNewPassword(password);
    setPasswordStrength(checkPasswordStrength(password));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Senhas não coincidem",
        description: "A nova senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Senha muito curta",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      toast({
        title: "Senha alterada",
        description: "Sua senha foi alterada com sucesso.",
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar senha",
        description: error.message || "Não foi possível alterar a senha.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newEmail || !newEmail.includes("@")) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        email: newEmail
      });

      if (error) throw error;

      toast({
        title: "Email de confirmação enviado",
        description: "Verifique seu email para confirmar a alteração.",
      });

      setNewEmail("");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar email",
        description: error.message || "Não foi possível alterar o email.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhoneChange = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneNumbers = newPhone.replace(/\D/g, "");
    
    if (phoneNumbers.length < 10) {
      toast({
        title: "Telefone inválido",
        description: "Digite um número de telefone válido.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        phone: `+${phoneNumbers}`
      });

      if (error) throw error;

      toast({
        title: "Telefone alterado",
        description: "Seu telefone foi alterado com sucesso.",
      });

      setNewPhone("");
    } catch (error: any) {
      toast({
        title: "Erro ao alterar telefone",
        description: error.message || "Não foi possível alterar o telefone.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword || deleteConfirmText !== "DELETE") {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos corretamente",
      });
      return;
    }

    setIsDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('delete-user-account', {
        body: { password: deletePassword },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Conta deletada",
        description: "Sua conta foi deletada permanentemente",
      });

      // Logout and redirect
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao deletar conta",
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleResetCatalog = async () => {
    if (!resetPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Digite sua senha para confirmar",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('reset-catalog', {
        body: { password: resetPassword },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast({
        title: "Catálogo resetado",
        description: "Todos os seus produtos e dados foram removidos",
      });

      setResetPassword("");
      setShowResetDialog(false);
      
      // Reload page to reflect changes
      window.location.reload();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro ao resetar catálogo",
        description: error.message || "Tente novamente mais tarde",
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleToggleCatalogVisibility = async (visible: boolean) => {
    try {
      await updateProfile({ catalog_visible: visible });
      setCatalogVisible(visible);
      
      toast({
        title: visible ? "Catálogo ativado" : "Catálogo oculto",
        description: visible 
          ? "Seu catálogo está visível publicamente" 
          : "Seu catálogo está oculto para o público",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível alterar a visibilidade do catálogo",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6" />
          Segurança da Conta
        </h2>
        <p className="text-muted-foreground">
          Gerencie suas informações de segurança e autenticação
        </p>
      </div>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Atualize sua senha para manter sua conta segura
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Senha Atual</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">Nova Senha</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => handlePasswordStrengthCheck(e.target.value)}
                placeholder="Digite sua nova senha"
                minLength={6}
                required
              />
              
              {/* Password Strength Indicator */}
              {newPassword && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className={`h-2 flex-1 rounded ${
                      passwordStrength === 'weak' ? 'bg-red-200' :
                      passwordStrength === 'medium' ? 'bg-yellow-200' : 'bg-green-200'
                    }`}>
                      <div className={`h-full rounded transition-all ${
                        passwordStrength === 'weak' ? 'w-1/3 bg-red-500' :
                        passwordStrength === 'medium' ? 'w-2/3 bg-yellow-500' : 'w-full bg-green-500'
                      }`} />
                    </div>
                    <Badge variant={
                      passwordStrength === 'weak' ? 'destructive' :
                      passwordStrength === 'medium' ? 'secondary' : 'default'
                    }>
                      {passwordStrength === 'weak' ? 'Fraca' :
                       passwordStrength === 'medium' ? 'Média' : 'Forte'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Use pelo menos 8 caracteres com letras maiúsculas, minúsculas e números
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                minLength={6}
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Alterando..." : "Alterar Senha"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Account Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividade da Conta
          </CardTitle>
          <CardDescription>
            Informações sobre o acesso à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Último acesso</p>
                <p className="text-xs text-muted-foreground">
                  {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString('pt-BR') : 'Não disponível'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Email verificado</p>
                <p className="text-xs text-muted-foreground">
                  {user?.email_confirmed_at ? 'Sim' : 'Não verificado'}
                </p>
              </div>
            </div>
            {user?.email_confirmed_at && (
              <Badge variant="default">Verificado</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Email */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Alterar Email
          </CardTitle>
          <CardDescription>
            Email atual: {user?.email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-email">Novo Email</Label>
              <Input
                id="new-email"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Digite seu novo email"
                required
              />
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Enviando..." : "Enviar Confirmação"}
            </Button>

            <p className="text-xs text-muted-foreground">
              Um email de confirmação será enviado para o novo endereço.
            </p>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Change Phone */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Alterar Telefone
          </CardTitle>
          <CardDescription>
            Telefone atual: {user?.phone || "Não informado"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePhoneChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-phone">Novo Telefone</Label>
              <Input
                id="new-phone"
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="5511999999999 (código do país + DDD + número)"
                required
              />
              <p className="text-xs text-muted-foreground">
                Digite apenas números. Exemplo: 5511999999999
              </p>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Alterando..." : "Alterar Telefone"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Catalog Visibility */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {catalogVisible ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            <div>
              <CardTitle>Visibilidade do Catálogo</CardTitle>
              <CardDescription>
                Controle se seu catálogo está visível publicamente
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex-1">
              <Label htmlFor="catalog-visible" className="text-base font-medium">
                Catálogo Público
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Quando oculto, apenas você poderá visualizar seu catálogo
              </p>
            </div>
            <Switch
              id="catalog-visible"
              checked={catalogVisible}
              onCheckedChange={handleToggleCatalogVisibility}
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Reset Catalog */}
      <Card className="border-orange-200 dark:border-orange-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5 text-orange-600" />
            <div>
              <CardTitle className="text-orange-600 dark:text-orange-400">Resetar Catálogo</CardTitle>
              <CardDescription>
                Apagar todos os produtos, categorias, links e analytics
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg">
            <p className="text-sm text-orange-900 dark:text-orange-100 font-medium mb-2">
              Esta ação irá deletar:
            </p>
            <ul className="text-sm text-orange-800 dark:text-orange-200 space-y-1 ml-4">
              <li>✓ Todos os produtos</li>
              <li>✓ Todas as categorias</li>
              <li>✓ Todos os links personalizados</li>
              <li>✓ Todos os dados de analytics</li>
            </ul>
            <p className="text-sm text-orange-900 dark:text-orange-100 font-medium mt-3">
              Será mantido: Sua conta, perfil e assinaturas
            </p>
          </div>
          <Button
            variant="outline"
            className="w-full border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            onClick={() => setShowResetDialog(true)}
          >
            <RefreshCcw className="h-4 w-4 mr-2" />
            Resetar Catálogo
          </Button>
        </CardContent>
      </Card>

      <Separator />

      {/* Delete Account */}
      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <div>
              <CardTitle className="text-red-600 dark:text-red-400">Deletar Conta</CardTitle>
              <CardDescription>
                Deletar permanentemente sua conta e todos os dados associados
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-950 rounded-lg">
            <p className="text-sm text-red-900 dark:text-red-100 font-medium mb-2">
              ⚠️ Atenção: Esta ação é irreversível!
            </p>
            <p className="text-sm text-red-800 dark:text-red-200">
              Todos os seus dados, produtos, imagens, assinaturas e configurações serão deletados permanentemente.
              {profile?.subscription_plan && profile.subscription_plan !== 'free' && (
                <span className="block mt-2 font-medium">
                  Sua assinatura ativa será cancelada imediatamente.
                </span>
              )}
            </p>
          </div>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Deletar Conta Permanentemente
          </Button>
        </CardContent>
      </Card>

      {/* Reset Catalog Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resetar Catálogo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá deletar permanentemente todos os seus produtos, categorias, links personalizados e dados de analytics.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="reset-password">Digite sua senha para confirmar</Label>
              <Input
                id="reset-password"
                type="password"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setResetPassword("")}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetCatalog}
              disabled={!resetPassword || isResetting}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isResetting ? "Resetando..." : "Resetar Catálogo"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-600">Deletar Conta Permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados serão deletados permanentemente, incluindo:
              produtos, categorias, links, analytics, perfil e assinaturas ativas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="delete-password">Digite sua senha</Label>
              <Input
                id="delete-password"
                type="password"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                placeholder="Sua senha"
              />
            </div>
            <div>
              <Label htmlFor="delete-confirm">
                Digite <span className="font-bold text-red-600">DELETE</span> para confirmar
              </Label>
              <Input
                id="delete-confirm"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="DELETE"
              />
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeletePassword("");
              setDeleteConfirmText("");
            }}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={!deletePassword || deleteConfirmText !== "DELETE" || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deletando..." : "Deletar Permanentemente"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};