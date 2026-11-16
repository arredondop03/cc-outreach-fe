import { useEffect, useState } from 'react'

import { Input } from '@/components/ui/input'
import { apiGet, type Company } from '@/lib/api'

const statuses: Company['status'][] = ['new', 'ready_for_sequence', 'active', 'archived']
const label = (text: string) => text.replaceAll('_', ' ')
const pillClasses = 'whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium'
const badge: Record<Company['status'], string> = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  new: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  ready_for_sequence: 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
  archived: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>()
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [selectedStatuses, setSelectedStatuses] = useState<Company['status'][]>(['new', 'ready_for_sequence', 'active'])

  useEffect(() => {
    apiGet<Company[]>('/companies')
      .then(setCompanies)
      .catch((error: Error) => setError(error.message))
  }, [])

  const searchText = search.trim().toLowerCase()
  const rows = (companies ?? []).filter(
    (company) =>
      selectedStatuses.includes(company.status) &&
      (company.name.toLowerCase().includes(searchText) ||
        company.domain.toLowerCase().includes(searchText)),
  )

  return (
    <div className="space-y-4 p-6">
      <h1 className="text-2xl font-semibold">Companies</h1>
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
          {error}
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
                <td className="py-2 font-medium">{company.name}</td>
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
