import { useState } from 'react';
import { 
  useReports, 
  useReviewReport, 
  useRemoveContent,
  Report,
  ReportStatus 
} from '@/hooks/useModeration';
import { useModeratePost } from '@/hooks/useComments';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  MessageCircle,
  Trash2,
  Lock,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const statusColors: Record<ReportStatus, string> = {
  pending: 'bg-warning/20 text-warning border-warning/30',
  reviewed: 'bg-info/20 text-info border-info/30',
  resolved: 'bg-success/20 text-success border-success/30',
  dismissed: 'bg-muted text-muted-foreground border-muted',
};

const reasonLabels: Record<string, string> = {
  spam: 'Spam',
  harassment: 'Harassment',
  misinformation: 'Misinformation',
  unsafe_advice: 'Unsafe Advice',
  inappropriate: 'Inappropriate',
  off_topic: 'Off Topic',
  other: 'Other',
};

export function ModerationQueue() {
  const { canModerate } = useAuth();
  const [selectedTab, setSelectedTab] = useState<ReportStatus | 'all'>('pending');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [actionDialog, setActionDialog] = useState<'review' | 'remove' | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [removalReason, setRemovalReason] = useState('');

  const { data: reports = [], isLoading } = useReports(
    selectedTab === 'all' ? undefined : selectedTab
  );
  const reviewReport = useReviewReport();
  const removeContent = useRemoveContent();
  const moderatePost = useModeratePost();

  if (!canModerate) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You don't have permission to access the moderation queue.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleReview = async (status: ReportStatus) => {
    if (!selectedReport) return;

    try {
      await reviewReport.mutateAsync({
        reportId: selectedReport.id,
        status,
        resolutionNotes: resolutionNotes.trim() || undefined,
      });
      
      toast.success(`Report marked as ${status}`);
      setActionDialog(null);
      setSelectedReport(null);
      setResolutionNotes('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update report');
    }
  };

  const handleRemove = async () => {
    if (!selectedReport) return;

    const type = selectedReport.post_id ? 'post' : 'comment';
    const id = selectedReport.post_id || selectedReport.comment_id;

    if (!id) return;

    try {
      await removeContent.mutateAsync({
        type,
        id,
        reason: removalReason.trim() || 'Violated community guidelines',
      });

      // Also resolve the report
      await reviewReport.mutateAsync({
        reportId: selectedReport.id,
        status: 'resolved',
        resolutionNotes: `Content removed: ${removalReason || 'Violated community guidelines'}`,
      });

      toast.success(`${type === 'post' ? 'Thread' : 'Comment'} removed`);
      setActionDialog(null);
      setSelectedReport(null);
      setRemovalReason('');
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove content');
    }
  };

  const handleLock = async () => {
    if (!selectedReport?.post_id) return;

    try {
      await moderatePost.mutateAsync({
        postId: selectedReport.post_id,
        action: 'lock',
        value: true,
      });
      toast.success('Thread locked');
    } catch (error: any) {
      toast.error(error.message || 'Failed to lock thread');
    }
  };

  const pendingCount = reports.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold">Moderation Queue</h2>
          <p className="text-muted-foreground">
            Review and manage reported content
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="destructive" className="text-lg px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as ReportStatus | 'all')}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <Clock className="w-4 h-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="reviewed" className="gap-2">
            <Eye className="w-4 h-4" />
            Reviewed
          </TabsTrigger>
          <TabsTrigger value="resolved" className="gap-2">
            <CheckCircle2 className="w-4 h-4" />
            Resolved
          </TabsTrigger>
          <TabsTrigger value="dismissed" className="gap-2">
            <XCircle className="w-4 h-4" />
            Dismissed
          </TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : reports.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 mx-auto text-success mb-4" />
                <p className="text-muted-foreground">
                  No reports in this category. Great job keeping the community clean!
                </p>
              </CardContent>
            </Card>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="space-y-4 pr-4">
                {reports.map(report => (
                  <ReportCard
                    key={report.id}
                    report={report}
                    onSelect={() => setSelectedReport(report)}
                    onReview={() => {
                      setSelectedReport(report);
                      setActionDialog('review');
                    }}
                    onRemove={() => {
                      setSelectedReport(report);
                      setActionDialog('remove');
                    }}
                    onLock={report.post_id ? () => {
                      setSelectedReport(report);
                      handleLock();
                    } : undefined}
                  />
                ))}
              </div>
            </ScrollArea>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={actionDialog === 'review'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Report</DialogTitle>
            <DialogDescription>
              Update the status of this report and add any notes.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Add resolution notes (optional)..."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleReview('dismissed')}
              disabled={reviewReport.isPending}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Dismiss
            </Button>
            <Button
              variant="secondary"
              onClick={() => handleReview('reviewed')}
              disabled={reviewReport.isPending}
            >
              <Eye className="w-4 h-4 mr-2" />
              Mark Reviewed
            </Button>
            <Button
              onClick={() => handleReview('resolved')}
              disabled={reviewReport.isPending}
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Remove Content Dialog */}
      <Dialog open={actionDialog === 'remove'} onOpenChange={() => setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Remove Content</DialogTitle>
            <DialogDescription>
              This will remove the {selectedReport?.post_id ? 'thread' : 'comment'} from public view. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Textarea
              placeholder="Reason for removal (shown to the author)..."
              value={removalReason}
              onChange={(e) => setRemovalReason(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemove}
              disabled={removeContent.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove Content
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface ReportCardProps {
  report: Report;
  onSelect: () => void;
  onReview: () => void;
  onRemove: () => void;
  onLock?: () => void;
}

function ReportCard({ report, onSelect, onReview, onRemove, onLock }: ReportCardProps) {
  const isPost = !!report.post_id;
  const content = isPost ? report.post : report.comment;
  const contentPreview = isPost 
    ? (report.post?.content || '').slice(0, 200)
    : (report.comment?.content || '').slice(0, 200);

  return (
    <Card className="hover:border-accent/50 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-lg",
              isPost ? "bg-primary/10" : "bg-accent/10"
            )}>
              {isPost ? (
                <FileText className="w-5 h-5 text-primary" />
              ) : (
                <MessageCircle className="w-5 h-5 text-accent" />
              )}
            </div>
            <div>
              <CardTitle className="text-base">
                {isPost ? report.post?.title || 'Untitled Post' : 'Comment'}
              </CardTitle>
              <CardDescription className="text-xs">
                by {content?.author?.display_name || content?.author?.username || 'Unknown'}
              </CardDescription>
            </div>
          </div>
          <Badge className={cn("border", statusColors[report.status])}>
            {report.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30">
              <AlertTriangle className="w-3 h-3 mr-1" />
              {reasonLabels[report.reason] || report.reason}
            </Badge>
            <span className="text-xs text-muted-foreground">
              Reported {formatDistanceToNow(new Date(report.created_at), { addSuffix: true })}
            </span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {contentPreview}{contentPreview.length >= 200 && '...'}
          </p>

          {report.description && (
            <div className="p-3 bg-muted rounded-lg text-sm">
              <span className="font-medium">Reporter's note: </span>
              {report.description}
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-0 flex-wrap gap-2">
        {report.status === 'pending' && (
          <>
            <Button size="sm" variant="outline" onClick={onReview}>
              <Eye className="w-4 h-4 mr-1" />
              Review
            </Button>
            <Button size="sm" variant="destructive" onClick={onRemove}>
              <Trash2 className="w-4 h-4 mr-1" />
              Remove
            </Button>
            {onLock && (
              <Button size="sm" variant="secondary" onClick={onLock}>
                <Lock className="w-4 h-4 mr-1" />
                Lock Thread
              </Button>
            )}
          </>
        )}
        {report.status !== 'pending' && report.resolution_notes && (
          <p className="text-xs text-muted-foreground w-full">
            <span className="font-medium">Resolution: </span>
            {report.resolution_notes}
          </p>
        )}
      </CardFooter>
    </Card>
  );
}
