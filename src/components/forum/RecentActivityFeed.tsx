import { MessageCircle, ThumbsUp, CheckCircle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface Activity {
  id: string;
  type: 'reply' | 'vote' | 'accepted';
  user: string;
  content: string;
  thread: string;
  time: Date;
}

const recentActivity: Activity[] = [
  {
    id: '1',
    type: 'reply',
    user: 'Sarah Chen',
    content: 'replied to',
    thread: 'Best practices for winterizing inflatables',
    time: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: '2',
    type: 'accepted',
    user: 'Mike Johnson',
    content: 'answer was accepted in',
    thread: 'Insurance requirements for large events',
    time: new Date(Date.now() - 12 * 60 * 1000),
  },
  {
    id: '3',
    type: 'vote',
    user: 'Alex Rivera',
    content: 'upvoted',
    thread: 'New DOT regulations for trailer transport',
    time: new Date(Date.now() - 25 * 60 * 1000),
  },
  {
    id: '4',
    type: 'reply',
    user: 'Jessica Park',
    content: 'replied to',
    thread: 'How to handle last-minute cancellations',
    time: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: '5',
    type: 'accepted',
    user: 'David Lee',
    content: 'answer was accepted in',
    thread: 'Pricing strategies for peak season',
    time: new Date(Date.now() - 90 * 60 * 1000),
  },
];

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
  return (
    <div className="forum-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold">Recent Activity</h3>
      </div>
      <div className="space-y-3">
        {recentActivity.map((activity) => {
          const Icon = activityIcons[activity.type];
          const colorClass = activityColors[activity.type];
          
          return (
            <div 
              key={activity.id}
              className="flex items-start gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
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
                  {formatDistanceToNow(activity.time, { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
