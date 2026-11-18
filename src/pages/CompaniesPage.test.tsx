import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'

import { api } from '@/lib/api'
import type { Company } from '@/lib/types'
import CompaniesPage from '@/pages/CompaniesPage'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn() } }))

function buildCompany(overrides: Partial<Company>): Company {
  return {
    id: overrides.name ?? 'id',
    createdAt: '2026-01-01T00:00:00Z',
    name: 'Company',
    domain: 'company.example.com',
    summary: null,
    logoUrl: null,
    jobPostUrl: null,
    role: 'fe',
    status: 'new',
    linkedinUrl: 'https://www.linkedin.com/company/company',
    ...overrides,
  }
}

const globex = buildCompany({ name: 'Globex', domain: 'globex.example.com', role: 'fs' })
const initech = buildCompany({
  name: 'Initech',
  domain: 'initech.example.com',
  status: 'ready_for_sequence',
})
const hooli = buildCompany({ name: 'Hooli', domain: 'hooli.example.com', status: 'active' })
const piedPiper = buildCompany({
  name: 'Pied Piper',
  domain: 'piedpiper.example.com',
  role: 'fs',
  status: 'archived',
})

async function renderPage(companies: Company[] = [globex, initech, hooli, piedPiper]) {
  vi.mocked(api.get).mockResolvedValue({ data: companies })
  render(
    <QueryClientProvider
      client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}
    >
      <MemoryRouter>
        <CompaniesPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
  await screen.findByRole('table')
  return {
    user: userEvent.setup(),
    searchBox: screen.getByLabelText('Search companies'),
    statusFilters: screen.getByRole('group', { name: 'Status' }),
    // A row's accessible name is all its cell text, so match by substring.
    row: (name: string) => screen.queryByRole('row', { name: new RegExp(name) }),
  }
}

describe('CompaniesPage', () => {
  it('shows name, domain, role and status for each company', async () => {
    const { row } = await renderPage()

    const initechRow = row('Initech')!
    expect(initechRow).toHaveTextContent('initech.example.com')
    expect(initechRow).toHaveTextContent('fe')
    expect(initechRow).toHaveTextContent('ready for sequence')
  })

  it('shows an empty state when nothing matches the search', async () => {
    const { user, searchBox } = await renderPage()

    await user.type(searchBox, 'zzz-no-such-company')

    expect(screen.getByText('No companies match.')).toBeInTheDocument()
  })

  it('searches by name or domain, ignoring case', async () => {
    const { user, searchBox, row } = await renderPage()

    await user.type(searchBox, 'INITECH.EXAMPLE.COM')
    expect(row('Initech')).toBeInTheDocument()
    expect(row('Globex')).not.toBeInTheDocument()

    await user.clear(searchBox)
    await user.type(searchBox, 'globex')
    expect(row('Globex')).toBeInTheDocument()
    expect(row('Initech')).not.toBeInTheDocument()
  })

  it('hides archived companies by default and shows them when the archived filter is on', async () => {
    const { user, statusFilters, row } = await renderPage()
    const archivedFilter = within(statusFilters).getByRole('button', { name: 'archived' })

    expect(row('Globex')).toBeInTheDocument()
    expect(row('Pied Piper')).not.toBeInTheDocument()
    expect(archivedFilter).toHaveAttribute('aria-pressed', 'false')

    await user.click(archivedFilter)

    expect(archivedFilter).toHaveAttribute('aria-pressed', 'true')
    expect(row('Pied Piper')).toBeInTheDocument()
  })

  it('hides companies whose status is deselected', async () => {
    const { user, statusFilters, row } = await renderPage()

    await user.click(within(statusFilters).getByRole('button', { name: 'active' }))

    expect(row('Hooli')).not.toBeInTheDocument()
    expect(row('Globex')).toBeInTheDocument()
  })

  it('shows the empty state when every status is deselected', async () => {
    const { user, statusFilters } = await renderPage()

    for (const status of ['new', 'ready for sequence', 'active']) {
      await user.click(within(statusFilters).getByRole('button', { name: status }))
    }

    expect(screen.getByText('No companies match.')).toBeInTheDocument()
  })

  it('combines the status filter with the search', async () => {
    const { user, searchBox, statusFilters, row } = await renderPage()

    await user.click(within(statusFilters).getByRole('button', { name: 'archived' }))
    await user.type(searchBox, 'Pied Piper')

    expect(row('Pied Piper')).toBeInTheDocument()
    expect(row('Hooli')).not.toBeInTheDocument()
  })
})
