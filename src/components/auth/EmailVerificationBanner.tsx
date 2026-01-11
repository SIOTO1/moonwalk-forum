import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, X, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export function EmailVerificationBanner() {
  const { user, profile } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  // Don't show if no user, no profile, already verified, or dismissed
  if (!user || !profile || profile.email_verified || dismissed) {
    return null;
  }

  const handleResend = async () => {
    if (sending || sent) return;
    
    setSending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user.email!,
        options: {
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setSent(true);
      toast.success('Verification email sent! Check your inbox.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send verification email');
    } finally {
      setSending(false);
    }
  };

  return (
    <Alert className="bg-warning/10 border-warning/30 mb-4">
      <Mail className="h-4 w-4 text-warning" />
      <AlertDescription className="flex items-center justify-between gap-4 flex-wrap">
        <span className="text-sm">
          <strong>Verify your email to start posting.</strong> Check your inbox for a verification link.
        </span>
        <div className="flex items-center gap-2">
          {sent ? (
            <span className="text-sm text-success flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Email sent!
            </span>
          ) : (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleResend}
              disabled={sending}
              className="bg-warning/20 border-warning/30 hover:bg-warning/30"
            >
              {sending ? (
                <>
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  Sending...
                </>
              ) : (
                'Resend Email'
              )}
            </Button>
          )}
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setDismissed(true)}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}
