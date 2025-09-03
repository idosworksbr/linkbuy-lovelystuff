import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { AlertCircle, CheckCircle, Loader2, Bug } from "lucide-react";

export const StripeDebugPanel = () => {
  const { user } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<any>({});

  const testFunction = async (functionName: string, payload?: any) => {
    try {
      console.log(`[DEBUG] Testing function: ${functionName}`);
      setTesting(true);
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: payload
      });
      const endTime = Date.now();
      
      const result = {
        success: !error,
        data: data,
        error: error,
        duration: endTime - startTime,
        timestamp: new Date().toISOString()
      };
      
      console.log(`[DEBUG] Result for ${functionName}:`, result);
      
      setResults(prev => ({
        ...prev,
        [functionName]: result
      }));
      
      return result;
    } catch (err) {
      const errorResult = {
        success: false,
        error: err,
        timestamp: new Date().toISOString()
      };
      
      setResults(prev => ({
        ...prev,
        [functionName]: errorResult
      }));
      
      return errorResult;
    } finally {
      setTesting(false);
    }
  };

  const runAllTests = async () => {
    setTesting(true);
    setResults({});
    
    // Test get-stripe-prices
    await testFunction('get-stripe-prices');
    
    // Test check-subscription
    await testFunction('check-subscription');
    
    // Test create-checkout with Pro plan
    await testFunction('create-checkout', {
      priceId: 'price_1S2k58FhG2EqaMMaAifmR8iL'
    });
    
    setTesting(false);
  };

  const renderResult = (functionName: string, result: any) => {
    if (!result) return null;
    
    return (
      <div className="space-y-2 p-3 border rounded-lg">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{functionName}</h4>
          {result.success ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Success
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
          {result.duration && (
            <Badge variant="outline">
              {result.duration}ms
            </Badge>
          )}
        </div>
        
        {result.error && (
          <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
            <strong>Error:</strong> {JSON.stringify(result.error, null, 2)}
          </div>
        )}
        
        {result.data && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
            <strong>Data:</strong> {JSON.stringify(result.data, null, 2)}
          </div>
        )}
        
        <div className="text-xs text-gray-500">
          {result.timestamp}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <Card className="border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Stripe Debug Panel
          </CardTitle>
          <CardDescription>
            Você precisa estar logado para testar as funções Stripe
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Stripe Debug Panel
        </CardTitle>
        <CardDescription>
          Teste as funções Stripe para identificar problemas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={runAllTests} 
            disabled={testing}
            variant="outline"
          >
            {testing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Testando...
              </>
            ) : (
              'Testar Todas as Funções'
            )}
          </Button>
          
          <Button 
            onClick={() => testFunction('get-stripe-prices')} 
            disabled={testing}
            size="sm"
            variant="outline"
          >
            Preços
          </Button>
          
          <Button 
            onClick={() => testFunction('check-subscription')} 
            disabled={testing}
            size="sm"
            variant="outline"
          >
            Verificar
          </Button>
          
          <Button 
            onClick={() => testFunction('create-checkout', { priceId: 'price_1S2k58FhG2EqaMMaAifmR8iL' })} 
            disabled={testing}
            size="sm"
            variant="outline"
          >
            Checkout
          </Button>
        </div>
        
        <div className="space-y-3">
          {Object.entries(results).map(([functionName, result]) => (
            <div key={functionName}>
              {renderResult(functionName, result)}
            </div>
          ))}
        </div>
        
        {Object.keys(results).length === 0 && (
          <div className="text-center text-gray-500 py-8">
            Clique em "Testar Todas as Funções" para começar
          </div>
        )}
      </CardContent>
    </Card>
  );
};