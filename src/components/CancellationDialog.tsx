import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Heart, Shield, Star } from "lucide-react";

interface CancellationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel: () => void;
  planName: string;
  expirationDate?: string;
}

export const CancellationDialog = ({
  open,
  onOpenChange,
  onConfirmCancel,
  planName,
  expirationDate,
}: CancellationDialogProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  const handleCancel = async () => {
    setIsConfirming(true);
    try {
      await onConfirmCancel();
      onOpenChange(false);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            Cancelar Assinatura?
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Você está prestes a cancelar seu plano <strong>{planName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Que tal continuar conosco?
            </h3>
            <p className="text-blue-800 text-sm mb-3">
              Você está aproveitando todos os benefícios do seu plano:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Star className="h-4 w-4 text-yellow-500" />
                <span>Catálogo profissional e personalizado</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Shield className="h-4 w-4 text-green-500" />
                <span>Analytics detalhados dos seus produtos</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <Heart className="h-4 w-4 text-red-500" />
                <span>Suporte prioritário</span>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h4 className="font-medium text-orange-800 mb-1">
              O que acontece se você cancelar:
            </h4>
            <ul className="text-sm text-orange-700 space-y-1">
              <li>• Sua assinatura permanece ativa até {expirationDate}</li>
              <li>• Após essa data, você perde acesso aos recursos premium</li>
              <li>• Seus dados permanecerão salvos para reativação futura</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Manter Assinatura
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isConfirming}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {isConfirming ? "Cancelando..." : "Confirmar Cancelamento"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};