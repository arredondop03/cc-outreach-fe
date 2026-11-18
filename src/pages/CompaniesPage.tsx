import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Link } from 'react-router'

import CompanyFormSheet from '@/components/CompanyFormSheet'
import { Input } from '@/components/ui/input'
import { api } from '@/lib/api'
import { badge, label, pillClasses } from '@/lib/company-ui'
import type { Company } from '@/lib/types'

const statuses: Company['status'][] = ['new', 'ready_for_sequence', 'active', 'archived']

export default function CompaniesPage() {
  const [search, setSearch] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Company['status'][]>([
    'new',
    'ready_for_sequence',
    'active',
  ])

  const { data: companies, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => (await api.get<Company[]>('/companies')).data,
  })

  const searchText = search.trim().toLowerCase()
  const rows = (companies ?? []).filter(
    (company) =>
      selectedStatuses.includes(company.status) &&
      (company.name.toLowerCase().includes(searchText) ||
        company.domain.toLowerCase().includes(searchText)),
  )

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Companies</h1>
        <CompanyFormSheet />
      </div>
      <div className="flex gap-2">
        <Input
          aria-label="Search companies"
          placeholder="Search name or domain"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div role="group" aria-label="Status" className="flex items-center gap-2">
          {statuses.map((companyStatus) => {
            const isSelected = selectedStatuses.includes(companyStatus)
            return (
              <button
                key={companyStatus}
                type="button"
                aria-pressed={isSelected}
                className={`${pillClasses} border ${isSelected ? `border-transparent ${badge[companyStatus]}` : 'text-muted-foreground opacity-60'}`}
                onClick={() =>
                  setSelectedStatuses(
                    isSelected
                      ? selectedStatuses.filter((selected) => selected !== companyStatus)
                      : [...selectedStatuses, companyStatus],
                  )
                }
              >
                {label(companyStatus)}
              </button>
            )
          })}
        </div>
      </div>
      {error && (
        <p role="alert" className="text-destructive text-sm">
          {error.message}
        </p>
      )}
      {!error && !companies && <p className="text-muted-foreground text-sm">Loading…</p>}
      {companies && (
        <table className="w-full text-left text-sm">
          <thead className="border-b text-muted-foreground">
            <tr>
              <th className="py-2 font-medium">Name</th>
              <th className="py-2 font-medium">Domain</th>
              <th className="py-2 font-medium">Role</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((company) => (
              <tr key={company.id} className="border-b">
                <td className="py-2 font-medium">
                  <Link to={`/companies/${company.id}`} className="hover:underline">
                    {company.name}
                  </Link>
                </td>
                <td className="py-2">{company.domain}</td>
                <td className="py-2">{label(company.role)}</td>
                <td className="py-2">
                  <span className={`${pillClasses} ${badge[company.status]}`}>
                    {label(company.status)}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={4} className="text-muted-foreground py-4">
                  No companies match.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}
