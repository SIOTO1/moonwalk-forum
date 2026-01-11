import { cn } from '@/lib/utils';
import { Category } from '@/hooks/useCategories';
import { useAuth } from '@/contexts/AuthContext';
import { Lock, Rocket, Shield, Wrench, FileText, TrendingUp, Users, AlertTriangle, MapPin, MessageCircle, Star, Crown, ShieldCheck, Download, Home, Sparkles } from 'lucide-react';
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
        <div className="sticky top-20 space-y-4">
          <Skeleton className="h-11 w-full rounded-xl" />
          <div className="space-y-1.5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="w-64 shrink-0 hidden lg:block">
      <div className="sticky top-20 space-y-5">
        {/* All Posts */}
        <button
          onClick={() => onSelectCategory(null)}
          className={cn(
            "w-full flex items-center gap-3 text-left px-4 py-3 rounded-xl font-medium transition-all duration-200",
            selectedCategory === null
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary"
          )}
        >
          <Home className={cn(
            "w-5 h-5 transition-transform duration-200",
            selectedCategory === null && "scale-110"
          )} />
          <span>All Discussions</span>
        </button>

        {/* Public Categories */}
        <div className="space-y-2">
          <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Forums
          </h3>
          <div className="space-y-0.5">
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
          <div className="space-y-2">
            <h3 className="px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" />
              Members Only
            </h3>
            <div className="space-y-0.5">
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
        <div className="bg-secondary/50 rounded-xl p-4 border border-border/50">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            Community Stats
          </h3>
          <div className="space-y-2.5 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Members</span>
              <span className="font-semibold text-foreground">12,453</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Posts Today</span>
              <span className="font-semibold text-foreground">47</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Active Now</span>
              <span className="font-semibold text-success flex items-center gap-1.5">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                234
              </span>
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
        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 text-left group",
        isSelected
          ? "bg-primary/10 text-primary border-l-2 border-primary"
          : hasAccess 
            ? "text-muted-foreground hover:text-foreground hover:bg-secondary hover:pl-4"
            : "text-muted-foreground/50 cursor-not-allowed"
      )}
      disabled={!hasAccess}
    >
      <span className="flex items-center gap-2.5 min-w-0">
        <span 
          className={cn(
            "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
            isSelected 
              ? "bg-primary/15" 
              : "bg-secondary group-hover:bg-primary/10"
          )}
        >
          <IconComponent 
            className={cn(
              "w-4 h-4 transition-transform duration-200",
              isSelected && "scale-110"
            )} 
            style={{ color: category.color }} 
          />
        </span>
        <span className={cn(
          "font-medium truncate text-sm",
          isSelected && "text-primary"
        )}>
          {category.name}
        </span>
      </span>
      <span className="flex items-center gap-1.5 shrink-0">
        {!hasAccess && tierLabel && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-primary/10 text-primary font-semibold">
            {tierLabel}
          </span>
        )}
        {hasAccess && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-md font-medium transition-colors duration-200",
            isSelected 
              ? "bg-primary/20 text-primary" 
              : "bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
          )}>
            {category.post_count}
          </span>
        )}
        {!hasAccess && <Lock className="w-3.5 h-3.5" />}
      </span>
    </button>
  );
}
