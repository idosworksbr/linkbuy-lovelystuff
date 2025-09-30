import { DemoCatalog } from '@/components/demos/DemoCatalog';
import { DemoProductData } from '@/components/demos/DemoProduct';

const DemoLanchonete = () => {
  const products: DemoProductData[] = [
    { id: '1', name: 'Burger Clássico', emoji: '🍔', price: 24.90, category: 'Burgers' },
    { id: '2', name: 'Burger Bacon', emoji: '🥓', price: 28.90, discount: 15, discountAnimationEnabled: true, discountAnimationColor: '#10b981', category: 'Burgers' },
    { id: '3', name: 'Burger Vegetariano', emoji: '🥬', price: 26.90, category: 'Burgers' },
    { id: '4', name: 'Hot Dog Especial', emoji: '🌭', price: 18.90, category: 'Hot Dogs' },
    { id: '5', name: 'Hot Dog Completo', emoji: '🌭', price: 22.90, category: 'Hot Dogs' },
    { id: '6', name: 'Batata Frita', emoji: '🍟', price: 12.00, category: 'Acompanhamentos' },
    { id: '7', name: 'Onion Rings', emoji: '🧅', price: 14.00, category: 'Acompanhamentos' },
    { id: '8', name: 'Nuggets de Frango', emoji: '🍗', price: 16.90, category: 'Acompanhamentos' },
    { id: '9', name: 'Refrigerante 350ml', emoji: '🥤', price: 6.00, category: 'Bebidas' },
    { id: '10', name: 'Suco Natural', emoji: '🧃', price: 8.90, category: 'Bebidas' },
    { id: '11', name: 'Milkshake', emoji: '🥤', price: 15.90, category: 'Bebidas' },
    { id: '12', name: 'Combo Família', emoji: '🍔', price: 89.90, discount: 20, discountAnimationEnabled: true, discountAnimationColor: '#10b981', category: 'Combos' },
    { id: '13', name: 'Combo Duplo', emoji: '🍔', price: 45.90, discount: 10, discountAnimationEnabled: true, discountAnimationColor: '#10b981', category: 'Combos' },
    { id: '14', name: 'Combo Kids', emoji: '🍔', price: 25.90, category: 'Combos' },
    { id: '15', name: 'Burger Picante', emoji: '🌶️', price: 29.90, category: 'Burgers' },
    { id: '16', name: 'Salada Caesar', emoji: '🥗', price: 22.00, category: 'Acompanhamentos' },
    { id: '17', name: 'Água Mineral', emoji: '💧', price: 4.00, category: 'Bebidas' },
    { id: '18', name: 'Sobremesa do Dia', emoji: '🍰', price: 12.90, category: 'Sobremesas' },
    { id: '19', name: 'Brownie', emoji: '🍫', price: 9.90, category: 'Sobremesas' },
    { id: '20', name: 'Sorvete', emoji: '🍦', price: 8.90, category: 'Sobremesas' },
  ];

  const categories = [
    { id: '1', name: 'Burgers', emoji: '🍔' },
    { id: '2', name: 'Hot Dogs', emoji: '🌭' },
    { id: '3', name: 'Acompanhamentos', emoji: '🍟' },
    { id: '4', name: 'Bebidas', emoji: '🥤' },
    { id: '5', name: 'Combos', emoji: '🍔' },
    { id: '6', name: 'Sobremesas', emoji: '🍰' },
  ];

  const customLinks = [
    { id: '1', title: 'Cardápio Completo', url: '#', icon: '📋' },
    { id: '2', title: 'Promoções da Semana', url: '#', icon: '🎉' },
    { id: '3', title: 'Delivery iFood', url: '#', icon: '🛵' },
  ];

  return (
    <DemoCatalog
      profile={{
        storeName: 'Burger Station',
        emoji: '🍔',
        description: 'Os melhores burgers artesanais da região! Delivery rápido',
        whatsapp: '5511955555555',
        instagram: '@burgerstation',
        isVerified: false,
        theme: 'mint',
        layout: 'bottom',
        gridStyle: 'round',
        backgroundType: 'gradient',
        backgroundColor: 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)',
      }}
      products={products}
      categories={categories}
      customLinks={customLinks}
    />
  );
};

export default DemoLanchonete;
