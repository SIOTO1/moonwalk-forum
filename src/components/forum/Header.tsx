import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, X, User, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';
import { CreateThreadDialog } from './CreateThreadDialog';

interface HeaderProps {
  onSearchChange?: (query: string) => void;
  searchQuery?: string;
  selectedCategory?: string | null;
}

export function Header({ onSearchChange, searchQuery = '', selectedCategory }: HeaderProps) {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading, canPost, canModerate } = useAuth();

  const handleSearchFocus = () => {
    navigate('/search');
  };

  const openSignIn = () => {
    setAuthModalMode('signin');
    setAuthModalOpen(true);
  };

  const openSignUp = () => {
    setAuthModalMode('signup');
    setAuthModalOpen(true);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-background/98 backdrop-blur-md border-b border-border/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="hover:opacity-80 transition-opacity">
              <Logo size="md" />
            </Link>

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange?.(e.target.value)}
                  onFocus={handleSearchFocus}
                  className="search-input pl-11 cursor-pointer"
                  readOnly
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <Button variant="ghost" size="icon" className="md:hidden" onClick={handleSearchFocus}>
                <Search className="w-5 h-5" />
              </Button>

              {loading ? (
                <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
              ) : user ? (
                <>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-accent rounded-full" />
                  </Button>

                  {canModerate && (
                    <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
                      <Link to="/moderation">
                        <Shield className="w-5 h-5" />
                      </Link>
                    </Button>
                  )}

                  {canPost && (
                    <div className="hidden sm:block">
                      <CreateThreadDialog defaultCategorySlug={selectedCategory} />
                    </div>
                  )}

                  <UserMenu />
                </>
              ) : (
                <div className="flex items-center gap-3">
                  <Button 
                    variant="ghost" 
                    className="hidden sm:flex font-medium text-muted-foreground hover:text-foreground" 
                    onClick={openSignIn}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium shadow-sm"
                    onClick={openSignUp}
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <User className="sm:hidden w-4 h-4" />
                  </Button>
                </div>
              )}

              {/* Mobile Menu */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile Search */}
          <div className="md:hidden pb-3">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search discussions..."
                value={searchQuery}
                onFocus={handleSearchFocus}
                className="search-input pl-11 cursor-pointer"
                readOnly
              />
            </div>
          </div>
        </div>
      </header>

      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authModalMode}
      />
    </>
  );
}
