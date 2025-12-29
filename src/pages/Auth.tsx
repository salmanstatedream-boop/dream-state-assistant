import { useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import { AuthForm } from '@/components/AuthForm';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Auth() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  useEffect(() => {
    // Check if already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/chat', { replace: true });
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate('/chat', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="p-4">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-lg p-2">
          <AuthForm onSuccess={() => navigate('/chat')} />
        </div>
      </main>
    </div>
  );
}
