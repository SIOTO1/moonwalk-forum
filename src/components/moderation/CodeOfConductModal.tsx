import { useState } from 'react';
import { Shield, AlertTriangle, Heart, MessageCircle, Users, CheckCircle2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CodeOfConductModalProps {
  isOpen: boolean;
  onAccept: () => void;
  userId: string;
}

const conductRules = [
  {
    icon: Heart,
    title: 'No Bullying or Harassment',
    description: 'Treat all members with respect. Personal attacks, name-calling, and targeting individuals is strictly prohibited.',
  },
  {
    icon: MessageCircle,
    title: 'No Foul or Abusive Language',
    description: 'Keep discussions professional. Profanity, explicit content, and abusive language will not be tolerated.',
  },
  {
    icon: AlertTriangle,
    title: 'No Threats or Intimidation',
    description: 'Threatening language of any kind is absolutely prohibited. This includes veiled threats and intimidating behavior.',
  },
  {
    icon: Users,
    title: 'Respectful Disagreement Only',
    description: 'Disagree with ideas, not people. Debate topics constructively without resorting to personal criticism.',
  },
  {
    icon: Shield,
    title: 'Safety-Focused Discussions',
    description: 'Prioritize the safety and well-being of our community. Report concerning behavior immediately.',
  },
];

export function CodeOfConductModal({ isOpen, onAccept, userId }: CodeOfConductModalProps) {
  const [agreed, setAgreed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAccept = async () => {
    if (!agreed) {
      toast.error('Please agree to the Code of Conduct to continue');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('conduct_agreements')
        .insert({
          user_id: userId,
          version: '1.0',
        });

      if (error) throw error;

      toast.success('Welcome to Moonwalk Forum!', {
        description: 'Thank you for agreeing to our community standards.',
      });
      onAccept();
    } catch (error: any) {
      console.error('Error saving conduct agreement:', error);
      toast.error('Failed to save agreement. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-xl">Community Code of Conduct</DialogTitle>
              <DialogDescription>
                Please review and accept our community guidelines
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[400px] pr-4">
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Moonwalk Forum is committed to providing a safe, professional, and welcoming environment 
              for all members. By participating in our community, you agree to the following:
            </p>

            <div className="space-y-3">
              {conductRules.map((rule) => (
                <div
                  key={rule.title}
                  className="flex gap-3 p-3 rounded-lg bg-secondary/50 border border-border/50"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <rule.icon className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">{rule.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {rule.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <h4 className="font-medium text-sm flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-4 h-4" />
                Enforcement Policy
              </h4>
              <p className="text-xs text-muted-foreground mt-1">
                Violations will result in graduated enforcement: First offense results in a warning, 
                second offense leads to temporary posting restrictions, and third offense results in 
                account suspension pending moderator review.
              </p>
            </div>
          </div>
        </ScrollArea>

        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-start gap-3">
            <Checkbox
              id="agree"
              checked={agreed}
              onCheckedChange={(checked) => setAgreed(checked === true)}
            />
            <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
              I have read and agree to the Moonwalk Forum Code of Conduct. I understand that 
              violations may result in content removal and account restrictions.
            </label>
          </div>

          <Button
            onClick={handleAccept}
            disabled={!agreed || isSubmitting}
            className="w-full gap-2"
          >
            {isSubmitting ? (
              'Saving...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Accept & Continue
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
