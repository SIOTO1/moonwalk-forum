import { useModerationLogs, ModerationLog, ModerationAction } from '@/hooks/useModeration';
import { useAuth } from '@/contexts/AuthContext';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Trash2, 
  Lock, 
  Unlock,
  Ghost,
  UserX,
  UserCheck,
  Edit,
  Shield,
  ArrowRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

const actionConfig: Record<ModerationAction, {
  icon: typeof AlertTriangle;
  label: string;
  color: string;
}> = {
  warning: { icon: AlertTriangle, label: 'Warning', color: 'text-warning' },
  edit: { icon: Edit, label: 'Edit', color: 'text-info' },
  remove: { icon: Trash2, label: 'Remove', color: 'text-destructive' },
  lock: { icon: Lock, label: 'Lock', color: 'text-muted-foreground' },
  unlock: { icon: Unlock, label: 'Unlock', color: 'text-success' },
  shadow_ban: { icon: Ghost, label: 'Shadow Ban', color: 'text-destructive' },
  unshadow_ban: { icon: Ghost, label: 'Unshadow Ban', color: 'text-success' },
  ban: { icon: UserX, label: 'Ban', color: 'text-destructive' },
  unban: { icon: UserCheck, label: 'Unban', color: 'text-success' },
};

export function ModerationLogs() {
  const { canModerate } = useAuth();
  const { data: logs = [], isLoading } = useModerationLogs(100);

  if (!canModerate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You don't have permission to view moderation logs.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Moderation Activity Log
        </h2>
        <p className="text-muted-foreground">
          Complete audit trail of all moderation actions
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            No moderation actions recorded yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <ScrollArea className="h-[600px]">
            <div className="divide-y divide-border">
              {logs.map(log => (
                <LogEntry key={log.id} log={log} />
              ))}
            </div>
          </ScrollArea>
        </Card>
      )}
    </div>
  );
}

function LogEntry({ log }: { log: ModerationLog }) {
  const config = actionConfig[log.action];
  const Icon = config.icon;

  return (
    <div className="p-4 hover:bg-muted/50 transition-colors">
      <div className="flex items-start gap-4">
        <div className={cn("p-2 rounded-lg bg-muted", config.color)}>
          <Icon className="w-4 h-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs">
                  {log.moderator?.display_name?.charAt(0) || log.moderator?.username?.charAt(0) || 'M'}
                </AvatarFallback>
              </Avatar>
              <span className="font-medium text-sm">
                {log.moderator?.display_name || log.moderator?.username || 'Unknown Moderator'}
              </span>
            </div>

            <Badge variant="outline" className={cn("text-xs", config.color)}>
              {config.label}
            </Badge>

            {log.target_user && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <ArrowRight className="w-3 h-3" />
                <span>
                  {log.target_user.display_name || log.target_user.username || 'Unknown User'}
                </span>
              </div>
            )}
          </div>

          {log.reason && (
            <p className="text-sm text-muted-foreground mt-1">
              {log.reason}
            </p>
          )}

          <span className="text-xs text-muted-foreground mt-1 block">
            {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}
