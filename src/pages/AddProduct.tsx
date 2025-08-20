
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import ProductForm from "@/components/ProductForm";
import { useToast } from "@/hooks/use-toast";

const AddProduct = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    
    try {
      // Simular salvamento do produto
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Dados do produto:", data);
      
      toast({
        title: "Produto adicionado!",
        description: "Seu produto foi adicionado ao catálogo com sucesso.",
      });
      
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao adicionar o produto. Tente novamente.",
        variant: "destructive",
      });
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
