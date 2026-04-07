import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plug, Zap } from 'lucide-react'
import { toast } from 'sonner'

const integrations = [
  {
    name: 'Gemini AI',
    desc: 'Integração para análises preditivas',
    status: 'connected',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    name: 'OpenAI',
    desc: 'Processamento de linguagem natural',
    status: 'disconnected',
    color: 'text-slate-600 bg-slate-100 border-slate-200',
  },
  {
    name: 'Stripe',
    desc: 'Gateway de pagamentos e faturamento',
    status: 'connected',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
  {
    name: 'Resend',
    desc: 'Envio de emails transacionais',
    status: 'connected',
    color: 'text-green-600 bg-green-50 border-green-200',
  },
]

export function IntegrationsTab() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">
          Integrações de API
        </h3>
        <Button variant="outline" onClick={() => toast.info('Nova integração (simulação)')}>
          <Plug className="w-4 h-4 mr-2" /> Nova Integração
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {integrations.map((api) => (
          <Card key={api.name} className="shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  {api.name}
                </CardTitle>
                <Badge variant="outline" className={api.color}>
                  {api.status === 'connected' ? 'Conectado' : 'Desconectado'}
                </Badge>
              </div>
              <CardDescription className="mt-1">{api.desc}</CardDescription>
            </CardHeader>
            <CardFooter className="pt-0">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => toast.info(`Configurar ${api.name}`)}
              >
                Configurar
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
