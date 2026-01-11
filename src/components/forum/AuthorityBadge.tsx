import { UserRole } from '@/types/forum';
import { Shield, Award, CheckCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AuthorityBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

const roleConfig: Record<UserRole, { 
  label: string; 
  icon: typeof Shield; 
  className: string;
}> = {
  member: {
    label: 'Member',
    icon: Star,
    className: 'hidden', // Don't show badge for regular members
  },
  verified_vendor: {
    label: 'Verified Vendor',
    icon: CheckCircle,
    className: 'badge-verified',
  },
  industry_expert: {
    label: 'Industry Expert',
    icon: Award,
    className: 'badge-expert',
  },
  moderator: {
    label: 'Moderator',
    icon: Shield,
    className: 'badge-moderator',
  },
  admin: {
    label: 'Admin',
    icon: Shield,
    className: 'badge-moderator',
  },
};

export function AuthorityBadge({ role, size = 'sm' }: AuthorityBadgeProps) {
  const config = roleConfig[role];
  
  if (role === 'member') return null;

  const Icon = config.icon;
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <span className={cn('authority-badge', config.className)}>
      <Icon className={iconSize} />
      <span>{config.label}</span>
    </span>
  );
}
