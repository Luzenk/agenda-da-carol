"use client"

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Copy, MessageCircle, Check } from 'lucide-react';
import { generatePixPayload, generatePixQRCode } from '@/lib/pix';
import { generateWhatsAppLink } from '@/lib/whatsapp';
import { formatCurrency } from '@/lib/utils';

interface PixModalProps {
  open: boolean;
  onClose: () => void;
  defaultAmount?: number;
  defaultDescription?: string;
  clientPhone?: string;
  clientName?: string;
}

export default function PixModal({
  open,
  onClose,
  defaultAmount = 0,
  defaultDescription = '',
  clientPhone = '',
  clientName = '',
}: PixModalProps) {
  const [amount, setAmount] = useState(defaultAmount);
  const [description, setDescription] = useState(defaultDescription);
  const [pixPayload, setPixPayload] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Get PIX settings from env
      const pixKey = process.env.NEXT_PUBLIC_PIX_KEY || 'suachavepix@email.com';
      const merchantName = process.env.NEXT_PUBLIC_PIX_MERCHANT_NAME || 'Carol Trancista';
      const merchantCity = process.env.NEXT_PUBLIC_PIX_MERCHANT_CITY || 'Sao Paulo';

      // Generate PIX payload
      const payload = generatePixPayload({
        pixKey,
        merchantName,
        merchantCity,
        amount: amount > 0 ? amount : undefined,
        description,
        txId: `CAROL${Date.now()}`,
      });

      setPixPayload(payload);

      // Generate QR Code
      const qrCode = await generatePixQRCode(payload);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('Error generating PIX:', error);
      alert('Erro ao gerar código PIX. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPayload = () => {
    navigator.clipboard.writeText(pixPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    if (!clientPhone) return;

    const message = `Olá ${clientName || 'cliente'}! 👋\n\nSegue o código PIX para pagamento:\n\n💰 Valor: ${formatCurrency(amount)}\n📝 ${description}\n\n🔑 Código PIX (Copie e cole no seu banco):\n${pixPayload}\n\nObrigada! 💜`;

    const whatsappUrl = generateWhatsAppLink(clientPhone, message);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Código PIX</DialogTitle>
          <DialogDescription>
            Crie um código PIX para pagamento instantâneo
          </DialogDescription>
        </DialogHeader>

        {!pixPayload ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                placeholder="0,00"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ex: Box Braids - Agendamento #123"
                rows={3}
              />
            </div>

            <Button
              onClick={handleGenerate}
              disabled={loading || amount <= 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                'Gerar Código PIX'
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* QR Code */}
            {qrCodeUrl && (
              <div className="flex justify-center p-4 bg-white rounded-lg border">
                <img src={qrCodeUrl} alt="QR Code PIX" className="w-64 h-64" />
              </div>
            )}

            {/* Amount Display */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Valor</p>
              <p className="text-2xl font-bold text-purple-600">
                {formatCurrency(amount)}
              </p>
            </div>

            {/* PIX Payload */}
            <div>
              <Label>Código PIX (Copiar e Colar)</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={pixPayload}
                  readOnly
                  className="font-mono text-xs"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyPayload}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {clientPhone && (
                <Button
                  onClick={handleSendWhatsApp}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Enviar via WhatsApp
                </Button>
              )}
              <Button
                onClick={() => {
                  setPixPayload('');
                  setQrCodeUrl('');
                  setAmount(defaultAmount);
                  setDescription(defaultDescription);
                }}
                variant="outline"
                className="flex-1"
              >
                Novo PIX
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
