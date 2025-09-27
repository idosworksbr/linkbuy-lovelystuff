import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const usePageTitle = (title?: string) => {
  const location = useLocation();

  useEffect(() => {
    if (title) {
      document.title = title;
    } else {
      // Dynamic titles based on route
      const path = location.pathname;
      
      if (path === '/dashboard' || path.startsWith('/dashboard')) {
        if (path.includes('/settings')) {
          document.title = 'MyLinkBuy - Configurações';
        } else if (path.includes('/analytics')) {
          document.title = 'MyLinkBuy - Analytics';
        } else if (path.includes('/plans')) {
          document.title = 'MyLinkBuy - Planos';
        } else if (path.includes('/add-product')) {
          document.title = 'MyLinkBuy - Adicionar Produto';
        } else {
          document.title = 'MyLinkBuy - Dashboard';
        }
      } else if (path === '/login') {
        document.title = 'MyLinkBuy - Login';
      } else if (path === '/') {
        document.title = 'MyLinkBuy - Catálogos Online';
      } else if (path.startsWith('/catalog/')) {
        // Will be set dynamically by Catalog component with store name
        document.title = 'MyLinkBuy - Catálogo';
      } else {
        document.title = 'MyLinkBuy';
      }
    }
  }, [title, location.pathname]);
};