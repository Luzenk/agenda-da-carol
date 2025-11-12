"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Package } from 'lucide-react';

export default function ServicosPage() {
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Serviços</h1>
        <p className="text-gray-600">Gerencie seus serviços, variantes e materiais</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Gerenciamento de Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">Gerenciamento de serviços em desenvolvimento</p>
            <p className="text-sm mt-2">
              Em breve você poderá adicionar, editar e remover serviços, variantes e materiais
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
