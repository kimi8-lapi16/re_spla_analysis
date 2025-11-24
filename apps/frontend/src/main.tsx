import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from '@tanstack/react-router'
import './index.css'
import { queryClient } from './lib/query-client'
import { configureApiClient } from './lib/api-client'
import { NotificationProvider } from './contexts/NotificationContext'
import { router } from './router'

// Configure OpenAPI client with base URL and credentials
configureApiClient()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <NotificationProvider>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </NotificationProvider>
    </QueryClientProvider>
  </StrictMode>,
)
