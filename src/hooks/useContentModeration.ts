import { useState, useCallback } from 'react';
import { checkContent, sanitizeForPreview, ContentCheckResult, ViolationType } from '@/lib/contentModeration';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ModerationResult {
  allowed: boolean;
  violationType?: ViolationType;
  message: string;
  strikeNumber?: number;
  restrictionType?: 'warning' | 'temp_restriction' | 'suspension';
}

export function useContentModeration() {
  const { user } = useAuth();
  const [isChecking, setIsChecking] = useState(false);

  const validateContent = useCallback(async (content: string): Promise<ModerationResult> => {
    if (!user) {
      return {
        allowed: false,
        message: 'You must be signed in to post content.',
      };
    }

    setIsChecking(true);

    try {
      // Client-side check first (fast)
      const clientCheck = checkContent(content);
      
      if (!clientCheck.isViolation) {
        return {
          allowed: true,
          message: '',
        };
      }

      // Content violates policy - record the strike
      const { data, error } = await supabase.rpc('apply_content_strike', {
        _user_id: user.id,
        _violation_type: clientCheck.violationType as ViolationType,
        _content_preview: sanitizeForPreview(content),
        _detected_terms: clientCheck.detectedTerms,
      });

      if (error) {
        console.error('Error applying strike:', error);
        // Even if we can't record the strike, still block the content
        return {
          allowed: false,
          violationType: clientCheck.violationType,
          message: clientCheck.message,
          strikeNumber: 1,
          restrictionType: 'warning',
        };
      }

      const result = data?.[0];
      
      return {
        allowed: false,
        violationType: clientCheck.violationType,
        message: result?.message || clientCheck.message,
        strikeNumber: result?.strike_number || 1,
        restrictionType: result?.restriction_type || 'warning',
      };
    } catch (error) {
      console.error('Content moderation error:', error);
      // On error, allow content but log for review
      return {
        allowed: true,
        message: '',
      };
    } finally {
      setIsChecking(false);
    }
  }, [user]);

  const checkOnly = useCallback((content: string): ContentCheckResult => {
    return checkContent(content);
  }, []);

  return {
    validateContent,
    checkOnly,
    isChecking,
  };
}
