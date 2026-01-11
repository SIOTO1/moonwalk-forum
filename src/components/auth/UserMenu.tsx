import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, Settings, FileText, LogOut, Shield, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MembershipBadge } from './MembershipBadge';

export function UserMenu() {
  const { profile, signOut, canModerate, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (!profile) return null;

  const initials = profile.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.username.slice(0, 2).toUpperCase();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10 border-2 border-accent/30">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-64" align="end" forceMount>
        <div className="flex items-center gap-3 p-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <p className="text-sm font-semibold">{profile.display_name || profile.username}</p>
            <p className="text-xs text-muted-foreground">@{profile.username}</p>
            <MembershipBadge tier={profile.membership_tier} size="sm" />
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate(`/profile/${profile.username}`)}>
          <User className="mr-2 h-4 w-4" />
          View Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/my-posts')}>
          <FileText className="mr-2 h-4 w-4" />
          My Posts
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        {canModerate && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/moderation')}>
              <Shield className="mr-2 h-4 w-4" />
              Moderation
            </DropdownMenuItem>
          </>
        )}
        {isAdmin && (
          <DropdownMenuItem onClick={() => navigate('/admin')}>
            <Crown className="mr-2 h-4 w-4" />
            Admin Panel
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
