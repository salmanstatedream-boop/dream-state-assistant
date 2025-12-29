import { Link } from 'react-router-dom';
import { Building2, MessageSquare, Users, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Dream State</span>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/auth">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link to="/auth?tab=signup">
            <Button>Create Account</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 gradient-hero">
        <div className="max-w-3xl text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Dream State Property
            <br />
            <span className="text-primary">Management Assistant</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Instant answers for guests, owners, and operations. Get help with check-ins, property details, payouts, and maintenance — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth?tab=signup">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline">Sign In</Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl w-full">
          {[
            { icon: Users, title: 'Guest Support', desc: 'Check-in instructions and WiFi details' },
            { icon: Building2, title: 'Property Info', desc: 'Instant access to property details' },
            { icon: MessageSquare, title: 'Owner Queries', desc: 'Payout and performance questions' },
            { icon: Wrench, title: 'Maintenance', desc: 'Submit and track repair requests' },
          ].map((feature) => (
            <div
              key={feature.title}
              className="bg-card border border-border rounded-xl p-6 text-center shadow-sm"
            >
              <div className="w-12 h-12 rounded-lg bg-accent flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Dream State Property Management
      </footer>
    </div>
  );
}
