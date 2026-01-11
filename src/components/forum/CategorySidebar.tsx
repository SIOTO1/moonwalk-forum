import { Category } from '@/types/forum';
import { cn } from '@/lib/utils';

interface CategorySidebarProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
}

export function CategorySidebar({ 
  categories, 
  selectedCategory, 
  onSelectCategory 
}: CategorySidebarProps) {
  const equipmentCategories = categories.filter(c => c.type === 'equipment');
  const businessCategories = categories.filter(c => c.type === 'business');

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

        {/* Equipment Categories */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Equipment
          </h3>
          <div className="space-y-1">
            {equipmentCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.slug}
                onClick={() => onSelectCategory(category.slug)}
              />
            ))}
          </div>
        </div>

        {/* Business Categories */}
        <div>
          <h3 className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Business
          </h3>
          <div className="space-y-1">
            {businessCategories.map((category) => (
              <CategoryButton
                key={category.id}
                category={category}
                isSelected={selectedCategory === category.slug}
                onClick={() => onSelectCategory(category.slug)}
              />
            ))}
          </div>
        </div>

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
}

function CategoryButton({ category, isSelected, onClick }: CategoryButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left",
        isSelected
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      )}
    >
      <span className="flex items-center gap-2">
        <span>{category.icon}</span>
        <span className="font-medium">{category.name}</span>
      </span>
      <span className={cn(
        "text-xs px-2 py-0.5 rounded-full",
        isSelected ? "bg-accent-foreground/20" : "bg-muted"
      )}>
        {category.postCount}
      </span>
    </button>
  );
}
