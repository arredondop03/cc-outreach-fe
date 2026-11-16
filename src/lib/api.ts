import axios from 'axios'

import type { components } from '@/lib/api-types'

export type Company = components['schemas']['Company']

type ApiError = {
  error: {
    message: string
    details?: unknown
  }
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

api.interceptors.response.use(undefined, (axiosError) => {
  if (axiosError.response?.status === 401) {
    window.location.assign('/login')
  }

  // Network failures have no response body; let axios's own error through.
  const body = axiosError.response?.data as ApiError | undefined

  if (!body) return Promise.reject(axiosError)

  const { message, details } = body.error
  return Promise.reject(new Error(details ? `${message}: ${JSON.stringify(details)}` : message))
})
