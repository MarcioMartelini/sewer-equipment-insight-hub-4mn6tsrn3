import { useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2 } from 'lucide-react'
import type { Salesperson } from '@/services/salespersons'

const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
]

const CA_PROVINCES = [
  'Alberta',
  'British Columbia',
  'Manitoba',
  'New Brunswick',
  'Newfoundland and Labrador',
  'Nova Scotia',
  'Northwest Territories',
  'Nunavut',
  'Ontario',
  'Prince Edward Island',
  'Quebec',
  'Saskatchewan',
  'Yukon',
]

const REGIONS = [
  { label: 'United States', options: US_STATES },
  { label: 'Canada', options: CA_PROVINCES },
]

const schema = z.object({
  salesperson_id: z.string().optional(),
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  division: z.enum(['Municipal', 'Industrial', 'Plumbing']).optional().or(z.literal('')),
  region: z.array(z.string()).default([]),
  commission_rate: z.coerce.number().min(0, 'Must be positive').max(100, 'Max 100%'),
  status: z.enum(['Active', 'Inactive']),
})

type FormValues = z.infer<typeof schema>

interface Props {
  isOpen: boolean
  onClose: () => void
  salesperson: Salesperson | null
  onSave: (data: Partial<Salesperson>) => Promise<void>
  isSaving: boolean
}

export default function SalespersonFormModal({
  isOpen,
  onClose,
  salesperson,
  onSave,
  isSaving,
}: Props) {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      salesperson_id: '',
      name: '',
      email: '',
      phone: '',
      division: '',
      region: [],
      commission_rate: 0,
      status: 'Active',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (salesperson) {
        form.reset({
          salesperson_id: salesperson.salesperson_id || '',
          name: salesperson.name || '',
          email: salesperson.email || '',
          phone: salesperson.phone || '',
          division: (salesperson.division as any) || '',
          region: salesperson.region ? salesperson.region.split(', ').filter(Boolean) : [],
          commission_rate: Number(salesperson.commission_rate || 0),
          status: (salesperson.status as 'Active' | 'Inactive') || 'Active',
        })
      } else {
        form.reset({
          salesperson_id: '',
          name: '',
          email: '',
          phone: '',
          division: '',
          region: [],
          commission_rate: 0,
          status: 'Active',
        })
      }
    }
  }, [isOpen, salesperson, form])

  const handleFormSubmit = async (values: FormValues) => {
    const dataToSave: Partial<Salesperson> = {
      name: values.name,
      email: values.email || null,
      phone: values.phone || null,
      division: values.division || null,
      region: values.region.length > 0 ? values.region.join(', ') : null,
      commission_rate: values.commission_rate,
      status: values.status,
    }
    await onSave(dataToSave)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{salesperson ? 'Edit Salesperson' : 'New Salesperson'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="salesperson_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salesperson ID</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled
                        placeholder={salesperson ? '' : 'Auto-generated'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="division"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Division</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select division" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Municipal">Municipal</SelectItem>
                        <SelectItem value="Industrial">Industrial</SelectItem>
                        <SelectItem value="Plumbing">Plumbing</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="commission_rate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commission Rate (%)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="region"
                render={() => (
                  <FormItem className="col-span-1 md:col-span-2 mt-2">
                    <FormLabel>Region</FormLabel>
                    <ScrollArea className="h-56 rounded-md border border-input p-4 bg-background">
                      <div className="space-y-6">
                        {REGIONS.map((group) => (
                          <div key={group.label}>
                            <h4 className="font-medium text-sm text-muted-foreground mb-3">
                              {group.label}
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {group.options.map((option) => (
                                <FormField
                                  key={option}
                                  control={form.control}
                                  name="region"
                                  render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-2 space-y-0">
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(option)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...(field.value || []), option])
                                              : field.onChange(
                                                  field.value?.filter((val) => val !== option),
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal text-xs cursor-pointer leading-tight pt-0.5">
                                        {option}
                                      </FormLabel>
                                    </FormItem>
                                  )}
                                />
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>
                Cancel
              </Button>
              <Button className="bg-[#0030fd]" type="submit" disabled={isSaving}>
                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {salesperson ? 'Save Changes' : 'Create Salesperson'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
