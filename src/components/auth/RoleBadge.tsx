import { AppRole } from '@/contexts/AuthContext';
import { Shield, Crown, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoleBadgeProps {
  role: AppRole;
  size?: 'sm' | 'md' | 'lg';
}

const roleConfig: Record<AppRole, {
  label: string;
  icon: typeof Shield;
  className: string;
}> = {
  user: {
    label: 'Member',
    icon: User,
    className: 'bg-muted text-muted-foreground'
  },
  moderator: {
    label: 'Moderator',
    icon: Shield,
    className: 'bg-[hsl(var(--badge-moderator))/15] text-[hsl(var(--badge-moderator))]'
  },
  admin: {
    label: 'Admin',
    icon: Crown,
    className: 'bg-destructive/15 text-destructive'
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

export function RoleBadge({ role, size = 'md' }: RoleBadgeProps) {
  const config = roleConfig[role];
  const Icon = config.icon;

  // Don't show badge for regular users
  if (role === 'user') return null;

  return (
    <span className={cn(
      'inline-flex items-center rounded-full font-semibold',
      config.className,
      sizeClasses[size]
    )}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
