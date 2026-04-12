import { MessageCircle, ThumbsUp, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

interface Activity {
  id: string;
  type: 'reply' | 'vote' | 'accepted';
  user: string;
  content: string;
  thread: string;
  threadSlug: string;
  time: string;
}

function useRecentActivity() {
  return useQuery({
    queryKey: ['recent-activity'],
    queryFn: async (): Promise<Activity[]> => {
      const activities: Activity[] = [];

      // Fetch recent comments (replies)
      const { data: recentComments } = await supabase
        .from('comments')
        .select(`
          id,
          created_at,
          post:posts!comments_post_id_fkey(title, slug),
          author:profiles!comments_author_id_fkey(display_name, username)
        `)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentComments) {
        for (const comment of recentComments) {
          const post = comment.post as any;
          const author = comment.author as any;
          if (post && author) {
            activities.push({
              id: `comment-${comment.id}`,
              type: 'reply',
              user: author.display_name || author.username || 'Anonymous',
              content: 'replied to',
              thread: post.title,
              threadSlug: post.slug || comment.id,
              time: comment.created_at,
            });
          }
        }
      }

      // Fetch recent votes
      const { data: recentVotes } = await supabase
        .from('votes')
        .select(`
          id,
          created_at,
          vote_type,
          post:posts!votes_post_id_fkey(title, slug),
          user:profiles!votes_user_id_fkey(display_name, username)
        `)
        .eq('vote_type', 1)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentVotes) {
        for (const vote of recentVotes) {
          const post = vote.post as any;
          const user = vote.user as any;
          if (post && user) {
            activities.push({
              id: `vote-${vote.id}`,
              type: 'vote',
              user: user.display_name || user.username || 'Anonymous',
              content: 'upvoted',
              thread: post.title,
              threadSlug: post.slug || vote.id,
              time: vote.created_at,
            });
          }
        }
      }

      // Sort all activities by time (most recent first) and take top 5
      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      return activities.slice(0, 5);
    },
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 60, // Refresh every minute
  });
}

const activityIcons = {
  reply: MessageCircle,
  vote: ThumbsUp,
  accepted: CheckCircle,
};

const activityColors = {
  reply: 'text-blue-400',
  vote: 'text-accent',
  accepted: 'text-success',
};

export function RecentActivityFeed() {
  const { data: activities, isLoading } = useRecentActivity();

  return (
    <div className="forum-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-2">
              <Skeleton className="w-4 h-4 mt-0.5 rounded" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))
        ) : activities && activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];
            
            return (
              <Link 
                key={activity.id}
                to={`/thread/${activity.threadSlug}`}
                className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer block"
              >
                <div className={`mt-0.5 ${colorClass}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium text-foreground">{activity.user}</span>
                    {' '}
                    <span className="text-muted-foreground">{activity.content}</span>
                  </p>
                  <p className="text-sm text-foreground font-medium truncate">
                    {activity.thread}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.time), { addSuffix: true })}
                  </p>
                </div>
              </Link>
            );
          })
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No recent activity yet. Be the first to post!
          </p>
        )}
      </div>
    </div>
  );
}
