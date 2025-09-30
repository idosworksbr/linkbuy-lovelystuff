import { DemoCatalog } from '@/components/demos/DemoCatalog';
import { DemoProductData } from '@/components/demos/DemoProduct';

const DemoRestaurante = () => {
  const products: DemoProductData[] = [
    { id: '1', name: 'Espaguete à Carbonara', emoji: '🍝', price: 45.90, category: 'Massas' },
    { id: '2', name: 'Risoto de Cogumelos', emoji: '🍚', price: 52.00, discount: 15, discountAnimationEnabled: true, discountAnimationColor: '#d4af37', category: 'Pratos Principais' },
    { id: '3', name: 'Salada Caesar', emoji: '🥗', price: 32.50, category: 'Entradas' },
    { id: '4', name: 'Pizza Margherita', emoji: '🍕', price: 48.00, category: 'Massas' },
    { id: '5', name: 'Tiramisu Clássico', emoji: '🍰', price: 28.00, category: 'Sobremesas' },
    { id: '6', name: 'Filé ao Molho Madeira', emoji: '🥩', price: 78.00, category: 'Pratos Principais' },
    { id: '7', name: 'Bruschetta Italiana', emoji: '🍞', price: 24.50, category: 'Entradas' },
    { id: '8', name: 'Vinho Tinto Reserva', emoji: '🍷', price: 120.00, category: 'Bebidas' },
    { id: '9', name: 'Pannacotta de Frutas', emoji: '🍮', price: 26.00, category: 'Sobremesas' },
    { id: '10', name: 'Carpaccio de Salmão', emoji: '🐟', price: 42.00, category: 'Entradas' },
    { id: '11', name: 'Lasanha à Bolonhesa', emoji: '🍲', price: 49.90, category: 'Massas' },
    { id: '12', name: 'Espresso Italiano', emoji: '☕', price: 12.00, category: 'Bebidas' },
  ];

  const categories = [
    { id: '1', name: 'Entradas', emoji: '🍞' },
    { id: '2', name: 'Pratos Principais', emoji: '🍽️' },
    { id: '3', name: 'Massas', emoji: '🍝' },
    { id: '4', name: 'Sobremesas', emoji: '🍰' },
    { id: '5', name: 'Bebidas', emoji: '🍷' },
  ];

  const customLinks = [
    { id: '1', title: 'Menu Completo (PDF)', url: '#', icon: '📄' },
    { id: '2', title: 'Fazer Reserva', url: '#', icon: '📅' },
    { id: '3', title: 'Delivery', url: '#', icon: '🛵' },
  ];

  return (
    <DemoCatalog
      profile={{
        storeName: 'Le Gourmet',
        emoji: '🍽️',
        description: 'Culinária francesa contemporânea no coração da cidade',
        whatsapp: '5511999999999',
        instagram: '@legourmet',
        isVerified: false,
        theme: 'gold',
        layout: 'bottom',
        gridStyle: 'instagram',
        backgroundType: 'gradient',
        backgroundColor: 'linear-gradient(135deg, #f5f5dc 0%, #fffaf0 100%)',
      }}
      products={products}
      categories={categories}
      customLinks={customLinks}
    />
  );
};

export default DemoRestaurante;
