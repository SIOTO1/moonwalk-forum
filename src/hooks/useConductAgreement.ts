import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useConductAgreement() {
  const { user } = useAuth();

  const { data: hasAgreed, isLoading, refetch } = useQuery({
    queryKey: ['conduct-agreement', user?.id],
    queryFn: async () => {
      if (!user) return true; // Non-authenticated users don't need to agree
      
      const { data, error } = await supabase
        .from('conduct_agreements')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking conduct agreement:', error);
        return true; // On error, don't block user
      }

      return !!data;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  return {
    hasAgreed: hasAgreed ?? true,
    isLoading,
    refetch,
  };
}
