// Companies the global setup creates before any test runs; the page only displays them, so specs read these.
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
  specialCharacters: {
    name: `<b>O'Reilly & "Sons"</b>`,
    domain: 'oreilly.example.com',
    role: 'fe',
    status: 'new',
  },
  longName: {
    name: `LongName-${'x'.repeat(200)}`,
    domain: 'long.example.com',
    role: 'fe',
    status: 'new',
  },
}
