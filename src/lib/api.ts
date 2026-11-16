import type { components } from '@/lib/api-types'

export type Company = components['schemas']['Company']

type ApiError = {
  error: {
    message: string
    details?: unknown
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
    credentials: 'include',
  })

  if (res.status === 401) {
    window.location.assign('/login')
  }

  if (!res.ok) {
    const { error } = (await res.json()) as ApiError
    throw new Error(error.details ? `${error.message}: ${JSON.stringify(error.details)}` : error.message)
  }
  return res.json() as Promise<T>
}
