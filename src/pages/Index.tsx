import { useState } from 'react';
import { Header } from '@/components/forum/Header';
import { CategorySidebar } from '@/components/forum/CategorySidebar';
import { PostList } from '@/components/forum/PostList';
import { PostDetail } from '@/components/forum/PostDetail';
import { TrendingTopics } from '@/components/forum/TrendingTopics';
import { useCategories } from '@/hooks/useCategories';
import { usePosts, PostWithAuthor } from '@/hooks/usePosts';

type SortOption = 'popular' | 'newest' | 'unanswered';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedPost, setSelectedPost] = useState<PostWithAuthor | null>(null);

  const { data: categories = [], isLoading: categoriesLoading } = useCategories();
  const { data: posts = [], isLoading: postsLoading } = usePosts({
    categorySlug: selectedCategory,
    sortBy,
    searchQuery,
  });

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
      />

      <main className="container mx-auto px-4 py-6">
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
      </main>
    </div>
  );
};

export default Index;
