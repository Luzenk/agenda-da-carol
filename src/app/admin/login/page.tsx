"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    // Verificar se localStorage está acessível
    try {
      const test = localStorage.getItem('test');
      localStorage.setItem('test', 'working');
      localStorage.removeItem('test');
      setDebugInfo('✓ localStorage acessível');
    } catch (e: any) {
      setDebugInfo('✗ localStorage bloqueado: ' + e.message);
      console.error('localStorage error:', e);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('[LOGIN] Iniciando login...');

    try {
      console.log('[LOGIN] Fazendo fetch para /api/auth/login');
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      console.log('[LOGIN] Response status:', response.status);
      
      const data = await response.json();
      console.log('[LOGIN] Response data:', data);

      if (!response.ok) {
        console.error('[LOGIN] Login falhou:', data.error);
        throw new Error(data.error || 'Login failed');
      }

      // Verificar se recebeu o token
      if (!data.token) {
        console.error('[LOGIN] Token não recebido!');
        throw new Error('Token não recebido do servidor');
      }

      console.log('[LOGIN] Token recebido:', data.token.substring(0, 20) + '...');

      // Tentar salvar no localStorage
      try {
        localStorage.setItem('admin_token', data.token);
        console.log('[LOGIN] Token salvo no localStorage');
        
        // Verificar se foi salvo
        const saved = localStorage.getItem('admin_token');
        if (!saved) {
          throw new Error('Token não foi salvo no localStorage');
        }
        console.log('[LOGIN] Token verificado no localStorage');
      } catch (storageError: any) {
        console.error('[LOGIN] Erro ao salvar no localStorage:', storageError);
        setDebugInfo('✗ Erro localStorage: ' + storageError.message);
        throw new Error('Não foi possível salvar o token. Verifique se cookies de terceiros estão habilitados.');
      }

      console.log('[LOGIN] Redirecionando para /admin...');
      
      // Adicionar delay antes do redirect para garantir que localStorage foi salvo
      await new Promise(resolve => setTimeout(resolve, 100));
      
      router.push('/admin');
      router.refresh();
      
      console.log('[LOGIN] Login completo!');
    } catch (err: any) {
      console.error('[LOGIN] Erro capturado:', err);
      setError(err.message || 'Senha incorreta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="w-8 h-8 text-purple-600" />
          </div>
          <CardTitle className="text-2xl">Área Administrativa</CardTitle>
          <CardDescription>
            Agenda da Carol - Acesso restrito
          </CardDescription>
          {debugInfo && (
            <p className="text-xs text-muted-foreground mt-2">{debugInfo}</p>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Digite a senha de administrador"
                required
                autoFocus
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Senha padrão: carol123</p>
            <p className="text-xs mt-2">
              Em caso de erro, abra em nova aba ou habilite cookies de terceiros
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}