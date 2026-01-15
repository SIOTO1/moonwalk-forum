import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export type ActivityType = 'post' | 'comment';

interface RateLimitResult {
  allowed: boolean;
  message?: string;
  remainingTime?: number; // in minutes
}

export function useRateLimit() {
  const { user, profile } = useAuth();

  const checkRateLimit = async (activityType: ActivityType): Promise<RateLimitResult> => {
    if (!user) {
      return { allowed: false, message: 'You must be logged in' };
    }

    // Check rate limit using the database function
    const { data, error } = await supabase.rpc('check_rate_limit', {
      _user_id: user.id,
      _activity_type: activityType,
    });

    if (error) {
      console.error('Rate limit check failed:', error);
      // Fail open - allow the action if check fails
      return { allowed: true };
    }

    if (!data) {
      const tierLimits = getTierLimits(profile?.membership_tier || 'free', activityType);
      return {
        allowed: false,
        message: `You've reached your hourly ${activityType} limit (${tierLimits.limit}/${tierLimits.period}). ${
          profile?.membership_tier === 'free' 
            ? 'Upgrade to Pro for higher limits!' 
            : 'Please wait before trying again.'
        }`,
        remainingTime: 60, // Suggest waiting up to an hour
      };
    }

    return { allowed: true };
  };

  const trackActivity = async (activityType: ActivityType): Promise<boolean> => {
    if (!user) return false;

    const { error } = await supabase.from('user_activity').insert({
      user_id: user.id,
      activity_type: activityType,
    });

    if (error) {
      console.error('Failed to track activity:', error);
      return false;
    }

    return true;
  };

  return {
    checkRateLimit,
    trackActivity,
  };
}

function getTierLimits(tier: string, activityType: ActivityType) {
  const limits: Record<string, Record<ActivityType, { limit: number; period: string }>> = {
    free: {
      post: { limit: 2, period: 'hour' },
      comment: { limit: 10, period: 'hour' },
    },
    pro: {
      post: { limit: 10, period: 'hour' },
      comment: { limit: 50, period: 'hour' },
    },
    elite: {
      post: { limit: 50, period: 'hour' },
      comment: { limit: 200, period: 'hour' },
    },
  };

  return limits[tier]?.[activityType] || limits.free[activityType];
}
