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

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return;
        }
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: 'Link copiado!',
        description: 'O link do catálogo foi copiado para a área de transferência.',
      });
    } catch (error) {
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      toast({
        title: 'Link copiado!',
        description: 'O link do catálogo foi copiado para a área de transferência.',
      });
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleShare}
      className="gap-2"
      title="Compartilhar Catálogo"
      aria-label="Compartilhar Catálogo"
    >
      <Share2 className="h-4 w-4" />
      <span className="hidden sm:inline">Compartilhar Catálogo</span>
      <span className="sm:hidden">Compartilhar</span>
    </Button>
  );
};