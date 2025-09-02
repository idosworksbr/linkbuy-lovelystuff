import { useState, useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface UseUnsavedChangesProps {
  onBeforeUnload?: () => boolean;
}

export const useUnsavedChanges = ({ onBeforeUnload }: UseUnsavedChangesProps = {}) => {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const { toast } = useToast();

  const markAsChanged = useCallback(() => {
    setHasUnsavedChanges(true);
  }, []);

  const markAsSaved = useCallback(() => {
    setHasUnsavedChanges(false);
  }, []);

  const confirmLeave = useCallback(() => {
    if (hasUnsavedChanges) {
      return window.confirm(
        'Você tem alterações não salvas. Tem certeza que deseja sair sem salvar?'
      );
    }
    return true;
  }, [hasUnsavedChanges]);

  const showUnsavedWarning = useCallback(() => {
    if (hasUnsavedChanges) {
      toast({
        title: "Alterações não salvas",
        description: "Lembre-se de salvar suas alterações antes de sair.",
        variant: "destructive",
      });
    }
  }, [hasUnsavedChanges, toast]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        const shouldPreventDefault = onBeforeUnload ? !onBeforeUnload() : true;
        if (shouldPreventDefault) {
          e.preventDefault();
          e.returnValue = '';
        }
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, onBeforeUnload]);

  return {
    hasUnsavedChanges,
    markAsChanged,
    markAsSaved,
    confirmLeave,
    showUnsavedWarning,
  };
};