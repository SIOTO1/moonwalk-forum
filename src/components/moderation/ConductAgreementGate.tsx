import { useAuth } from '@/contexts/AuthContext';
import { useConductAgreement } from '@/hooks/useConductAgreement';
import { CodeOfConductModal } from './CodeOfConductModal';

export function ConductAgreementGate() {
  const { user } = useAuth();
  const { hasAgreed, isLoading, refetch } = useConductAgreement();

  // Don't show if not logged in, still loading, or already agreed
  if (!user || isLoading || hasAgreed) {
    return null;
  }

  return (
    <CodeOfConductModal
      isOpen={true}
      onAccept={() => refetch()}
      userId={user.id}
    />
  );
}
