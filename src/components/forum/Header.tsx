import { useState } from 'react';
import { Search, Bell, Plus, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Logo } from './Logo';
import { useAuth } from '@/contexts/AuthContext';
import { UserMenu } from '@/components/auth/UserMenu';
import { AuthModal } from '@/components/auth/AuthModal';

interface HeaderProps {
  onSearchChange: (query: string) => void;
  searchQuery: string;
}

export function Header({ onSearchChange, searchQuery }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const { user, loading, canPost } = useAuth();

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
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Logo size="md" />

            {/* Search - Desktop */}
            <div className="hidden md:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="search-input pl-11"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Mobile Search Toggle */}
              <Button variant="ghost" size="icon" className="md:hidden">
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

                  {canPost && (
                    <Button className="hidden sm:flex gap-2 gradient-accent text-accent-foreground hover:opacity-90">
                      <Plus className="w-4 h-4" />
                      New Post
                    </Button>
                  )}

                  <UserMenu />
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button variant="ghost" className="hidden sm:flex" onClick={openSignIn}>
                    Sign In
                  </Button>
                  <Button 
                    className="gradient-accent text-accent-foreground hover:opacity-90"
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
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input pl-11"
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
