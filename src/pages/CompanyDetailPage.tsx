import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Archive } from 'lucide-react'
import { Link, useParams } from 'react-router'

import { Button } from '@/components/ui/button'
import CompanyFormSheet from '@/components/CompanyFormSheet'
import { api } from '@/lib/api'
import { badge, label, pillClasses } from '@/lib/company-ui'
import type { Company } from '@/lib/types'

function LinkedInLogo() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="size-5" aria-hidden="true">
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  )
}

export default function CompanyDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()

  const { data: company, error } = useQuery({
    queryKey: ['companies', id],
    queryFn: async () => (await api.get<Company>(`/companies/${id}`)).data,
  })

  const archive = useMutation({
    mutationFn: () => api.post(`/companies/${id}/archive`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['companies'] }),
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <Link to="/companies" className="text-muted-foreground block w-fit text-sm hover:underline">
          ← Companies
        </Link>
        {company && (
          <div className="flex items-center gap-2">
            {company.status !== 'archived' && (
              <Button
                variant="outline"
                size="icon"
                aria-label="Archive company"
                disabled={archive.isPending}
                onClick={() => archive.mutate()}
              >
                <Archive />
              </Button>
            )}
            <CompanyFormSheet company={company} />
          </div>
        )}
      </div>
      {archive.error && (
        <p role="alert" className="text-destructive text-sm">
          {archive.error.message}
        </p>
      )}
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error.message}
        </p>
      )}
      {!error && !company && <p className="text-muted-foreground text-sm">Loading…</p>}
      {company && (
        <>
          <div className="flex items-center gap-4">
            {company.logoUrl && (
              <img
                src={company.logoUrl}
                alt={`${company.name} logo`}
                className="size-16 rounded object-contain"
              />
            )}
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold">
                <a
                  href={company.domain}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  {company.name}
                </a>
              </h1>
              <span className={`${pillClasses} ${badge[company.status]}`}>
                {label(company.status)}
              </span>
              <span className={`${pillClasses} bg-muted text-muted-foreground`}>
                {company.role === 'fe' ? 'Frontend' : 'Full stack'}
              </span>
              {company.jobPostUrl && (
                <a
                  href={company.jobPostUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={`${pillClasses} bg-purple-100 text-purple-800 hover:underline dark:bg-purple-900/40 dark:text-purple-300`}
                >
                  Hiring
                </a>
              )}
              <a
                href={company.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${company.name} on LinkedIn`}
                className="text-[#0a66c2]"
              >
                <LinkedInLogo />
              </a>
            </div>
          </div>
          {company.summary && <p className="text-sm">{company.summary}</p>}
        </>
      )}
    </div>
  )
}
