import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { AlertTriangle, Shield, CheckCircle, Clock, Ban, RotateCcw, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Violation {
  id: string;
  user_id: string;
  violation_type: string;
  restriction_type: string;
  content_preview: string;
  detected_terms: string[];
  status: string;
  strike_number: number;
  expires_at: string | null;
  override_reason: string | null;
  created_at: string;
  profile?: {
    username: string;
    display_name: string | null;
  };
}

export function ViolationsManager() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [overrideReason, setOverrideReason] = useState('');

  const [showUserIdentity, setShowUserIdentity] = useState(false);

  const { data: violations = [], isLoading } = useQuery({
    queryKey: ['content-violations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_violations')
        .select(`
          *,
          profile:profiles!content_violations_user_id_fkey(username, display_name)
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as Violation[];
    },
  });

  const overrideMutation = useMutation({
    mutationFn: async ({ violationId, reason }: { violationId: string; reason: string }) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('override_violation', {
        _violation_id: violationId,
        _moderator_id: user.id,
        _reason: reason,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['content-violations'] });
      toast.success('Violation overridden successfully');
      setSelectedViolation(null);
      setOverrideReason('');
    },
    onError: (error: any) => {
      toast.error('Failed to override violation', {
        description: error.message,
      });
    },
  });

  const filteredViolations = violations.filter((v) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      v.profile?.username?.toLowerCase().includes(search) ||
      v.profile?.display_name?.toLowerCase().includes(search) ||
      v.violation_type.toLowerCase().includes(search) ||
      v.content_preview.toLowerCase().includes(search)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="destructive">Active</Badge>;
      case 'overridden':
        return <Badge variant="secondary">Overridden</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getRestrictionIcon = (type: string) => {
    switch (type) {
      case 'suspension':
        return <Ban className="w-4 h-4 text-destructive" />;
      case 'temp_restriction':
        return <Clock className="w-4 h-4 text-orange-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Content Violations
          </h2>
          <p className="text-sm text-muted-foreground">
            Review and manage content policy violations
          </p>
        </div>
        <Button
          variant={showUserIdentity ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowUserIdentity(!showUserIdentity)}
          className="flex items-center gap-2"
        >
          {showUserIdentity ? 'Hide' : 'Show'} User Identity
        </Button>
      </div>
      {!showUserIdentity && (
        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-3 text-sm text-blue-700 dark:text-blue-300">
          <strong>Blind Review Mode:</strong> User identities are hidden to prevent bias. Toggle "Show User Identity" only when needed for context.
        </div>
      )}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by user or content..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Restriction</TableHead>
              <TableHead>Strike</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Loading violations...
                </TableCell>
              </TableRow>
            ) : filteredViolations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  <CheckCircle className="w-8 h-8 text-success mx-auto mb-2" />
                  <p className="text-muted-foreground">No violations found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredViolations.map((violation) => (
                <TableRow key={violation.id}>
                  <TableCell>
                    <div>
                      {showUserIdentity ? (
                        <>
                          <p className="font-medium">
                            {violation.profile?.display_name || violation.profile?.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            @{violation.profile?.username}
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-medium text-muted-foreground italic">
                            User #{violation.id.slice(0, 6)}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Identity hidden
                          </p>
                        </>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {violation.violation_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRestrictionIcon(violation.restriction_type)}
                      <span className="capitalize text-sm">
                        {violation.restriction_type.replace('_', ' ')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "font-semibold",
                      violation.strike_number >= 3 && "text-destructive"
                    )}>
                      {violation.strike_number}/3
                    </span>
                  </TableCell>
                  <TableCell>{getStatusBadge(violation.status)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(violation.created_at), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell>
                    {violation.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedViolation(violation)}
                      >
                        <RotateCcw className="w-4 h-4 mr-1" />
                        Override
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Override Dialog */}
      <Dialog open={!!selectedViolation} onOpenChange={() => setSelectedViolation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Override Violation</DialogTitle>
            <DialogDescription>
              This will remove the violation from the user's record and restore their posting privileges.
            </DialogDescription>
          </DialogHeader>

          {selectedViolation && (
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-secondary/50 text-sm">
                <p className="font-medium mb-1">Content Preview:</p>
                <p className="text-muted-foreground italic">
                  "{selectedViolation.content_preview.slice(0, 200)}..."
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Reason for Override</label>
                <Textarea
                  placeholder="Explain why this violation is being overridden..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedViolation(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (selectedViolation && overrideReason) {
                  overrideMutation.mutate({
                    violationId: selectedViolation.id,
                    reason: overrideReason,
                  });
                }
              }}
              disabled={!overrideReason || overrideMutation.isPending}
            >
              {overrideMutation.isPending ? 'Processing...' : 'Confirm Override'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
