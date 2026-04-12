import { useState, useEffect } from 'react';
import { Header } from '@/components/forum/Header';
import { CategorySidebar } from '@/components/forum/CategorySidebar';
import { PostList } from '@/components/forum/PostList';
import { TrendingTopics } from '@/components/forum/TrendingTopics';
import { HeroSection } from '@/components/forum/HeroSection';
import { MembershipCTA } from '@/components/forum/MembershipCTA';
import { Footer } from '@/components/forum/Footer';
import { EmailVerificationBanner } from '@/components/auth/EmailVerificationBanner';
import { AuthModal } from '@/components/auth/AuthModal';
import { WelcomeModal } from '@/components/onboarding/WelcomeModal';
import { SEOHead } from '@/components/seo/SEOHead';
import { CookieConsent } from '@/components/cookies/CookieConsent';
import { ScrollToTop } from '@/components/ui/scroll-to-top';
import { useCategories } from '@/hooks/useCategories';
import { usePosts } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeUpdates } from '@/hooks/useRealtimeUpdates';

type SortOption = 'popular' | 'newest' | 'unanswered';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [welcomeModalOpen, setWelcomeModalOpen] = useState(false);

  const { user, profile, loading } = useAuth();
  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { 
    data: postsData, 
    isLoading: postsLoading,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    prefetchNextPage,
  } = usePosts({
    categorySlug: selectedCategory,
    sortBy,
    searchQuery,
  });

  // Flatten paginated posts
  const posts = postsData?.pages.flatMap(page => page.posts) ?? [];

  // Subscribe to realtime updates for votes and comments
  useRealtimeUpdates();

  // Show welcome modal for new users who haven't completed onboarding
  useEffect(() => {
    if (!loading && user && profile && !profile.onboarding_completed) {
      setWelcomeModalOpen(true);
    }
  }, [loading, user, profile]);

  const showMembershipSection = user && profile?.membership_tier === 'free';
  
  // Get selected category info for SEO
  const selectedCategoryInfo = selectedCategory 
    ? categories.find(c => c.slug === selectedCategory) 
    : null;

  const pageTitle = selectedCategoryInfo
    ? `${selectedCategoryInfo.name} - Moonwalk Forum`
    : 'Moonwalk Forum - The Party Rental Industry\'s Premier Community';

  const pageDescription = selectedCategoryInfo?.description
    || 'Join the premier community for party rental operators and inflatable industry professionals. Discuss equipment, share experiences, and connect with experts.';

  return (
    <>
      <SEOHead 
        title={pageTitle}
        description={pageDescription}
        canonical={selectedCategory ? `${window.location.origin}/?category=${selectedCategory}` : window.location.origin}
      />
      
      <div className="min-h-screen bg-background flex flex-col">
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
        />

        <main className="container mx-auto px-4 py-6 flex-1">
          <EmailVerificationBanner />
          
          {/* Hero Section for non-logged-in users */}
          <HeroSection onOpenSignUp={() => setAuthModalOpen(true)} />

          <div id="forum-content" className="flex gap-6">
            {/* Left Sidebar - Categories */}
            <CategorySidebar
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              isLoading={categoriesLoading}
            />

            {/* Main Content */}
            <PostList
              posts={posts}
              sortBy={sortBy}
              onSortChange={setSortBy}
              isLoading={postsLoading}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={() => fetchNextPage()}
              onPrefetchNext={prefetchNextPage}
              categoryId={selectedCategoryInfo?.id}
            />
            
            {/* Right Sidebar - Trending */}
            <TrendingTopics />
          </div>

          {/* Membership CTA for free users */}
          {showMembershipSection && (
            <MembershipCTA variant="full" />
          )}
        </main>

        <Footer />

        <AuthModal 
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          defaultMode="signup"
        />

        <WelcomeModal 
          isOpen={welcomeModalOpen}
          onClose={() => setWelcomeModalOpen(false)}
        />

        <ScrollToTop />
        <CookieConsent />
      </div>
    </>
  );
};

export default Index;
