import { MembershipTier } from '@/contexts/AuthContext';
import { Crown, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MembershipBadgeProps {
  tier: MembershipTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

const tierConfig: Record<MembershipTier, {
  label: string;
  icon: typeof Crown;
  className: string;
}> = {
  free: {
    label: 'Free',
    icon: Star,
    className: 'bg-muted text-muted-foreground'
  },
  pro: {
    label: 'Pro',
    icon: Sparkles,
    className: 'bg-accent/15 text-accent'
  },
  elite: {
    label: 'Elite',
    icon: Crown,
    className: 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-400'
  }
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-[10px] gap-1',
  md: 'px-2.5 py-1 text-xs gap-1.5',
  lg: 'px-3 py-1.5 text-sm gap-2'
};

const iconSizes = {
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
  lg: 'w-4 h-4'
};

export function MembershipBadge({ tier, size = 'md', showLabel = true }: MembershipBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-semibold',
      config.className,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {showLabel && config.label}
    </span>
  );
}
