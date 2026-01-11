import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Header } from '@/components/forum/Header';
import { ModerationQueue } from '@/components/moderation/ModerationQueue';
import { ShadowBanManager } from '@/components/moderation/ShadowBanManager';
import { ModerationLogs } from '@/components/moderation/ModerationLogs';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  AlertTriangle, 
  Flag, 
  Ghost, 
  History,
  Shield
} from 'lucide-react';
import { Navigate } from 'react-router-dom';

export default function Moderation() {
  const { canModerate, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-accent"></div>
      </div>
    );
  }

  if (!canModerate) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery}
        selectedCategory={null}
      />

      <main className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold flex items-center gap-3">
            <Shield className="w-8 h-8 text-accent" />
            Moderation Panel
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage reports, bans, and maintain community standards
          </p>
        </div>

        <Tabs defaultValue="queue" className="space-y-6">
          <TabsList className="grid grid-cols-3 w-full max-w-lg">
            <TabsTrigger value="queue" className="gap-2">
              <Flag className="w-4 h-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="bans" className="gap-2">
              <Ghost className="w-4 h-4" />
              Shadow Bans
            </TabsTrigger>
            <TabsTrigger value="logs" className="gap-2">
              <History className="w-4 h-4" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="queue">
            <ModerationQueue />
          </TabsContent>

          <TabsContent value="bans">
            <ShadowBanManager />
          </TabsContent>

          <TabsContent value="logs">
            <ModerationLogs />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
