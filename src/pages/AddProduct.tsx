
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ProductForm from "@/components/ProductForm";
import { useProducts } from "@/hooks/useProducts";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { createProduct } = useProducts();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Converter o preço de string para number
      const productData = {
        name: data.name,
        price: parseFloat(data.price),
        description: data.description,
        images: data.images || []
      };

      await createProduct(productData);
      navigate("/dashboard");
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      // O hook useProducts já mostra o toast de erro
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
        <ProductForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      </div>
    </DashboardLayout>
  );
};

export default AddProduct;
