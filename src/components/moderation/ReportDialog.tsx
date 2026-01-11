import { useState } from 'react';
import { useCreateReport, ReportReason } from '@/hooks/useModeration';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Flag, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReportDialogProps {
  type: 'post' | 'comment';
  targetId: string;
  trigger?: React.ReactNode;
}

const reportReasons: { value: ReportReason; label: string; description: string; priority?: boolean }[] = [
  { value: 'harassment', label: 'Harassment or Bullying', description: 'Personal attacks, threats, intimidation, or targeting individuals', priority: true },
  { value: 'spam', label: 'Spam', description: 'Unwanted promotional content or repetitive posts' },
  { value: 'misinformation', label: 'Misinformation', description: 'False or misleading information' },
  { value: 'unsafe_advice', label: 'Unsafe Advice', description: 'Potentially dangerous or harmful recommendations' },
  { value: 'inappropriate', label: 'Inappropriate Language', description: 'Profanity, hate speech, or abusive language' },
  { value: 'off_topic', label: 'Off Topic', description: 'Content not relevant to the discussion' },
  { value: 'other', label: 'Other', description: 'Specify your reason below' },
];

export function ReportDialog({ type, targetId, trigger }: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<ReportReason | ''>('');
  const [description, setDescription] = useState('');
  const createReport = useCreateReport();

  const handleSubmit = async () => {
    if (!reason) {
      toast.error('Please select a reason for your report');
      return;
    }

    try {
      await createReport.mutateAsync({
        postId: type === 'post' ? targetId : undefined,
        commentId: type === 'comment' ? targetId : undefined,
        reason,
        description: description.trim() || undefined,
      });
      
      toast.success('Report submitted. Our moderators will review it shortly.');
      setOpen(false);
      setReason('');
      setDescription('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit report');
    }
  };

  if (!user) {
    return trigger ? (
      <div onClick={() => toast.error('Please sign in to report content')}>
        {trigger}
      </div>
    ) : null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Flag className="w-4 h-4 mr-1" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Report {type === 'post' ? 'Thread' : 'Comment'}
          </DialogTitle>
          <DialogDescription>
            Help us maintain a safe and professional community. All reports are reviewed by our moderation team.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>Why are you reporting this {type}?</Label>
            <RadioGroup
              value={reason}
              onValueChange={(val) => setReason(val as ReportReason)}
              className="space-y-2"
            >
              {reportReasons.map((item) => (
                <div
                  key={item.value}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg border transition-colors cursor-pointer",
                    reason === item.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-muted-foreground/50",
                    item.priority && "ring-1 ring-destructive/20"
                  )}
                  onClick={() => setReason(item.value)}
                >
                  <RadioGroupItem value={item.value} id={item.value} className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor={item.value} className={cn(
                      "font-medium cursor-pointer",
                      item.priority && "text-destructive"
                    )}>
                      {item.label}
                      {item.priority && (
                        <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">
                          Priority
                        </span>
                      )}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context that might help our moderators..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!reason || createReport.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {createReport.isPending ? 'Submitting...' : 'Submit Report'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
