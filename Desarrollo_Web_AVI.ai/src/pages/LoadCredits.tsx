import { useState, useEffect } from 'react';
import { Zap, History, Loader2, ExternalLink, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'bonus' | 'referral';
  description: string | null;
  created_at: string;
}

export const LoadCredits = () => {
  const { user, profile } = useAuth();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [customAmount, setCustomAmount] = useState('');

  const totalCredits = profile?.credits ?? 0;

  const quickAmounts = [
    { amount: 5000, credits: 5000, label: '$5.000' },
    { amount: 10000, credits: 10000, label: '$10.000', popular: true },
    { amount: 20000, credits: 20000, label: '$20.000' },
    { amount: 50000, credits: 50000, label: '$50.000' }
  ];

  // Check payment status from URL params (redirect from Mercado Pago)
  useEffect(() => {
    const status = searchParams.get('status');
    if (status === 'success') {
      toast.success('Pago procesado correctamente. Los creditos se acreditaran en breve.');
    } else if (status === 'failure') {
      toast.error('El pago no se pudo procesar. Intenta de nuevo.');
    } else if (status === 'pending') {
      toast.info('Tu pago esta pendiente de confirmacion. Te notificaremos cuando se acredite.');
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;
    loadTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('credit_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      if (data) setTransactions(data);
    } catch (error) {
      logger.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async (amount: number, credits: number) => {
    if (!user) return;
    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('create-payment', {
        body: { amount, credits, user_id: user.id, description: `${credits.toLocaleString()} creditos AVI AI` },
      });

      if (error) throw new Error(error.message || 'Error al crear el pago');

      // Redirect to Mercado Pago checkout
      const checkoutUrl = import.meta.env.VITE_ENVIRONMENT === 'production'
        ? data?.init_point
        : data?.sandbox_init_point || data?.init_point;

      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No se recibio URL de pago');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al procesar el pago';
      logger.error('Payment error:', error);
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCustomRecharge = () => {
    const amount = parseInt(customAmount);
    if (amount >= 1000) {
      handleRecharge(amount, amount); // 1 CLP = 1 credit
      setCustomAmount('');
    } else {
      toast.error('El monto minimo es $1.000 CLP');
    }
  };

  const getStatusBadge = (tx: CreditTransaction) => {
    if (tx.type === 'purchase' && tx.amount > 0) {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Completado</Badge>;
    }
    if (tx.type === 'usage') {
      return <Badge className="bg-gray-100 text-gray-700 border-gray-200">Uso</Badge>;
    }
    if (tx.type === 'bonus') {
      return <Badge className="bg-blue-100 text-blue-700 border-blue-200">Bonus</Badge>;
    }
    if (tx.type === 'referral') {
      return <Badge className="bg-purple-100 text-purple-700 border-purple-200">Referido</Badge>;
    }
    return <Badge className="bg-green-100 text-green-700 border-green-200">Completado</Badge>;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'purchase': return 'Compra';
      case 'usage': return 'Uso';
      case 'bonus': return 'Bonus';
      case 'referral': return 'Referido';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Cargar Creditos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Recarga creditos para continuar usando AVI AI
        </p>
      </div>

      {/* Current Balance */}
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 mb-2">Saldo Actual</p>
            <p className="text-5xl font-bold mb-1">{totalCredits.toLocaleString()}</p>
            <p className="text-blue-100">creditos disponibles</p>
          </div>
          <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Zap className="w-10 h-10" />
          </div>
        </div>
      </div>

      {/* Quick Recharge */}
      <div className="neon-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Recarga Rapida
        </h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {quickAmounts.map((option) => (
            <button
              key={option.amount}
              onClick={() => handleRecharge(option.amount, option.credits)}
              disabled={processing}
              className="relative p-6 border-2 border-gray-200 dark:border-gray-700 rounded-xl hover:border-blue-600 dark:hover:border-blue-500 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {option.popular && (
                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
                    Popular
                  </Badge>
                </div>
              )}
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                  {option.label}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {option.credits.toLocaleString()} creditos
                </p>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Amount */}
        <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
          <Label htmlFor="custom-amount" className="text-sm font-medium mb-2 block">
            Monto Personalizado (minimo $1.000)
          </Label>
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <Input
                id="custom-amount"
                type="number"
                placeholder="Ingresa un monto"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="pl-7"
                min="1000"
                disabled={processing}
              />
            </div>
            <Button
              onClick={handleCustomRecharge}
              disabled={!customAmount || parseInt(customAmount) < 1000 || processing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {processing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              {processing ? 'Procesando...' : 'Recargar'}
            </Button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900 dark:text-blue-300">
            <p><strong>1 credito = $1 CLP.</strong> Seras redirigido a Mercado Pago para completar el pago de forma segura.</p>
            <p className="mt-1 text-blue-700 dark:text-blue-400">Los creditos se acreditan automaticamente al confirmar el pago.</p>
            <p className="mt-2 text-blue-700 dark:text-blue-400 text-xs border-t border-blue-200 dark:border-blue-700 pt-2">
              💬 WhatsApp IA: <strong>10 creditos/mensaje</strong> &nbsp;|&nbsp;
              ✉️ Email IA: <strong>20 creditos/correo</strong> &nbsp;|&nbsp;
              📞 Llamada IA: <strong>200 creditos/minuto</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="neon-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Historial de Transacciones
        </h2>

        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <History className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No hay transacciones todavia.</p>
            <p className="text-sm mt-1">Tus compras y uso de creditos apareceran aqui.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripcion</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Creditos</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-medium text-sm">
                    {new Date(tx.created_at).toLocaleDateString('es-CL', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 dark:text-gray-400 max-w-xs truncate">
                    {tx.description || getTypeLabel(tx.type)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {getTypeLabel(tx.type)}
                  </TableCell>
                  <TableCell>
                    <span className={`font-semibold ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(tx)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
};
