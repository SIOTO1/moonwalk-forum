import { useState } from 'react';
import { useBadges, useUserBadges, useAssignBadge, useRemoveBadge, Badge } from '@/hooks/useBadges';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { UserBadgeDisplay } from './UserBadgeDisplay';
import { Award, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface BadgeManagerProps {
  userId: string;
  username: string;
}

export function BadgeManager({ userId, username }: BadgeManagerProps) {
  const { canModerate } = useAuth();
  const { data: allBadges = [], isLoading: badgesLoading } = useBadges();
  const { data: userBadges = [], isLoading: userBadgesLoading } = useUserBadges(userId);
  const assignBadge = useAssignBadge();
  const removeBadge = useRemoveBadge();
  
  const [open, setOpen] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});

  if (!canModerate) return null;

  const userBadgeIds = new Set(userBadges.map(ub => ub.badge_id));

  const handleToggle = async (badge: Badge) => {
    const hasBadge = userBadgeIds.has(badge.id);
    
    try {
      if (hasBadge) {
        await removeBadge.mutateAsync({ userId, badgeId: badge.id });
        toast.success(`Removed "${badge.name}" badge from ${username}`);
      } else {
        await assignBadge.mutateAsync({ userId, badgeId: badge.id });
        toast.success(`Assigned "${badge.name}" badge to ${username}`);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update badge');
    }
  };

  const isLoading = badgesLoading || userBadgesLoading;
  const isMutating = assignBadge.isPending || removeBadge.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Award className="w-4 h-4" />
          Manage Badges
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="font-display">
            Manage Badges for {username}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-3 mt-4">
            {allBadges.map(badge => {
              const hasBadge = userBadgeIds.has(badge.id);
              
              return (
                <div 
                  key={badge.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={badge.id}
                      checked={hasBadge}
                      onCheckedChange={() => handleToggle(badge)}
                      disabled={isMutating}
                    />
                    <div className="flex items-center gap-2">
                      <UserBadgeDisplay badge={badge} size="md" />
                      <div>
                        <label 
                          htmlFor={badge.id}
                          className="font-medium cursor-pointer"
                        >
                          {badge.name}
                        </label>
                        {badge.description && (
                          <p className="text-xs text-muted-foreground">
                            {badge.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
