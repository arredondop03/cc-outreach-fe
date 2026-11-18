// Companies the global setup creates before any test runs. Treat them as read-only fixtures for tests that only read data.
export const seedCompanies = {
  newCompany: {
    name: 'Globex',
    domain: 'globex.example.com',
    role: 'fs',
    status: 'new',
  },
  ready: {
    name: 'Initech',
    domain: 'initech.example.com',
    role: 'fe',
    status: 'ready_for_sequence',
  },
  active: {
    name: 'Hooli',
    domain: 'hooli.example.com',
    role: 'fe',
    status: 'active',
  },
  archived: {
    name: 'Pied Piper',
    domain: 'piedpiper.example.com',
    role: 'fs',
    status: 'archived',
  },
}
