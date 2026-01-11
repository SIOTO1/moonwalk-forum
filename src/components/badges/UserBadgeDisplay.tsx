import { Badge } from '@/hooks/useBadges';
import { 
  ShieldCheck, 
  Calendar, 
  Trophy, 
  Shield, 
  Handshake, 
  Factory,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'shield-check': ShieldCheck,
  'calendar': Calendar,
  'trophy': Trophy,
  'shield': Shield,
  'handshake': Handshake,
  'factory': Factory,
  'award': Award,
};

interface UserBadgeDisplayProps {
  badge: Badge;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function UserBadgeDisplay({ badge, size = 'sm', showLabel = false }: UserBadgeDisplayProps) {
  const IconComponent = iconMap[badge.icon] || Award;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const containerClasses = {
    sm: 'px-1.5 py-0.5 text-[10px]',
    md: 'px-2 py-1 text-xs',
    lg: 'px-2.5 py-1.5 text-sm',
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full font-medium cursor-default transition-transform hover:scale-105",
              containerClasses[size]
            )}
            style={{
              backgroundColor: badge.bg_color,
              color: badge.color,
            }}
          >
            <IconComponent className={sizeClasses[size]} />
            {showLabel && <span>{badge.name}</span>}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">{badge.name}</p>
            {badge.description && (
              <p className="text-xs text-muted-foreground max-w-[200px]">{badge.description}</p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface UserBadgesListProps {
  badges: Badge[];
  size?: 'sm' | 'md' | 'lg';
  maxDisplay?: number;
  showLabels?: boolean;
}

export function UserBadgesList({ 
  badges, 
  size = 'sm', 
  maxDisplay = 3,
  showLabels = false 
}: UserBadgesListProps) {
  if (!badges || badges.length === 0) return null;

  const displayBadges = badges.slice(0, maxDisplay);
  const remainingCount = badges.length - maxDisplay;

  return (
    <div className="flex items-center gap-1 flex-wrap">
      {displayBadges.map(badge => (
        <UserBadgeDisplay 
          key={badge.id} 
          badge={badge} 
          size={size}
          showLabel={showLabels}
        />
      ))}
      {remainingCount > 0 && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-muted-foreground cursor-default">
                +{remainingCount}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {badges.slice(maxDisplay).map(badge => (
                  <p key={badge.id} className="text-sm">{badge.name}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}
