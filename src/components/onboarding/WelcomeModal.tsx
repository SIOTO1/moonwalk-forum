import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PartyPopper, MessageSquare, Star, Shield, ChevronRight, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const steps = [
  {
    icon: PartyPopper,
    title: "Welcome to Moonwalk Forum!",
    description: "You've joined the premier community for party rental operators and inflatable industry professionals. Let's get you started.",
    tips: [
      "Explore discussion categories on the left sidebar",
      "Browse trending topics to see what's popular",
      "Your profile is set up and ready to go"
    ]
  },
  {
    icon: MessageSquare,
    title: "Start Engaging",
    description: "Share your knowledge and learn from fellow party rental professionals.",
    tips: [
      "Create discussions using the 'New Thread' button",
      "Comment on posts to share your insights",
      "Upvote helpful content to show appreciation"
    ]
  },
  {
    icon: Star,
    title: "Build Your Reputation",
    description: "Earn recognition as you contribute to the community.",
    tips: [
      "Quality posts earn upvotes and boost your reputation",
      "Helpful answers can be marked as accepted",
      "Unlock badges as you achieve milestones"
    ]
  },
  {
    icon: Shield,
    title: "Community Guidelines",
    description: "We're committed to maintaining a respectful, professional environment for all party rental operators.",
    tips: [
      "Be respectful and constructive in discussions",
      "Report content that violates our guidelines",
      "Moderators help keep the community safe"
    ]
  }
];

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const { user, refreshProfile } = useAuth();
  
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const Icon = step.icon;

  const handleNext = () => {
    if (isLastStep) {
      handleComplete();
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;
    
    setIsCompleting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
      
      if (error) throw error;
      
      await refreshProfile();
      toast.success("Welcome aboard! You're all set to start exploring.");
      onClose();
    } catch (error) {
      console.error('Error completing onboarding:', error);
      toast.error('Failed to complete onboarding');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleSkip = async () => {
    await handleComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleSkip()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Icon className="h-8 w-8 text-primary" />
          </div>
          <DialogTitle className="text-xl">{step.title}</DialogTitle>
          <DialogDescription className="text-base">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {step.tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-sm text-muted-foreground">{tip}</span>
            </div>
          ))}
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 py-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentStep(index)}
              className={`h-2 w-2 rounded-full transition-colors ${
                index === currentStep 
                  ? 'bg-primary' 
                  : index < currentStep 
                    ? 'bg-primary/50' 
                    : 'bg-muted'
              }`}
              aria-label={`Go to step ${index + 1}`}
            />
          ))}
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="ghost"
            onClick={handleSkip}
            disabled={isCompleting}
            className="sm:mr-auto"
          >
            Skip tour
          </Button>
          <Button
            onClick={handleNext}
            disabled={isCompleting}
            className="gap-2"
          >
            {isLastStep ? (
              <>
                Get Started
                <PartyPopper className="h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
