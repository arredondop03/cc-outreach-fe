import { cn } from 'cn'
import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router'

import { Button } from '@/components/ui/button'
import { signOut, useSession } from '@/lib/auth-client'

const links = [
  { to: '/today', label: 'Today' },
  { to: '/week', label: 'Week' },
  { to: '/companies', label: 'Companies' },
  { to: '/contacts', label: 'Contacts' },
]

export default function AppShell() {
  const { data: session } = useSession()
  const navigate = useNavigate()
  const [logoutError, setLogoutError] = useState('')

  async function logout() {
    const { error } = await signOut()
    if (error) {
      setLogoutError(error.message || 'Could not log out. Please try again.')
      return
    }
    void navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <nav
          aria-label="Main"
          className="mx-auto flex max-w-5xl items-center gap-1 p-3"
        >
          <span className="mr-4 font-semibold">CC Outreach</span>
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm',
                  isActive
                    ? 'bg-muted font-medium'
                    : 'text-muted-foreground hover:bg-muted/60',
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <span className="ml-auto text-sm text-muted-foreground">
            {session?.user.email}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
          {logoutError && (
            <span role="alert" className="text-sm text-destructive">
              {logoutError}
            </span>
          )}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl p-6">
        <Outlet />
      </main>
    </div>
  )
}
