import { DemoCatalog } from '@/components/demos/DemoCatalog';
import { DemoProductData } from '@/components/demos/DemoProduct';

const DemoLojaCelular = () => {
  const products: DemoProductData[] = [
    { id: '1', name: 'iPhone 15 Pro Max', emoji: '📱', price: 7999.00, discount: 10, discountAnimationEnabled: true, discountAnimationColor: '#3b82f6', category: 'Smartphones' },
    { id: '2', name: 'Samsung Galaxy S24 Ultra', emoji: '📱', price: 6499.00, category: 'Smartphones' },
    { id: '3', name: 'MacBook Air M3', emoji: '💻', price: 9999.00, category: 'Notebooks' },
    { id: '4', name: 'Apple Watch Series 9', emoji: '⌚', price: 3999.00, discount: 15, discountAnimationEnabled: true, discountAnimationColor: '#3b82f6', category: 'Smartwatches' },
    { id: '5', name: 'AirPods Pro 2', emoji: '🎧', price: 2199.00, category: 'Acessórios' },
    { id: '6', name: 'iPad Pro 12.9"', emoji: '📱', price: 10999.00, category: 'Tablets' },
    { id: '7', name: 'Samsung Galaxy Watch 6', emoji: '⌚', price: 1999.00, category: 'Smartwatches' },
    { id: '8', name: 'Carregador Rápido 65W', emoji: '🔌', price: 149.00, category: 'Acessórios' },
    { id: '9', name: 'Capa Premium iPhone', emoji: '📱', price: 89.00, category: 'Acessórios' },
    { id: '10', name: 'Xiaomi 13T Pro', emoji: '📱', price: 3999.00, discount: 20, discountAnimationEnabled: true, discountAnimationColor: '#3b82f6', category: 'Smartphones' },
  ];

  const categories = [
    { id: '1', name: 'Smartphones', emoji: '📱' },
    { id: '2', name: 'Notebooks', emoji: '💻' },
    { id: '3', name: 'Smartwatches', emoji: '⌚' },
    { id: '4', name: 'Acessórios', emoji: '🎧' },
    { id: '5', name: 'Tablets', emoji: '📱' },
  ];

  const customLinks = [
    { id: '1', title: 'Garantia Estendida', url: '#', icon: '🛡️' },
    { id: '2', title: 'Troca e Devolução', url: '#', icon: '🔄' },
    { id: '3', title: 'Assistência Técnica', url: '#', icon: '🔧' },
  ];

  return (
    <DemoCatalog
      profile={{
        storeName: 'TechMobile Store',
        emoji: '📱',
        description: 'Os melhores smartphones e acessórios com garantia oficial',
        whatsapp: '5511988888888',
        instagram: '@techmobilestore',
        isVerified: true,
        theme: 'dark',
        layout: 'bottom',
        gridStyle: 'round',
        backgroundColor: '#0f172a',
      }}
      products={products}
      categories={categories}
      customLinks={customLinks}
    />
  );
};

export default DemoLojaCelular;
