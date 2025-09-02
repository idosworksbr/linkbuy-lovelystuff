import React from 'react';
import { Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface ShareButtonProps {
  storeUrl: string;
  storeName: string;
}

export const ShareButton: React.FC<ShareButtonProps> = ({ storeUrl, storeName }) => {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/catalogo/${storeUrl}`;
    const title = `Catálogo ${storeName}`;
    const text = `Confira meu catálogo digital: ${storeName}`;

    // Tentar usar Web Share API nativa
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url,
        });
        return;
      } catch (error) {
        // Se cancelar, não fazer nada
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
        // Se falhar, usar fallback
      }
    }

    // Fallback: copiar para clipboard
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copiado!",
        description: "O link do catálogo foi copiado para a área de transferência.",
      });
    } catch (error) {
      // Fallback final: prompt do usuário
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      toast({
        title: "Link copiado!",
        description: "O link do catálogo foi copiado para a área de transferência.",
      });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleShare}
      className="p-2 hover:bg-black/10 rounded-full transition-colors"
    >
      <Share2 className="h-5 w-5" />
    </Button>
  );
};