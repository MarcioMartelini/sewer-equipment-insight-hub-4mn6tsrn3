import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useNavigate } from 'react-router-dom'
import { Factory } from 'lucide-react'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [department, setDepartment] = useState('Sales')
  const [isLoading, setIsLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email, password)
        if (error) throw error
        navigate('/')
      } else {
        const { error } = await signUp(email, password, fullName, department)
        if (error) throw error
        toast({
          title: 'Account created',
          description: 'Your account was created successfully. Welcome!',
        })
        navigate('/')
      }
    } catch (error: any) {
      toast({
        title: 'Authentication error',
        description: error.message || 'An unexpected error occurred.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-0 ring-1 ring-slate-200">
        <CardHeader className="space-y-1 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4">
            <Factory className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
            {isLogin ? 'System Login' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {isLogin
              ? 'Enter your credentials to access the WO Registry'
              : 'Fill in the details to create your account'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="Your name"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Department</Label>
                  <select
                    id="department"
                    className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    required
                  >
                    <option value="Sales">Sales</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Purchasing">Purchasing</option>
                    <option value="Production">Production</option>
                    <option value="Quality">Quality</option>
                    <option value="Delivery">Delivery</option>
                    <option value="Warranty">Warranty</option>
                    <option value="High Management">High Management</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
            <div className="text-sm text-center text-slate-500">
              {isLogin ? "Don't have an account? " : 'Already have an account? '}
              <button
                type="button"
                className="text-indigo-600 hover:underline font-medium"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
