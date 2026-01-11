import { TrendingUp, Flame, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecentActivityFeed } from './RecentActivityFeed';
import { MembershipCTA } from './MembershipCTA';
import { useAuth } from '@/contexts/AuthContext';

const trendingTopics = [
  { tag: 'insurance-rates-2024', posts: 34, hot: true },
  { tag: 'winter-storage-tips', posts: 28, hot: false },
  { tag: 'slide-anchor-debate', posts: 21, hot: true },
  { tag: 'pricing-strategies', posts: 19, hot: false },
  { tag: 'tent-permits', posts: 15, hot: false },
];

const topContributors = [
  { name: 'Sarah Chen', role: 'Industry Expert', karma: '5.2K', avatar: 'SC' },
  { name: 'Alex Rivera', role: 'Moderator', karma: '8.9K', avatar: 'AR' },
  { name: 'Mike Johnson', role: 'Verified Vendor', karma: '2.4K', avatar: 'MJ' },
];

export function TrendingTopics() {
  const { user, profile } = useAuth();
  const showMembershipCTA = !user || profile?.membership_tier === 'free';

  return (
    <aside className="w-80 shrink-0 hidden xl:block">
      <div className="sticky top-20 space-y-5">
        {/* Trending Topics */}
        <div className="forum-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold">Trending Topics</h3>
          </div>
          <div className="space-y-2">
            {trendingTopics.map((topic, index) => (
              <button
                key={topic.tag}
                className="w-full flex items-center justify-between text-left hover:bg-muted rounded-lg px-3 py-2 -mx-1 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                    index === 0 && "bg-accent/20 text-accent",
                    index === 1 && "bg-muted text-foreground",
                    index === 2 && "bg-muted text-foreground",
                    index > 2 && "text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium truncate group-hover:text-accent transition-colors">
                    #{topic.tag}
                  </span>
                  {topic.hot && <Flame className="w-3.5 h-3.5 text-orange-500 shrink-0" />}
                </div>
                <span className="text-xs text-muted-foreground shrink-0 ml-2">
                  {topic.posts}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed />

        {/* Top Contributors */}
        <div className="forum-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold">Top Contributors</h3>
          </div>
          <div className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div 
                key={contributor.name} 
                className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 && "bg-amber-500/20 text-amber-500 ring-2 ring-amber-500/30",
                  index === 1 && "bg-slate-400/20 text-slate-400",
                  index === 2 && "bg-orange-600/20 text-orange-600"
                )}>
                  {contributor.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{contributor.name}</p>
                  <p className="text-xs text-muted-foreground">{contributor.role}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-accent">{contributor.karma}</span>
                  <p className="text-[10px] text-muted-foreground">karma</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Membership CTA */}
        {showMembershipCTA && <MembershipCTA variant="sidebar" />}
      </div>
    </aside>
  );
}
