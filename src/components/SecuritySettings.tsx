import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Key, Mail, Smartphone, Activity, Clock, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";

export const SecuritySettings = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [passwordStrength, setPasswordStrength] = useState<'weak' | 'medium' | 'strong'>('weak');

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
    </div>
  );
};