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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background/95">
      <header className="px-4 py-4 sm:px-6">
        <Button variant="ghost" size="sm" asChild className="font-medium">
          <Link to="/" className="text-sm sm:text-base">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back Home
          </Link>
        </Button>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md bg-card/60 backdrop-blur border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
          <AuthForm onSuccess={() => navigate('/chat')} />
        </div>
      </main>
    </div>
  );
}
