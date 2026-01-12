import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PasswordStrength, validatePassword } from './PasswordStrength';
import { Loader2, Mail, Lock, User, Chrome, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

type AuthMode = 'signin' | 'signup' | 'forgot';

export function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate password strength for signup
    if (mode === 'signup') {
      const validation = validatePassword(password);
      if (!validation.valid) {
        toast.error('Please create a stronger password');
        return;
      }
    }
    
    setLoading(true);

    try {
      if (mode === 'signin') {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Welcome back!');
        onClose();
      } else if (mode === 'signup') {
        const { error } = await signUp(email, password, username);
        if (error) throw error;
        toast.success('Account created! You can now sign in.');
        onClose();
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      
      setResetEmailSent(true);
      toast.success('Password reset email sent!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setUsername('');
    setResetEmailSent(false);
  };

  const switchMode = (newMode: AuthMode) => {
    resetForm();
    setMode(newMode);
  };

  const getTitle = () => {
    if (mode === 'forgot') return 'Reset Password';
    return mode === 'signin' ? 'Welcome Back' : 'Join Moonwalk Forum';
  };

  // Forgot Password View
  if (mode === 'forgot') {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-center">
              {getTitle()}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {resetEmailSent ? (
              <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                  <Mail className="w-8 h-8 text-green-500" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Check your email</h3>
                  <p className="text-sm text-muted-foreground">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => switchMode('signin')}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to sign in
                </Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground text-center">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full gradient-accent text-accent-foreground"
                    disabled={loading}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Send Reset Link'
                    )}
                  </Button>
                </form>

                <button
                  type="button"
                  className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
                  onClick={() => switchMode('signin')}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to sign in
                </button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-display text-center">
            {getTitle()}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            <Chrome className="w-4 h-4" />
            Continue with Google
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Choose a username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                    required={mode === 'signup'}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    className="text-xs text-accent hover:underline"
                    onClick={() => switchMode('forgot')}
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  required
                  minLength={8}
                />
              </div>
              {mode === 'signup' && (
                <PasswordStrength password={password} />
              )}
            </div>

            <Button
              type="submit"
              className="w-full gradient-accent text-accent-foreground"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : mode === 'signin' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <button
                  type="button"
                  className="text-accent hover:underline font-medium"
                  onClick={() => switchMode('signup')}
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-accent hover:underline font-medium"
                  onClick={() => switchMode('signin')}
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}