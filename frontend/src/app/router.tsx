import type { PropsWithChildren } from 'react';
import { AppLayout } from './layout';
import App from './App';
import { AuthCallback } from '../features/auth';

export function AppRouter({ children }: PropsWithChildren) {
  const path = typeof window !== 'undefined' ? window.location.pathname : '';

  if (path === '/auth/callback') {
    return <AuthCallback />;
  }

  return (
    <AppLayout>
      {children ?? <App />}
    </AppLayout>
  );
}

export default AppRouter;
