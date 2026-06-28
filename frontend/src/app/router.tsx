import type { PropsWithChildren } from 'react';
import { AppLayout } from './layout';
import App from './App';

export function AppRouter({ children }: PropsWithChildren) {
  return (
    <AppLayout>
      {children ?? <App />}
    </AppLayout>
  );
}

export default AppRouter;
