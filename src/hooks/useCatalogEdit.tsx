import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface UseCatalogEditProps {
  storeId: string;
}

export const useCatalogEdit = ({ storeId }: UseCatalogEditProps) => {
  const { user } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    // Verificar se o usuário logado é o dono da loja
    setIsOwner(user?.id === storeId);
  }, [user, storeId]);

  const toggleEditMode = () => {
    if (isOwner) {
      setIsEditMode(!isEditMode);
    }
  };

  return {
    isEditMode,
    isOwner,
    toggleEditMode,
    setIsEditMode,
  };
};