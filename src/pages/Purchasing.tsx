import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function Purchasing() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Purchasing</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="col-span-full md:col-span-2">
          <CardHeader>
            <CardTitle>Purchasing Module</CardTitle>
            <CardDescription>Database schema is configured.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              The tables <strong>purchasing_components</strong> and{' '}
              <strong>purchasing_expedites</strong> have been successfully created in the Supabase
              database. The user interface for this module will be implemented in the next steps.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
