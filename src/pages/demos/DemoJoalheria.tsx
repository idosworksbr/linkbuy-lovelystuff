import { DemoCatalog } from '@/components/demos/DemoCatalog';
import { DemoProductData } from '@/components/demos/DemoProduct';

const DemoJoalheria = () => {
  const products: DemoProductData[] = [
    { id: '1', name: 'Anel de Ouro 18k', emoji: '💍', price: 2499.00, discount: 10, discountAnimationEnabled: true, discountAnimationColor: '#9333ea', category: 'Anéis' },
    { id: '2', name: 'Colar de Diamantes', emoji: '📿', price: 4999.00, category: 'Colares' },
    { id: '3', name: 'Brinco de Pérolas', emoji: '💎', price: 1899.00, category: 'Brincos' },
    { id: '4', name: 'Relógio Suíço Automático', emoji: '⌚', price: 8999.00, category: 'Relógios' },
    { id: '5', name: 'Pulseira de Prata 925', emoji: '💍', price: 899.00, category: 'Pulseiras' },
    { id: '6', name: 'Tiara com Cristais', emoji: '👑', price: 1299.00, discount: 15, discountAnimationEnabled: true, discountAnimationColor: '#9333ea', category: 'Acessórios' },
    { id: '7', name: 'Conjunto de Alianças', emoji: '💕', price: 3499.00, category: 'Anéis' },
    { id: '8', name: 'Pingente de Esmeralda', emoji: '💚', price: 2199.00, category: 'Colares' },
  ];

  const categories = [
    { id: '1', name: 'Anéis', emoji: '💍' },
    { id: '2', name: 'Colares', emoji: '📿' },
    { id: '3', name: 'Brincos', emoji: '💎' },
    { id: '4', name: 'Relógios', emoji: '⌚' },
    { id: '5', name: 'Pulseiras', emoji: '💍' },
    { id: '6', name: 'Acessórios', emoji: '👑' },
  ];

  const customLinks = [
    { id: '1', title: 'Certificado de Autenticidade', url: '#', icon: '📜' },
    { id: '2', title: 'Coleção Exclusiva', url: '#', icon: '💎' },
    { id: '3', title: 'Agendamento Presencial', url: '#', icon: '📅' },
  ];

  return (
    <DemoCatalog
      profile={{
        storeName: 'Joias Império',
        emoji: '💎',
        description: 'Joias exclusivas em ouro 18k e pedras preciosas',
        whatsapp: '5511966666666',
        instagram: '@joiasimperio',
        isVerified: true,
        theme: 'purple',
        layout: 'bottom',
        gridStyle: 'default',
        backgroundColor: '#1e1b4b',
        textBackgroundEnabled: true,
        textBackgroundColor: '#1e1b4b',
        textBackgroundOpacity: 85,
      }}
      products={products}
      categories={categories}
      customLinks={customLinks}
    />
  );
};

export default DemoJoalheria;
