import { ArrowRight, Users, MessageSquare, Shield, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

interface HeroSectionProps {
  onOpenSignUp: () => void;
}

export function HeroSection({ onOpenSignUp }: HeroSectionProps) {
  const { user } = useAuth();

  const stats = [
    { icon: Users, label: 'Active Members', value: '12,400+' },
    { icon: MessageSquare, label: 'Discussions', value: '45,000+' },
    { icon: Shield, label: 'Verified Experts', value: '850+' },
  ];

  const benefits = [
    'Expert advice from industry veterans',
    'Exclusive vendor deals & discounts',
    'Real-time market insights',
    'Private mastermind groups',
  ];

  if (user) return null;

  return (
    <section className="relative overflow-hidden mb-8">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/5 -z-10" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl -z-10" />
      
      <div className="py-12 md:py-16">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              234 members online now
            </div>

            <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              The #1 Community for{' '}
              <span className="text-gradient">Party Rental</span>{' '}
              Professionals
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl">
              Connect with thousands of industry experts, share knowledge, and grow your business with actionable insights from the Moonwalk Forum community.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="gradient-accent text-accent-foreground gap-2 text-base"
                onClick={onOpenSignUp}
              >
                Join Free Today
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                className="gap-2 text-base"
              >
                Explore Discussions
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-2 gap-2 pt-4">
              {benefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle className="w-4 h-4 text-success shrink-0" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Stats Cards */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-3 gap-4">
              {stats.map(({ icon: Icon, label, value }) => (
                <div 
                  key={label}
                  className="forum-card p-6 text-center hover:border-accent/50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-accent" />
                  </div>
                  <p className="text-2xl font-display font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            {/* Trust indicators */}
            <div className="mt-6 p-4 rounded-lg bg-card border border-border">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Trusted by professionals from:</span>
                <div className="flex gap-4 text-foreground font-medium">
                  <span>Magic Jump</span>
                  <span>•</span>
                  <span>Ninja Jump</span>
                  <span>•</span>
                  <span>Bounce Pro</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
