import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingBag, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const ResetPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: "Email enviado!",
        description: "Verifique sua caixa de entrada para redefinir sua senha.",
      });
    } catch (error: any) {
      console.error('Reset password error:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar email de recuperação.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-whatsapp/5 to-catalog flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
            <ArrowLeft className="h-4 w-4" />
            Voltar ao login
          </Link>
          
          <div className="flex items-center justify-center gap-2 mb-4">
            <ShoppingBag className="h-10 w-10 text-whatsapp" />
            <span className="text-3xl font-bold">MyLinkBuy</span>
          </div>
          <p className="text-muted-foreground">Recupere sua senha</p>
        </div>

        <Card className="dashboard-card">
          {!emailSent ? (
            <>
              <CardHeader className="text-center pb-4">
                <CardTitle>Esqueceu sua senha?</CardTitle>
                <CardDescription>
                  Digite seu email e enviaremos instruções para redefinir sua senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="seu@email.com"
                        className="pl-10 input-focus"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="btn-hero w-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Enviando..." : "Enviar instruções"}
                  </Button>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Email enviado!</CardTitle>
                <CardDescription>
                  Verifique sua caixa de entrada e siga as instruções para redefinir sua senha
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/login">
                  <Button className="btn-hero w-full">
                    Voltar ao login
                  </Button>
                </Link>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ResetPassword;
