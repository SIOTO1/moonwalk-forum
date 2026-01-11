import { cn } from '@/lib/utils';
import { Category } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Rocket, Shield, Wrench, FileText, TrendingUp, Users, AlertTriangle, MapPin, MessageCircle, Star, Crown, ShieldCheck, Download } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  isLoading?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'rocket': Rocket,
  'shield': Shield,
  'wrench': Wrench,
  'file-text': FileText,
  'trending-up': TrendingUp,
  'users': Users,
  'alert-triangle': AlertTriangle,
  'map-pin': MapPin,
  'message-circle': MessageCircle,
  'star': Star,
  'crown': Crown,
  'shield-check': ShieldCheck,
  'download': Download,
};

export function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  isLoading = false,
}: CategorySidebarProps) {
  const { canAccessPremium, profile } = useAuth();
  
  const publicCategories = categories.filter(c => !c.is_private);
  const privateCategories = categories.filter(c => c.is_private);

  if (isLoading) {
    return (
      <aside className="w-64 shrink-0 hidden lg:block">
        <div className="sticky top-20 space-y-6">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-6">
        {/* All Posts */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full text-left px-4 py-2.5 rounded-lg font-medium transition-all",
            selectedCategory === null
              ? "bg-accent text-accent-foreground"
              : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          🏠 All Discussions
        </button>

        {/* Public Categories */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Forums
          </h3>
          <div className="space-y-1">
            {publicCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.slug}
                onClick={() => onSelectCategory(category.slug)}
              />
            ))}
          </div>
        </div>

        {/* Private Categories */}
        {privateCategories.length > 0 && (
          <div>
            <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lock className="w-3 h-3" />
              Members Only
            </h3>
            <div className="space-y-1">
              {privateCategories.map((category) => (
                <CategoryButton
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.slug}
                  onClick={() => onSelectCategory(category.slug)}
                  isLocked={!canAccessPremium && category.required_tier !== 'free'}
                  requiredTier={category.required_tier}
                  userTier={profile?.membership_tier}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="forum-card p-4">
          <h3 className="font-semibold mb-3">Community Stats</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Members</span>
              <span className="font-medium">12,453</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Posts Today</span>
              <span className="font-medium">47</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Active Now</span>
              <span className="font-medium text-success">234</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

interface CategoryButtonProps {
  category: Category;
  isSelected: boolean;
  onClick: () => void;
  isLocked?: boolean;
  requiredTier?: 'free' | 'pro' | 'elite' | null;
  userTier?: 'free' | 'pro' | 'elite';
}

function CategoryButton({ 
  category, 
  isSelected, 
  onClick, 
  isLocked = false,
  requiredTier,
  userTier = 'free',
}: CategoryButtonProps) {
  const IconComponent = iconMap[category.icon] || FileText;
  
  // Check if user has access based on tier
  const hasAccess = !isLocked || 
    (requiredTier === 'pro' && (userTier === 'pro' || userTier === 'elite')) ||
    (requiredTier === 'elite' && userTier === 'elite');

  const tierLabel = requiredTier === 'elite' ? 'Elite' : requiredTier === 'pro' ? 'Pro+' : null;

  return (
    <button
      onClick={hasAccess ? onClick : undefined}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left",
        isSelected
          ? "bg-accent text-accent-foreground"
          : hasAccess 
            ? "text-muted-foreground hover:text-foreground hover:bg-muted"
            : "text-muted-foreground/50 cursor-not-allowed"
      )}
      disabled={!hasAccess}
    >
      <span className="flex items-center gap-2 min-w-0">
        <IconComponent className="w-4 h-4 shrink-0" style={{ color: category.color }} />
        <span className="font-medium truncate text-sm">{category.name}</span>
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        {!hasAccess && tierLabel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-accent/20 text-accent font-semibold">
            {tierLabel}
          </span>
        )}
        {hasAccess && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            isSelected ? "bg-accent-foreground/20" : "bg-muted"
          )}>
            {category.post_count}
          </span>
        )}
        {!hasAccess && <Lock className="w-3 h-3" />}
      </span>
    </button>
  );
}
