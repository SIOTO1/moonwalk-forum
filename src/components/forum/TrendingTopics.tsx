import { TrendingUp, Flame, Award, ArrowUpRight, Crown, Star, Medal } from 'lucide-react';
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
  { tag: 'dock-maintenance', posts: 14, hot: true },
  { tag: 'contract-templates', posts: 12, hot: false },
  { tag: 'seasonal-staffing', posts: 11, hot: false },
  { tag: 'fuel-dock-regs', posts: 9, hot: false },
  { tag: 'customer-retention', posts: 8, hot: false },
];

const topContributors = [
  { name: 'Sarah Chen', role: 'Industry Expert', karma: '5.2K', avatar: 'SC' },
  { name: 'Alex Rivera', role: 'Moderator', karma: '8.9K', avatar: 'AR' },
  { name: 'Mike Johnson', role: 'Verified Vendor', karma: '2.4K', avatar: 'MJ' },
];

const rankIcons = [Crown, Star, Medal];
const rankColors = [
  'bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/20',
  'bg-slate-400/15 text-slate-500 ring-1 ring-slate-400/20',
  'bg-orange-500/15 text-orange-600 ring-1 ring-orange-500/20',
];

export function TrendingTopics() {
  const { user, profile } = useAuth();
  const showMembershipCTA = !user || profile?.membership_tier === 'free';

  return (
    <aside className="w-80 shrink-0 hidden xl:block">
      <div className="sticky top-20 space-y-5">
        {/* Trending Topics */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
            <TrendingUp className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Trending Topics</h3>
          </div>
          <div className="p-2">
            {trendingTopics.map((topic, index) => (
              <button
                key={topic.tag}
                className="w-full flex items-center justify-between text-left hover:bg-secondary rounded-lg px-3 py-2.5 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold shrink-0 transition-all duration-200",
                    index === 0 && "bg-primary/15 text-primary",
                    index === 1 && "bg-secondary text-foreground",
                    index === 2 && "bg-secondary text-foreground",
                    index > 2 && "bg-transparent text-muted-foreground"
                  )}>
                    {index + 1}
                  </span>
                  <span className="text-foreground text-sm font-medium truncate group-hover:text-primary transition-colors duration-200">
                    #{topic.tag}
                  </span>
                  {topic.hot && (
                    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-500 shrink-0">
                      <Flame className="w-3 h-3" />
                      <span className="text-[10px] font-semibold">HOT</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  <span className="text-xs text-muted-foreground font-medium">
                    {topic.posts} posts
                  </span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <RecentActivityFeed />

        {/* Top Contributors */}
        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-secondary/30">
            <Award className="w-4 h-4 text-primary" />
            <h3 className="font-display font-semibold text-sm">Top Contributors</h3>
          </div>
          <div className="p-2">
            {topContributors.map((contributor, index) => {
              const RankIcon = rankIcons[index] || Medal;
              return (
                <div 
                  key={contributor.name} 
                  className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary transition-all duration-200 cursor-pointer group"
                >
                  <div className="relative">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-transform duration-200 group-hover:scale-105",
                      rankColors[index]
                    )}>
                      {contributor.avatar}
                    </div>
                    <div className={cn(
                      "absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
                      index === 0 && "bg-amber-500",
                      index === 1 && "bg-slate-400",
                      index === 2 && "bg-orange-500"
                    )}>
                      <RankIcon className="w-2.5 h-2.5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate group-hover:text-primary transition-colors duration-200">
                      {contributor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{contributor.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-primary">{contributor.karma}</span>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">karma</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Membership CTA */}
        {showMembershipCTA && <MembershipCTA variant="sidebar" />}
      </div>
    </aside>
  );
}
