import { TrendingUp } from 'lucide-react';

const trendingTopics = [
  { tag: 'insurance-rates-2024', posts: 34 },
  { tag: 'winter-storage-tips', posts: 28 },
  { tag: 'slide-anchor-debate', posts: 21 },
  { tag: 'pricing-strategies', posts: 19 },
  { tag: 'tent-permits', posts: 15 },
];

export function TrendingTopics() {
  return (
    <aside className="w-72 shrink-0 hidden xl:block">
      <div className="sticky top-20 space-y-6">
        {/* Trending */}
        <div className="forum-card p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-accent" />
            <h3 className="font-display font-semibold">Trending Topics</h3>
          </div>
          <div className="space-y-3">
            {trendingTopics.map((topic, index) => (
              <button
                key={topic.tag}
                className="w-full flex items-center justify-between text-left hover:bg-muted rounded-md px-2 py-1.5 -mx-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm font-medium w-4">
                    {index + 1}
                  </span>
                  <span className="text-foreground font-medium">
                    #{topic.tag}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {topic.posts} posts
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Top Contributors */}
        <div className="forum-card p-4">
          <h3 className="font-display font-semibold mb-4">Top Contributors</h3>
          <div className="space-y-3">
            {[
              { name: 'Sarah Chen', role: 'Industry Expert', karma: '5.2K' },
              { name: 'Alex Rivera', role: 'Moderator', karma: '8.9K' },
              { name: 'Mike Johnson', role: 'Verified Vendor', karma: '2.4K' },
            ].map((user, index) => (
              <div key={user.name} className="flex items-center gap-3">
                <span className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                  index === 0 && "bg-amber-500/20 text-amber-500",
                  index === 1 && "bg-slate-400/20 text-slate-400",
                  index === 2 && "bg-orange-600/20 text-orange-600"
                )}>
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                <span className="text-xs font-medium text-accent">{user.karma}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pro Membership CTA */}
        <div className="forum-card p-4 border-accent/30 bg-accent/5">
          <h3 className="font-display font-semibold mb-2">Go Pro</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get verified status, priority support, and exclusive content.
          </p>
          <button className="w-full gradient-accent text-accent-foreground font-medium py-2 px-4 rounded-lg hover:opacity-90 transition-opacity">
            Learn More
          </button>
        </div>
      </div>
    </aside>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
