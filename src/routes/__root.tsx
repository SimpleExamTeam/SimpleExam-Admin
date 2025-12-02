import { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from '@/components/ui/toaster'
import { NavigationProgress } from '@/components/navigation-progress'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'
import { SearchProvider } from '@/context/search-context'
import { AuthProvider } from '@/context/auth-context'
import { OrdersProvider } from '@/context/orders-context'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: () => {
    return (
      <AuthProvider>
        <SearchProvider>
          <OrdersProvider>
            <NavigationProgress />
            <Outlet />
            <Toaster />
            {import.meta.env.MODE === 'development' && (
              <>
                <ReactQueryDevtools buttonPosition='bottom-left' />
                <TanStackRouterDevtools position='bottom-right' />
              </>
            )}
          </OrdersProvider>
        </SearchProvider>
      </AuthProvider>
    )
  },
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
