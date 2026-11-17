import { zodResolver } from '@hookform/resolvers/zod'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
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
import type { Company } from '@/lib/types'

const statuses: Company['status'][] = ['new', 'ready_for_sequence', 'active', 'archived']
const nativeFieldClasses =
  'border-input bg-background w-full rounded-lg border px-2.5 py-1.5 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50'

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

export default function EditCompanySheet({ company }: { company: Company }) {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<CompanyValues>({
    resolver: zodResolver(companySchema),
    defaultValues: toFormValues(company),
  })

  async function onSubmit(values: CompanyValues) {
    try {
      await api.patch(`/companies/${company.id}`, {
        ...values,
        summary: values.summary.trim() || null,
        logoUrl: values.logoUrl || null,
        jobPostUrl: values.jobPostUrl || null,
      })
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
      <SheetTrigger render={<Button variant="outline" size="icon" aria-label="Edit company" />}>
        <Pencil />
      </SheetTrigger>
      <SheetContent side="right" className="overflow-y-auto data-[side=right]:sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Edit company</SheetTitle>
          <SheetDescription>Changes are saved to {company.name}.</SheetDescription>
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
              <textarea
                id="summary"
                rows={4}
                className={nativeFieldClasses}
                {...register('summary')}
              />
            </Field>
            <Field data-invalid={!!errors.logoUrl}>
              <FieldLabel htmlFor="logoUrl">Logo URL</FieldLabel>
              <Input id="logoUrl" aria-invalid={!!errors.logoUrl} {...register('logoUrl')} />
              <FieldError errors={[errors.logoUrl]} />
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
              <select id="role" className={nativeFieldClasses} {...register('role')}>
                <option value="fe">Frontend</option>
                <option value="fs">Full stack</option>
              </select>
            </Field>
            <Field>
              <FieldLabel htmlFor="status">Status</FieldLabel>
              <select id="status" className={nativeFieldClasses} {...register('status')}>
                {statuses.map((companyStatus) => (
                  <option key={companyStatus} value={companyStatus}>
                    {label(companyStatus)}
                  </option>
                ))}
              </select>
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

function toFormValues(company: Company): CompanyValues {
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
