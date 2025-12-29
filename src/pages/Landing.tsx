import { Link } from 'react-router-dom';
import { Building2, MessageSquare, Users, Wrench, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-background via-background to-background/95">
      {/* Header */}
      <header className="sticky top-0 z-50 px-4 py-4 sm:px-6 flex items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg">
            <MessageSquare className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg text-foreground hidden sm:inline">Dream State</span>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link to="/auth">
            <Button variant="ghost" className="text-sm sm:text-base">
              Sign In
            </Button>
          </Link>
          <Link to="/auth?tab=signup">
            <Button className="text-sm sm:text-base font-semibold">Create Account</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8 sm:py-12">
        <div className="max-w-4xl w-full text-center">
          <div className="mb-6 inline-block">
            <span className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-semibold">
              🎯 Intelligent Property Management
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 tracking-tight leading-tight">
            Dream State
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary/80">
              Management Assistant
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            Get instant answers for guests, owners, and operations. Powerful AI assistance for check-ins, property details, payouts, maintenance, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-12">
            <Link to="/auth?tab=signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto text-base font-semibold">
                Get Started <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/auth" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base font-semibold">
                Sign In
              </Button>
            </Link>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-6xl w-full">
            {[
              { icon: Users, title: '👥 Guest Support', desc: 'Check-in help & instant access' },
              { icon: Building2, title: '🏢 Property Info', desc: 'Detailed property questions' },
              { icon: MessageSquare, title: '💬 Owner Queries', desc: 'Payouts & performance data' },
              { icon: Wrench, title: '🔧 Maintenance', desc: 'Track & submit requests' },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group bg-card/50 backdrop-blur border border-border rounded-xl p-5 sm:p-6 text-center hover:bg-card hover:border-primary/30 transition-all duration-300 shadow-sm hover:shadow-md hover:scale-105"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:from-primary/30 group-hover:to-primary/20 transition-all">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 border-t border-border/50 text-center text-xs sm:text-sm text-muted-foreground">
        © {new Date().getFullYear()} Dream State. All rights reserved.
      </footer>
    </div>
  );
}
