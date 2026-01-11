import { AlertTriangle, ShieldAlert, Ban, Clock, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContentViolationWarningProps {
  isOpen: boolean;
  onClose: () => void;
  violationType: string;
  message: string;
  strikeNumber: number;
  restrictionType: 'warning' | 'temp_restriction' | 'suspension';
}

export function ContentViolationWarning({
  isOpen,
  onClose,
  violationType,
  message,
  strikeNumber,
  restrictionType,
}: ContentViolationWarningProps) {
  const getIcon = () => {
    switch (restrictionType) {
      case 'suspension':
        return Ban;
      case 'temp_restriction':
        return Clock;
      default:
        return ShieldAlert;
    }
  };

  const getTitle = () => {
    switch (restrictionType) {
      case 'suspension':
        return 'Account Suspended';
      case 'temp_restriction':
        return 'Posting Restricted';
      default:
        return 'Content Blocked';
    }
  };

  const getHeaderColor = () => {
    switch (restrictionType) {
      case 'suspension':
        return 'bg-destructive/10 text-destructive';
      case 'temp_restriction':
        return 'bg-orange-500/10 text-orange-600';
      default:
        return 'bg-amber-500/10 text-amber-600';
    }
  };

  const Icon = getIcon();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={cn('flex items-center gap-3 p-3 rounded-lg mb-2', getHeaderColor())}>
            <Icon className="w-6 h-6" />
            <div>
              <DialogTitle>{getTitle()}</DialogTitle>
              <DialogDescription className="text-current/70">
                Strike {strikeNumber} of 3
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-1">
              <AlertTriangle className="w-4 h-4" />
              Violation Type: {violationType.replace('_', ' ').toUpperCase()}
            </div>
            <p className="text-sm text-foreground">{message}</p>
          </div>

          {restrictionType === 'warning' && (
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-2">How to fix this:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Remove any explicit or inappropriate language</li>
                <li>Focus on constructive, professional discussion</li>
                <li>Disagree respectfully without personal attacks</li>
                <li>Avoid threatening or intimidating language</li>
              </ul>
            </div>
          )}

          {restrictionType === 'temp_restriction' && (
            <div className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/20">
              <p className="text-sm text-orange-700 dark:text-orange-400">
                <strong>Temporary Restriction:</strong> You will be unable to post or comment 
                for the next 24 hours. Please use this time to review our community guidelines.
              </p>
            </div>
          )}

          {restrictionType === 'suspension' && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-destructive">
                <strong>Account Suspended:</strong> Your account has been suspended pending 
                moderator review. You may appeal this decision by contacting our moderation team.
              </p>
            </div>
          )}

          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <RefreshCw className="w-4 h-4 text-primary" />
            <p className="text-sm text-primary">
              {restrictionType === 'warning' 
                ? 'Revise your content and try again.'
                : 'If you believe this was an error, please contact our moderation team.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full">
            {restrictionType === 'warning' ? 'I Understand - Revise Content' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
