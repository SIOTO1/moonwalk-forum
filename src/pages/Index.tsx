import { useState, useMemo } from 'react';
import { Header } from '@/components/forum/Header';
import { CategorySidebar } from '@/components/forum/CategorySidebar';
import { PostList } from '@/components/forum/PostList';
import { PostDetail } from '@/components/forum/PostDetail';
import { TrendingTopics } from '@/components/forum/TrendingTopics';
import { mockCategories, mockPosts } from '@/data/mockData';
import { Post } from '@/types/forum';

type SortOption = 'popular' | 'newest' | 'unanswered';

const Index = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  const filteredPosts = useMemo(() => {
    let posts = [...mockPosts];

    // Filter by category
    if (selectedCategory) {
      posts = posts.filter(post => post.category.slug === selectedCategory);
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      posts = posts.filter(post => 
        post.title.toLowerCase().includes(query) ||
        post.content.toLowerCase().includes(query) ||
        post.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        break;
      case 'newest':
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'unanswered':
        posts = posts.filter(post => !post.hasAcceptedAnswer);
        posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
    }

    // Pinned posts always first
    const pinned = posts.filter(p => p.isPinned);
    const unpinned = posts.filter(p => !p.isPinned);
    return [...pinned, ...unpinned];
  }, [selectedCategory, searchQuery, sortBy]);

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
              categories={mockCategories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
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
                posts={filteredPosts}
                onSelectPost={setSelectedPost}
                sortBy={sortBy}
                onSortChange={setSortBy}
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
