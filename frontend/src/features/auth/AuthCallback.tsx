import { useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export function AuthCallback() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');
    const userId = params.get('user_id');

    if (token) {
      localStorage.setItem('jwt_token', token);
      localStorage.setItem('email', email ?? '');
      localStorage.setItem('name', name ?? '');
      localStorage.setItem('user_id', userId ?? '');
      localStorage.setItem(
        'auth_session',
        JSON.stringify({ token, email, name, userId }),
      );
    }

    window.location.replace('/');
  }, []);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Finishing sign in...</p>
      </div>
    </div>
  );
}
