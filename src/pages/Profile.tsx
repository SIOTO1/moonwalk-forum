import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Header } from '@/components/forum/Header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MembershipBadge } from '@/components/auth/MembershipBadge';
import { RoleBadge } from '@/components/auth/RoleBadge';
import { UserBadgeDisplay } from '@/components/badges/UserBadgeDisplay';
import { BadgeManager } from '@/components/badges/BadgeManager';
import { NotificationSettings } from '@/components/settings/NotificationSettings';
import { useUserBadges } from '@/hooks/useBadges';
import { useAuth, Profile as ProfileType, AppRole } from '@/contexts/AuthContext';
import { ArrowLeft, Calendar, MessageSquare, FileText, Award, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const { profile: currentUserProfile, canModerate } = useAuth();
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const isOwnProfile = currentUserProfile?.username === username;
  
  // Fetch user badges
  const { data: userBadges = [] } = useUserBadges(profile?.user_id || null);
  const badges = userBadges.map(ub => ub.badge);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      setLoading(true);
      
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .maybeSingle();

      if (profileError || !profileData) {
        console.error('Error fetching profile:', profileError);
        setLoading(false);
        return;
      }

      setProfile(profileData as ProfileType);

      // Fetch roles
      const { data: rolesData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profileData.user_id);
      
      setRoles((rolesData || []).map(r => r.role as AppRole));

      setLoading(false);
    };

    fetchProfile();
  }, [username, currentUserProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </main>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="forum-card">
            <CardContent className="py-12 text-center">
              <h2 className="text-xl font-semibold mb-2">User Not Found</h2>
              <p className="text-muted-foreground mb-4">The profile you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Forum
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const initials = profile.display_name
    ? profile.display_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile.username.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          className="mb-6"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        {/* Profile Header Card */}
        <Card className="forum-card mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-32 h-32 border-4 border-accent/30">
                <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
                <AvatarFallback className="bg-primary text-primary-foreground text-3xl">
                  {initials}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1 text-center md:text-left">
                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                  <h1 className="text-2xl font-display font-bold">
                    {profile.display_name || profile.username}
                  </h1>
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <MembershipBadge tier={profile.membership_tier} />
                    {roles.filter(r => r !== 'user').map(role => (
                      <RoleBadge key={role} role={role} />
                    ))}
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-3">@{profile.username}</p>
                
                {/* User Badges */}
                {badges.length > 0 && (
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap mb-4">
                    {badges.map(badge => (
                      <UserBadgeDisplay key={badge.id} badge={badge} size="md" showLabel />
                    ))}
                  </div>
                )}
                
                {profile.bio && (
                  <p className="text-foreground/80 mb-4 max-w-xl">{profile.bio}</p>
                )}

                <div className="flex items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    Joined {format(new Date(profile.created_at), 'MMMM yyyy')}
                  </div>
                </div>

                <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                  {isOwnProfile && (
                    <Button 
                      variant="outline"
                      onClick={() => navigate('/settings')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                  
                  {canModerate && !isOwnProfile && (
                    <BadgeManager 
                      userId={profile.user_id} 
                      username={profile.display_name || profile.username} 
                    />
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card className="forum-card">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold text-accent">{profile.reputation}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                Reputation
              </div>
            </CardContent>
          </Card>
          
          <Card className="forum-card">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold">{profile.post_count}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <FileText className="w-4 h-4" />
                Posts
              </div>
            </CardContent>
          </Card>
          
          <Card className="forum-card">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold">{profile.reply_count}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <MessageSquare className="w-4 h-4" />
                Replies
              </div>
            </CardContent>
          </Card>
          
          <Card className="forum-card">
            <CardContent className="py-4 text-center">
              <div className="text-2xl font-bold">{badges.length}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Award className="w-4 h-4" />
                Badges
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Notification Settings - only show on own profile */}
        {isOwnProfile && (
          <div className="mb-6">
            <NotificationSettings />
          </div>
        )}

        {/* Activity Section - Placeholder */}
        <Card className="forum-card">
          <CardContent className="py-8 text-center text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Recent activity will appear here once posts are connected to the database.</p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
