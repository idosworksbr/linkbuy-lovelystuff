import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ProductFormAdvanced from "@/components/ProductFormAdvanced";
import { useProducts } from "@/hooks/useProducts";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createProduct } = useProducts();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      const productData = {
        name: data.name,
        price: parseFloat(data.price),
        description: data.description || null,
        images: data.images || [],
        category_id: data.category_id || null,
        code: data.code || null,
        weight: data.weight || null,
        cost: data.cost ? parseFloat(data.cost) : null,
        discount: data.discount ? parseFloat(data.discount) : null,
        status: data.status || 'active',
        discount_animation_enabled: data.discount_animation_enabled || false,
        discount_animation_color: data.discount_animation_color || '#ff0000',
      };

      await createProduct(productData);
      navigate("/dashboard");
    } catch (error) {
      console.error('Erro ao criar produto:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/dashboard");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6">
        <ProductFormAdvanced
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;