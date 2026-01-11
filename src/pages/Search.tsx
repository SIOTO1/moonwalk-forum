import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search as SearchIcon, FileText, MessageSquare, Folder, Clock, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSearch, SearchResult } from '@/hooks/useSearch';
import { SEOHead } from '@/components/seo/SEOHead';
import { Logo } from '@/components/forum/Logo';
import { formatDistanceToNow } from 'date-fns';

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
      if (query) {
        setSearchParams({ q: query });
      } else {
        setSearchParams({});
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, setSearchParams]);

  const { data: results, isLoading } = useSearch(debouncedQuery);

  const getResultIcon = (type: SearchResult['result_type']) => {
    switch (type) {
      case 'post':
        return <FileText className="w-5 h-5 text-accent" />;
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-muted-foreground" />;
      case 'category':
        return <Folder className="w-5 h-5 text-primary" />;
    }
  };

  const getResultLink = (result: SearchResult) => {
    switch (result.result_type) {
      case 'category':
        return `/?category=${result.category_slug}`;
      case 'post':
      case 'comment':
        return `/thread/${result.slug}`;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-accent/30 text-foreground rounded px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const publicResults = results?.filter(r => !r.is_private) || [];
  const privateResults = results?.filter(r => r.is_private) || [];

  return (
    <>
      <SEOHead
        title={debouncedQuery ? `Search: ${debouncedQuery} - Moonwalk Forum` : 'Search - Moonwalk Forum'}
        description="Search threads, comments, and categories in the Moonwalk Forum community."
        noindex={true} // Search pages should not be indexed
      />

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
          <div className="container mx-auto px-4">
            <div className="flex items-center h-16 gap-4">
              <Link to="/">
                <Logo size="md" />
              </Link>
              <Button variant="ghost" size="sm" asChild className="gap-2">
                <Link to="/">
                  <ArrowLeft className="w-4 h-4" />
                  Back to Forum
                </Link>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Search Input */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-4">Search Forum</h1>
            <div className="relative">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search threads, comments, and categories..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="search-input pl-12 text-lg py-4"
                autoFocus
              />
            </div>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="forum-card p-4 animate-pulse">
                  <div className="h-5 bg-muted rounded w-3/4 mb-2" />
                  <div className="h-4 bg-muted rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : debouncedQuery.length >= 2 ? (
            <div className="space-y-6">
              {results && results.length > 0 ? (
                <>
                  <p className="text-muted-foreground">
                    Found {results.length} result{results.length !== 1 ? 's' : ''} for "{debouncedQuery}"
                  </p>

                  {/* Public Results */}
                  {publicResults.length > 0 && (
                    <div className="space-y-3">
                      {publicResults.map((result) => (
                        <Link
                          key={`${result.result_type}-${result.id}`}
                          to={getResultLink(result)}
                          className="forum-card p-4 block hover:border-accent/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {getResultIcon(result.result_type)}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                  {result.result_type}
                                </span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <span className="text-xs text-accent">
                                  {result.category_name}
                                </span>
                              </div>
                              <h3 className="font-semibold text-foreground mb-1">
                                {highlightMatch(result.title, debouncedQuery)}
                              </h3>
                              {result.content && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {highlightMatch(result.content, debouncedQuery)}
                                </p>
                              )}
                              <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                <Clock className="w-3 h-3" />
                                {formatDistanceToNow(new Date(result.created_at), { addSuffix: true })}
                                {result.author_username && (
                                  <>
                                    <span>•</span>
                                    <span>by {result.author_username}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Private Results */}
                  {privateResults.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                        🔒 Members Only Results ({privateResults.length})
                      </h3>
                      <div className="space-y-3 opacity-75">
                        {privateResults.map((result) => (
                          <Link
                            key={`${result.result_type}-${result.id}`}
                            to={getResultLink(result)}
                            className="forum-card p-4 block hover:border-accent/50 transition-colors"
                          >
                            <div className="flex items-start gap-3">
                              {getResultIcon(result.result_type)}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-xs uppercase tracking-wider text-muted-foreground">
                                    {result.result_type}
                                  </span>
                                  <span className="text-xs text-muted-foreground">•</span>
                                  <span className="text-xs text-accent">
                                    {result.category_name}
                                  </span>
                                  <span className="text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded">
                                    Premium
                                  </span>
                                </div>
                                <h3 className="font-semibold text-foreground mb-1">
                                  {highlightMatch(result.title, debouncedQuery)}
                                </h3>
                                {result.content && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {highlightMatch(result.content, debouncedQuery)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No results found</h3>
                  <p className="text-muted-foreground">
                    Try different keywords or check your spelling
                  </p>
                </div>
              )}
            </div>
          ) : debouncedQuery.length > 0 ? (
            <p className="text-muted-foreground">Enter at least 2 characters to search</p>
          ) : (
            <div className="text-center py-12">
              <SearchIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Search the Forum</h3>
              <p className="text-muted-foreground">
                Find threads, comments, and categories
              </p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
