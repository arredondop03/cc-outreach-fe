import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, useForm, type Control } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { api } from '@/lib/api'
import { label } from '@/lib/company-ui'
import { Textarea } from '@/components/ui/textarea'
import type { Company } from '@/lib/types'

const statuses: Company['status'][] = ['new', 'ready_for_sequence', 'active', 'archived']
const roles = { fe: 'Frontend', fs: 'Full stack' }
const statusItems = Object.fromEntries(
  statuses.map((companyStatus) => [companyStatus, label(companyStatus)]),
)

const optionalUrl = z.union([z.literal(''), z.url('Enter a valid URL.')])

const companySchema = z.object({
  name: z.string().trim().min(1, 'Enter a name.'),
  domain: z.string().trim().min(1, 'Enter a domain.'),
  summary: z.string(),
  logoUrl: optionalUrl,
  jobPostUrl: optionalUrl,
  linkedinUrl: z.url('Enter a valid URL.'),
  role: z.enum(['fe', 'fs']),
  status: z.enum(statuses),
})

type CompanyValues = z.infer<typeof companySchema>

// Create mode when no company is passed, edit mode otherwise.
export default function CompanyFormSheet({ company }: { company?: Company }) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    control,
    handleSubmit,
    reset,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(company),
  })

  const logoUrl = watch('logoUrl')

  async function onSubmit(values: CompanyValues) {
    try {
      const body = {
        ...values,
        summary: values.summary.trim() || null,
        logoUrl: values.logoUrl || null,
        jobPostUrl: values.jobPostUrl || null,
      }
      if (company) await api.patch(`/companies/${company.id}`, body)
      else await api.post('/companies', body)
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      setIsOpen(false)
    } catch (error) {
      setError('root.server', {
        message: error instanceof Error ? error.message : 'Could not save. Please try again.',
      })
    }
  }

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(nextOpen) => {
        // Discard unsaved edits whenever the drawer is reopened.
        if (nextOpen) reset(toFormValues(company))
        setIsOpen(nextOpen)
      }}
    >
      {company ? (
        <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Edit company" />}>
          <Pencil />
        </SheetTrigger>
      ) : (
        <SheetTrigger render={<Button />}>
          <Plus /> New company
        </SheetTrigger>
      )}
      <SheetContent side="right" className="overflow-y-auto data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>{company ? 'Edit company' : 'New company'}</SheetTitle>
          <SheetDescription>
            {company
              ? `Changes are saved to ${company.name}.`
              : 'Add a company to your outreach list.'}
          </SheetDescription>
        </SheetHeader>
        <form noValidate onSubmit={handleSubmit(onSubmit)} className="px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={!!errors.name}>
              <FieldLabel htmlFor="name">Name</FieldLabel>
              <Input id="name" aria-invalid={!!errors.name} {...register('name')} />
              <FieldError errors={[errors.name]} />
            </Field>
            <Field data-invalid={!!errors.domain}>
              <FieldLabel htmlFor="domain">Domain</FieldLabel>
              <Input id="domain" aria-invalid={!!errors.domain} {...register('domain')} />
              <FieldError errors={[errors.domain]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="summary">Summary</FieldLabel>
              <Textarea id="summary" rows={4} {...register('summary')} />
            </Field>
            <Field data-invalid={!!errors.logoUrl}>
              <FieldLabel htmlFor="logoUrl">Logo URL</FieldLabel>
              <Input id="logoUrl" aria-invalid={!!errors.logoUrl} {...register('logoUrl')} />
              <FieldError errors={[errors.logoUrl]} />
              {logoUrl && z.url().safeParse(logoUrl).success && (
                <img
                  key={logoUrl}
                  src={logoUrl}
                  alt="Logo preview"
                  className="size-16 rounded object-contain"
                />
              )}
            </Field>
            <Field data-invalid={!!errors.jobPostUrl}>
              <FieldLabel htmlFor="jobPostUrl">Job post URL</FieldLabel>
              <Input
                id="jobPostUrl"
                aria-invalid={!!errors.jobPostUrl}
                {...register('jobPostUrl')}
              />
              <FieldError errors={[errors.jobPostUrl]} />
            </Field>
            <Field data-invalid={!!errors.linkedinUrl}>
              <FieldLabel htmlFor="linkedinUrl">LinkedIn URL</FieldLabel>
              <Input
                id="linkedinUrl"
                aria-invalid={!!errors.linkedinUrl}
                {...register('linkedinUrl')}
              />
              <FieldError errors={[errors.linkedinUrl]} />
            </Field>
            <Field>
              <FieldLabel htmlFor="role">Role</FieldLabel>
              <ChoiceSelect id="role" name="role" control={control} items={roles} />
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <ChoiceSelect id="status" name="status" control={control} items={statusItems} />
            </Field>
            <FieldError errors={[errors.root?.server]} />
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save'}
            </Button>
          </FieldGroup>
        </form>
      </SheetContent>
    </Sheet>
  )
}

function toFormValues(company?: Company): CompanyValues {
  if (!company) {
    return {
      name: '',
      domain: '',
      summary: '',
      logoUrl: '',
      jobPostUrl: '',
      linkedinUrl: '',
      role: 'fe',
      status: 'new',
    }
  }
  return {
    name: company.name,
    domain: company.domain,
    summary: company.summary ?? '',
    logoUrl: company.logoUrl ?? '',
    jobPostUrl: company.jobPostUrl ?? '',
    linkedinUrl: company.linkedinUrl,
    role: company.role,
    status: company.status,
  }
}

function ChoiceSelect({
  id,
  name,
  control,
  items,
}: {
  id: string
  name: 'role' | 'status'
  control: Control<CompanyValues>
  items: Record<string, string>
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select items={items} value={field.value} onValueChange={field.onChange}>
          <SelectTrigger id={id} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(items).map(([value, itemLabel]) => (
              <SelectItem key={value} value={value}>
                {itemLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
  )
}
