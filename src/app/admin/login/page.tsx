"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Lock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('');

  useEffect(() => {
    console.log('[LOGIN PAGE] Montado');
    // Verificar se já está logado
    const token = localStorage.getItem('admin_token');
    if (token) {
      console.log('[LOGIN PAGE] Token encontrado, redirecionando...');
      window.location.href = '/admin';
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LOGIN] Iniciando processo de login...');
    
    setError('');
    setLoading(true);
    setStep('🔄 Verificando senha...');

    try {
      console.log('[LOGIN] Fazendo requisição para /api/auth/login');
      
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
        console.error('[LOGIN] Erro na resposta:', response.status, data);
        setStep('');
        if (response.status === 401) {
          setError('❌ Senha incorreta');
          toast.error('Senha incorreta');
        } else {
          setError(`❌ Erro: ${data.error || 'Erro no servidor'}`);
          toast.error('Erro ao fazer login');
        }
        setLoading(false);
        return;
      }

      if (!data.token) {
        console.error('[LOGIN] Token não recebido');
        setError('❌ Token não recebido');
        toast.error('Erro: token ausente');
        setLoading(false);
        return;
      }

      console.log('[LOGIN] ✓ Token recebido');
      setStep('✅ Login OK! Salvando sessão...');
      
      // Salvar token
      try {
        localStorage.setItem('admin_token', data.token);
        const saved = localStorage.getItem('admin_token');
        
        if (!saved) {
          throw new Error('localStorage bloqueado');
        }
        
        console.log('[LOGIN] ✓ Token salvo no localStorage');
        setStep('✅ Sessão salva! Redirecionando...');
        toast.success('Login realizado!');
        
        // Aguardar um pouco para o usuário ver a mensagem
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Redirecionar usando window.location (mais confiável em iframes)
        console.log('[LOGIN] Redirecionando para /admin');
        window.location.href = '/admin';
        
      } catch (storageError) {
        console.error('[LOGIN] Erro no localStorage:', storageError);
        setError('❌ Cookies bloqueados. Abra em nova aba.');
        toast.error('localStorage bloqueado. Abra em nova aba.');
        setLoading(false);
      }
      
    } catch (err: any) {
      console.error('[LOGIN] Erro:', err);
      setStep('');
      setError(`❌ Erro: ${err.message || 'Falha na conexão'}`);
      toast.error('Erro ao conectar');
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
                placeholder="Digite a senha"
                required
                autoFocus
                disabled={loading}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {step && !error && (
              <Alert>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-600">{step}</AlertDescription>
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
            <p>Senha padrão: <code className="bg-muted px-2 py-1 rounded">carol123</code></p>
            <p className="text-xs mt-2">Abra o Console (F12) para ver os logs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}