import { useState } from 'react';
import { 
  useShadowBans, 
  useShadowBan, 
  useRemoveShadowBan,
  ShadowBan 
} from '@/hooks/useModeration';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Ghost, 
  UserX, 
  Clock, 
  AlertTriangle,
  Undo2,
  Plus
} from 'lucide-react';
import { formatDistanceToNow, format, addDays } from 'date-fns';
import { toast } from 'sonner';

export function ShadowBanManager() {
  const { canModerate } = useAuth();
  const { data: shadowBans = [], isLoading } = useShadowBans();
  const shadowBan = useShadowBan();
  const removeShadowBan = useRemoveShadowBan();

  const [newBanDialog, setNewBanDialog] = useState(false);
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');
  const [duration, setDuration] = useState<'permanent' | '7days' | '30days'>('permanent');

  if (!canModerate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You don't have permission to manage shadow bans.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleCreateBan = async () => {
    if (!userId.trim()) {
      toast.error('Please enter a user ID');
      return;
    }

    try {
      let expiresAt: string | undefined;
      if (duration === '7days') {
        expiresAt = addDays(new Date(), 7).toISOString();
      } else if (duration === '30days') {
        expiresAt = addDays(new Date(), 30).toISOString();
      }

      await shadowBan.mutateAsync({
        userId: userId.trim(),
        reason: reason.trim() || undefined,
        expiresAt,
      });

      toast.success('User shadow banned successfully');
      setNewBanDialog(false);
      setUserId('');
      setReason('');
      setDuration('permanent');
    } catch (error: any) {
      toast.error(error.message || 'Failed to shadow ban user');
    }
  };

  const handleRemoveBan = async (ban: ShadowBan) => {
    try {
      await removeShadowBan.mutateAsync({
        banId: ban.id,
        userId: ban.user_id,
      });
      toast.success('Shadow ban removed');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove shadow ban');
    }
  };

  const activeBans = shadowBans.filter(
    b => !b.expires_at || new Date(b.expires_at) > new Date()
  );
  const expiredBans = shadowBans.filter(
    b => b.expires_at && new Date(b.expires_at) <= new Date()
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold flex items-center gap-2">
            <Ghost className="w-6 h-6" />
            Shadow Bans
          </h2>
          <p className="text-muted-foreground">
            Shadow banned users can still post, but their content is hidden from others
          </p>
        </div>

        <Dialog open={newBanDialog} onOpenChange={setNewBanDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Add Shadow Ban
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Shadow Ban User</DialogTitle>
              <DialogDescription>
                The user will be able to post and interact, but their content will be invisible to others.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="userId">User ID</Label>
                <Input
                  id="userId"
                  placeholder="Enter the user's ID..."
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Why is this user being shadow banned?"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Duration</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={duration === 'permanent' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration('permanent')}
                  >
                    Permanent
                  </Button>
                  <Button
                    type="button"
                    variant={duration === '7days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration('7days')}
                  >
                    7 Days
                  </Button>
                  <Button
                    type="button"
                    variant={duration === '30days' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDuration('30days')}
                  >
                    30 Days
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setNewBanDialog(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateBan}
                disabled={shadowBan.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                <UserX className="w-4 h-4 mr-2" />
                Shadow Ban
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active Bans */}
          <div>
            <h3 className="font-medium mb-3 flex items-center gap-2">
              <Badge variant="destructive">{activeBans.length}</Badge>
              Active Shadow Bans
            </h3>
            
            {activeBans.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No active shadow bans
                </CardContent>
              </Card>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3 pr-4">
                  {activeBans.map(ban => (
                    <ShadowBanCard
                      key={ban.id}
                      ban={ban}
                      onRemove={() => handleRemoveBan(ban)}
                      isRemoving={removeShadowBan.isPending}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Expired Bans */}
          {expiredBans.length > 0 && (
            <div>
              <h3 className="font-medium mb-3 text-muted-foreground">
                Expired Bans ({expiredBans.length})
              </h3>
              <ScrollArea className="h-[200px]">
                <div className="space-y-3 pr-4">
                  {expiredBans.map(ban => (
                    <ShadowBanCard
                      key={ban.id}
                      ban={ban}
                      expired
                    />
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface ShadowBanCardProps {
  ban: ShadowBan;
  onRemove?: () => void;
  isRemoving?: boolean;
  expired?: boolean;
}

function ShadowBanCard({ ban, onRemove, isRemoving, expired }: ShadowBanCardProps) {
  return (
    <Card className={expired ? 'opacity-60' : ''}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback>
                {ban.user?.display_name?.charAt(0) || ban.user?.username?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-sm">
                {ban.user?.display_name || ban.user?.username || 'Unknown User'}
              </CardTitle>
              <CardDescription className="text-xs">
                @{ban.user?.username || 'unknown'}
              </CardDescription>
            </div>
          </div>
          {ban.expires_at ? (
            <Badge variant={expired ? 'secondary' : 'outline'} className="gap-1">
              <Clock className="w-3 h-3" />
              {expired 
                ? 'Expired' 
                : `Expires ${format(new Date(ban.expires_at), 'MMM d, yyyy')}`
              }
            </Badge>
          ) : (
            <Badge variant="destructive">Permanent</Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2">
        {ban.reason && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Reason: </span>
            {ban.reason}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Banned by {ban.banned_by_user?.display_name || ban.banned_by_user?.username || 'Unknown'}{' '}
          {formatDistanceToNow(new Date(ban.created_at), { addSuffix: true })}
        </p>
      </CardContent>

      {!expired && onRemove && (
        <CardFooter className="pt-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={onRemove}
            disabled={isRemoving}
          >
            <Undo2 className="w-4 h-4 mr-1" />
            Remove Ban
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
