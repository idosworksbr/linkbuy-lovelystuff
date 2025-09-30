import { DemoCatalog } from '@/components/demos/DemoCatalog';
import { DemoProductData } from '@/components/demos/DemoProduct';

const DemoCosmeticos = () => {
  const products: DemoProductData[] = [
    { id: '1', name: 'Batom Matte Vermelho', emoji: '💄', price: 45.90, category: 'Maquiagem' },
    { id: '2', name: 'Base Líquida HD', emoji: '💅', price: 89.00, discount: 20, discountAnimationEnabled: true, discountAnimationColor: '#ff69b4', category: 'Maquiagem' },
    { id: '3', name: 'Sérum Vitamina C', emoji: '🧴', price: 125.00, category: 'Skincare' },
    { id: '4', name: 'Paleta de Sombras', emoji: '✨', price: 98.00, category: 'Maquiagem' },
    { id: '5', name: 'Perfume Floral 100ml', emoji: '🌸', price: 189.00, category: 'Perfumaria' },
    { id: '6', name: 'Máscara de Cílios', emoji: '👁️', price: 52.00, category: 'Maquiagem' },
    { id: '7', name: 'Hidratante Facial', emoji: '💆', price: 68.00, category: 'Skincare' },
    { id: '8', name: 'Esmalte Gel', emoji: '💅', price: 28.00, category: 'Unhas' },
    { id: '9', name: 'Shampoo Profissional', emoji: '🧴', price: 75.00, discount: 15, discountAnimationEnabled: true, discountAnimationColor: '#ff69b4', category: 'Cabelos' },
    { id: '10', name: 'Blush Compacto', emoji: '🎨', price: 42.00, category: 'Maquiagem' },
    { id: '11', name: 'Óleo de Argan', emoji: '✨', price: 95.00, category: 'Cabelos' },
    { id: '12', name: 'Kit Pincéis Pro', emoji: '🖌️', price: 149.00, category: 'Acessórios' },
    { id: '13', name: 'Protetor Solar FPS 60', emoji: '☀️', price: 78.00, category: 'Skincare' },
    { id: '14', name: 'Gloss Labial', emoji: '💋', price: 35.00, category: 'Maquiagem' },
    { id: '15', name: 'Creme Antirrugas', emoji: '🧴', price: 155.00, category: 'Skincare' },
  ];

  const categories = [
    { id: '1', name: 'Maquiagem', emoji: '💄' },
    { id: '2', name: 'Skincare', emoji: '🧴' },
    { id: '3', name: 'Perfumaria', emoji: '🌸' },
    { id: '4', name: 'Cabelos', emoji: '💇' },
    { id: '5', name: 'Unhas', emoji: '💅' },
    { id: '6', name: 'Acessórios', emoji: '🖌️' },
  ];

  const customLinks = [
    { id: '1', title: 'Tutorial de Maquiagem', url: '#', icon: '🎥' },
    { id: '2', title: 'Consultoria Online', url: '#', icon: '💬' },
    { id: '3', title: 'Clube de Assinatura', url: '#', icon: '🎁' },
  ];

  return (
    <DemoCatalog
      profile={{
        storeName: 'BeautyLux Cosméticos',
        emoji: '✨',
        description: 'Beleza e cuidado com produtos premium',
        whatsapp: '5511977777777',
        instagram: '@beautylux',
        isVerified: false,
        theme: 'rose',
        layout: 'overlay',
        gridStyle: 'instagram',
        backgroundType: 'gradient',
        backgroundColor: 'linear-gradient(135deg, #fce7f3 0%, #fff1f2 100%)',
        textBackgroundEnabled: true,
        textBackgroundColor: '#ffffff',
        textBackgroundOpacity: 90,
      }}
      products={products}
      categories={categories}
      customLinks={customLinks}
    />
  );
};

export default DemoCosmeticos;
