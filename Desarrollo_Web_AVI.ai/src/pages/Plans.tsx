import { useState, useEffect } from 'react';
import { Check, Zap, Mail, Phone, MessageCircle, CreditCard, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { logger } from '@/lib/logger';
import { toast } from 'sonner';

interface CreditTransaction {
  id: string;
  amount: number;
  type: 'purchase' | 'usage' | 'bonus' | 'referral';
  description: string | null;
  created_at: string;
}

export const Plans = () => {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);

  // Credits from profile (real data)
  const totalCredits = profile?.credits ?? 0;
  const plan = profile?.plan ?? 'free';

  // Calculate used credits from transactions
  const [usedCredits, setUsedCredits] = useState(0);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Load credit transactions
        const { data: txData, error: txError } = await supabase
          .from('credit_transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (txError) throw txError;

        if (txData) {
          setTransactions(txData);

          // Calculate used credits (negative amounts = usage)
          const used = txData
            .filter(tx => tx.type === 'usage')
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
          setUsedCredits(used);
        }
      } catch (error) {
        logger.error('Error loading plan data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const ufValue = 39721; // 1 UF ~ $39,721 CLP

  const serviceCosts = [
    {
      service: 'Mensajes WhatsApp',
      icon: MessageCircle,
      cost: 10,
      unit: 'por mensaje',
      color: 'text-green-600'
    },
    {
      service: 'Llamadas telefonicas',
      icon: Phone,
      cost: 200,
      unit: 'por minuto',
      color: 'text-blue-600'
    },
    {
      service: 'Correos electronicos',
      icon: Mail,
      cost: 20,
      unit: 'por correo',
      color: 'text-purple-600'
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Plan Mensual AVI AI',
      price: '$19.990',
      priceClp: 19990,
      period: 'mensual',
      credits: 2500,
      description: 'Acceso completo a la plataforma. Paga solo por lo que usas con creditos.',
      features: [
        '2,500 creditos de bienvenida incluidos',
        'Acceso a todas las funcionalidades',
        'Gestion IA de WhatsApp, Email y Llamadas',
        'Integracion con portales inmobiliarios',
        'Analytics y Dashboard completo',
        'Soporte por email prioritario'
      ],
      highlighted: true,
      ctaText: plan === 'free' ? 'Plan Actual' : 'Suscribirse',
      badge: 'Recomendado'
    },
    {
      id: 'credits',
      name: 'Recarga de Creditos',
      price: 'Variable',
      priceClp: 0,
      period: 'Pago por uso',
      credits: 0,
      description: 'Recarga cuando quieras. Sin compromisos adicionales.',
      features: [
        'Compra creditos cuando los necesites',
        'Sin compromisos adicionales',
        'Recarga automatica disponible',
        'Los creditos no expiran',
        'Descuentos por volumen'
      ],
      highlighted: false,
      ctaText: 'Cargar Creditos',
      badge: null
    }
  ];

  const creditsPercentage = totalCredits > 0
    ? Math.min((usedCredits / (usedCredits + totalCredits)) * 100, 100)
    : 0;

  const getPlanLabel = (planType: string) => {
    switch (planType) {
      case 'free': return 'Plan Inicial Gratuito';
      case 'starter': return 'Plan Starter';
      case 'professional': return 'Plan Profesional';
      case 'enterprise': return 'Plan Enterprise';
      default: return 'Plan Gratuito';
    }
  };

  const handleLoadCredits = () => {
    toast.info('La compra de creditos estara disponible pronto. Contactanos en contacto@aviai.cl');
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto px-5 lg:px-8 py-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Planes y Creditos
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
          Gestiona tu suscripcion y creditos de uso
        </p>
      </div>

      {/* Top row: Plan card (2/3) + Service costs (1/3) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch">

        {/* Current Plan Status — 2/3 */}
        <div className="lg:col-span-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg p-7 text-white flex flex-col justify-between">
          <div className="flex items-start justify-between mb-5">
            <div>
              <Badge className="bg-white/20 text-white border-0 mb-3 text-xs">
                Plan Actual
              </Badge>
              <h2 className="text-xl font-bold mb-1">{getPlanLabel(plan)}</h2>
              <p className="text-blue-100 text-sm">{profile?.email}</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold leading-none">{totalCredits.toLocaleString()}</div>
              <div className="text-blue-100 text-xs mt-1">creditos disponibles</div>
            </div>
          </div>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Creditos usados</span>
              <span className="font-semibold">{usedCredits.toLocaleString()} usados</span>
            </div>
            <Progress value={creditsPercentage} className="h-2.5 bg-white/20" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-blue-100">Creditos restantes</span>
              <span className="font-bold text-lg">{totalCredits.toLocaleString()}</span>
            </div>
          </div>

          {totalCredits < 500 && (
            <div className="mt-5 p-3.5 bg-white/10 rounded-lg backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Zap className="w-4 h-4 text-yellow-300 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm mb-1">Creditos bajos!</p>
                  <p className="text-blue-100 text-xs">
                    Te quedan solo {totalCredits.toLocaleString()} creditos. Considera recargar para no interrumpir tu servicio.
                  </p>
                  <Button onClick={handleLoadCredits} className="mt-3 bg-white text-blue-600 hover:bg-blue-50" size="sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Cargar Creditos
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Service Costs — 1/3 */}
        <div className="neon-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">
              Costo de Servicios
            </h3>
            <div className="space-y-3">
              {serviceCosts.map((service) => {
                const Icon = service.icon;
                return (
                  <div
                    key={service.service}
                    className="flex items-center gap-3 py-3 border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-900 flex-shrink-0">
                      <Icon className={`w-4 h-4 ${service.color}`} />
                    </div>
                    <div>
                      <p className="text-[13px] font-medium text-gray-900 dark:text-white leading-tight">
                        {service.service}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="font-bold text-gray-700 dark:text-gray-300">
                          {service.cost} creditos
                        </span>{' '}
                        {service.unit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-[11px] text-blue-800 dark:text-blue-300 leading-relaxed">
              <strong>Ejemplo:</strong> Con 1,000 creditos puedes enviar 100 mensajes de WhatsApp, 50 correos o gestionar 5 min de llamadas con IA.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div className="neon-card bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">
            Historial de Transacciones
          </h3>
          <div className="space-y-2">
            {transactions.slice(0, 10).map((tx) => (
              <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-100 dark:border-gray-700 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold ${
                    tx.amount > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                  }`}>
                    {tx.amount > 0 ? '+' : '-'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {tx.description || tx.type}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(tx.created_at).toLocaleDateString('es-CL', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                <span className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} creditos
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Plans */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Planes Disponibles
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {plans.map((planItem) => (
            <div
              key={planItem.id}
              className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-sm border-2 overflow-hidden ${
                planItem.highlighted
                  ? 'border-blue-600 dark:border-blue-500'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {planItem.badge && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                  {planItem.badge}
                </div>
              )}
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                  {planItem.name}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
                  {planItem.description}
                </p>
                <div className="mb-5">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-gray-900 dark:text-white">
                      {planItem.price}
                    </span>
                    {planItem.priceClp > 0 && (
                      <span className="text-gray-400 text-sm">
                        ~ ${planItem.priceClp.toLocaleString()} CLP
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-xs mt-1">{planItem.period}</p>
                  {planItem.credits > 0 && (
                    <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <Zap className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                      <span className="text-sm font-semibold text-blue-900 dark:text-blue-300">
                        {planItem.credits.toLocaleString()} creditos
                      </span>
                    </div>
                  )}
                </div>
                <ul className="space-y-2.5 mb-6">
                  {planItem.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5 text-green-600 dark:text-green-400" />
                      </div>
                      <span className="text-gray-700 dark:text-gray-300 text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${
                    planItem.highlighted
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                      : ''
                  }`}
                  variant={planItem.highlighted ? 'default' : 'outline'}
                  disabled={planItem.id === 'free' && plan === 'free'}
                  onClick={planItem.id === 'credits' ? handleLoadCredits : undefined}
                >
                  {planItem.ctaText}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6">
        <h3 className="text-[15px] font-semibold text-gray-900 dark:text-white mb-4">
          Preguntas Frecuentes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              Que pasa cuando se acaban mis creditos?
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Los servicios se pausaran hasta que recargues creditos. Puedes activar la recarga automatica para evitar interrupciones.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              Los creditos expiran?
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Los creditos comprados adicionales no expiran. Solo el plan inicial gratuito tiene una duracion de 30 dias.
            </p>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
              Puedo cambiar de plan?
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
              Puedes cambiar al sistema de creditos en cualquier momento. Los creditos no utilizados del plan gratuito se mantendran en tu cuenta.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
