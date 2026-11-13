import { Navigate, Outlet, useLocation } from 'react-router'

import { useSession } from '@/lib/auth-client'

export default function RequireAuth() {
  const { data: session, isPending } = useSession()
  const location = useLocation()

  if (isPending) {
    return <p className="p-6 text-sm text-muted-foreground">Loading…</p>
  }

  if (!session) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    )
  }

  return <Outlet />
}
