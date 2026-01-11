import { useState } from 'react';
import { Header } from '@/components/forum/Header';
import { CategorySidebar } from '@/components/forum/CategorySidebar';
import { PostList } from '@/components/forum/PostList';
import { PostDetail } from '@/components/forum/PostDetail';
import { TrendingTopics } from '@/components/forum/TrendingTopics';
import { HeroSection } from '@/components/forum/HeroSection';
import { MembershipCTA } from '@/components/forum/MembershipCTA';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { AuthModal } from '@/components/auth/AuthModal';
import { useCategories } from '@/hooks/useCategories';
import { usePosts, PostWithAuthor } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';

type SortOption = 'popular' | 'newest' | 'unanswered';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const { user, profile } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: posts = [], isLoading: postsLoading } = usePosts({
    categorySlug: selectedCategory,
    sortBy,
    searchQuery,
  });

  const showMembershipSection = user && profile?.membership_tier === 'free';

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
      />

      <main className="container mx-auto px-4 py-6">
        <EmailVerificationBanner />
        
        {/* Hero Section for non-logged-in users */}
        {!selectedPost && (
          <HeroSection onOpenSignUp={() => setAuthModalOpen(true)} />
        )}

        <div className="flex gap-6">
          {/* Left Sidebar - Categories */}
          {!selectedPost && (
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isLoading={categoriesLoading}
            />
          )}

          {/* Main Content */}
          {selectedPost ? (
            <PostDetail 
              post={selectedPost} 
              onBack={() => setSelectedPost(null)}
            />
          ) : (
            <>
              <PostList
                posts={posts}
                onSelectPost={setSelectedPost}
                sortBy={sortBy}
                onSortChange={setSortBy}
                isLoading={postsLoading}
              />
              
              {/* Right Sidebar - Trending */}
              <TrendingTopics />
            </>
          )}
        </div>

        {/* Membership CTA for free users */}
        {showMembershipSection && !selectedPost && (
          <MembershipCTA variant="full" />
        )}
      </main>

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode="signup"
      />
    </div>
  );
};

export default Index;
