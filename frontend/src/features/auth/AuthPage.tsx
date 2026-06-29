import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { API_BASE_URL } from '../../services/config';

export function AuthPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    const response = await fetch(`${API_BASE_URL}/api/auth/google/url`);
    const data = await response.json();
    window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card/80 p-8 shadow-sm backdrop-blur">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in with Google to continue to your workspace.
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>
      </div>
    </div>
  );
}
