import { Check, Crown, Zap, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface MembershipCTAProps {
  variant?: 'sidebar' | 'inline' | 'full';
}

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get started with community basics',
    features: [
      'Browse all public discussions',
      'Post in general forums',
      'Basic profile',
    ],
    cta: 'Current Plan',
    popular: false,
    tier: 'free' as const,
  },
  {
    name: 'Pro Member',
    price: '$29',
    period: '/month',
    description: 'For growing rental businesses',
    features: [
      'Everything in Free',
      'Access Pro-only forums',
      'Verified badge',
      'Priority support',
      'Exclusive vendor deals',
    ],
    cta: 'Upgrade to Pro',
    popular: true,
    tier: 'pro' as const,
  },
  {
    name: 'Elite Member',
    price: '$79',
    period: '/month',
    description: 'For industry leaders',
    features: [
      'Everything in Pro',
      'Private mastermind access',
      'Direct expert messaging',
      '1-on-1 consultations',
      'Early feature access',
      'Elite badge & recognition',
    ],
    cta: 'Go Elite',
    popular: false,
    tier: 'elite' as const,
  },
];

export function MembershipCTA({ variant = 'sidebar' }: MembershipCTAProps) {
  const { user, profile } = useAuth();
  const currentTier = profile?.membership_tier || 'free';

  if (variant === 'sidebar') {
    return (
      <div className="space-y-4">
        {/* Pro CTA */}
        <div className="forum-card p-4 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold">Upgrade to Pro</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Unlock exclusive forums, verified status, and premium features.
          </p>
          <ul className="space-y-2 mb-4">
            {['Pro-only discussions', 'Verified badge', 'Priority support'].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm">
                <Check className="w-4 h-4 text-success" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <Button className="w-full gradient-accent text-accent-foreground">
            <Crown className="w-4 h-4 mr-2" />
            $29/month
          </Button>
        </div>

        {/* Elite CTA */}
        <div className="forum-card p-4 border-purple-500/30 bg-gradient-to-br from-purple-500/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            <h3 className="font-display font-semibold">Elite Membership</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Join the inner circle of industry leaders.
          </p>
          <Button variant="outline" className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10">
            Learn More - $79/mo
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <section className="py-12">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl md:text-3xl font-bold mb-3">
            Choose Your Membership
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of party rental professionals who are growing their businesses with Moonwalk Forum.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {tiers.map((tier) => {
            const isCurrentTier = currentTier === tier.tier;
            const isUpgrade = 
              (currentTier === 'free' && (tier.tier === 'pro' || tier.tier === 'elite')) ||
              (currentTier === 'pro' && tier.tier === 'elite');

            return (
              <div
                key={tier.name}
                className={cn(
                  "forum-card p-6 relative",
                  tier.popular && "border-accent ring-1 ring-accent/20",
                  isCurrentTier && "border-success/50 bg-success/5"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 bg-accent text-accent-foreground text-xs font-semibold rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-display font-bold text-xl mb-1">{tier.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">{tier.price}</span>
                    <span className="text-muted-foreground">{tier.period}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">{tier.description}</p>
                </div>

                <ul className="space-y-3 mb-6">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-success shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full",
                    tier.popular && "gradient-accent text-accent-foreground",
                    isCurrentTier && "bg-success/20 text-success hover:bg-success/30"
                  )}
                  variant={tier.popular ? "default" : "outline"}
                  disabled={isCurrentTier}
                >
                  {isCurrentTier ? 'Current Plan' : isUpgrade ? tier.cta : 'Select Plan'}
                </Button>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  return null;
}
