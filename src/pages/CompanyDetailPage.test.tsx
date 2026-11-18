import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { api } from '@/lib/api'
import type { Company } from '@/lib/types'
import CompanyDetailPage from '@/pages/CompanyDetailPage'

vi.mock('@/lib/api', () => ({ api: { get: vi.fn(), post: vi.fn(), patch: vi.fn() } }))

const company: Company = {
  id: '1',
  createdAt: '2026-01-01T00:00:00Z',
  name: 'Acme',
  domain: 'acme.com',
  summary: 'Makes anvils',
  logoUrl: null,
  jobPostUrl: 'https://acme.com/jobs/1',
  role: 'fe',
  status: 'active',
  linkedinUrl: 'https://linkedin.com/company/acme',
}

describe('CompanyDetailPage', () => {
  it('shows the company with its hiring link and summary', async () => {
    vi.mocked(api.get).mockResolvedValue({ data: company })

    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={['/companies/1']}>
          <Routes>
            <Route path="/companies/:id" element={<CompanyDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(await screen.findByRole('link', { name: 'Acme' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Hiring' })).toHaveAttribute('href', company.jobPostUrl)
    expect(screen.getByText('Makes anvils')).toBeInTheDocument()
  })
})
