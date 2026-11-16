import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router'

import AppShell from '@/components/AppShell'
import RequireAuth from '@/components/RequireAuth'
import CompaniesPage from '@/pages/CompaniesPage'
import ContactsPage from '@/pages/ContactsPage'
import LoginPage from '@/pages/LoginPage'
import TodayPage from '@/pages/TodayPage'
import WeekPage from '@/pages/WeekPage'

const router = createBrowserRouter([
  { path: '/login', Component: LoginPage },
  {
    Component: RequireAuth,
    children: [
      {
        path: '/',
        Component: AppShell,
        children: [
          { index: true, element: <Navigate to="/today" replace /> },
          { path: 'today', Component: TodayPage },
          { path: 'week', Component: WeekPage },
          { path: 'companies', Component: CompaniesPage },
          { path: 'contacts', Component: ContactsPage },
        ],
      },
    ],
  },
])

const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
