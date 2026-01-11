import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VoteButtonsProps {
  upvotes: number;
  downvotes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (direction: 'up' | 'down') => void;
  layout?: 'vertical' | 'horizontal';
}

export function VoteButtons({ 
  upvotes, 
  downvotes, 
  userVote, 
  onVote,
  layout = 'vertical' 
}: VoteButtonsProps) {
  const score = upvotes - downvotes;

  return (
    <div className={cn(
      "flex items-center gap-1",
      layout === 'vertical' ? 'flex-col' : 'flex-row'
    )}>
      <button
        onClick={() => onVote('up')}
        className={cn(
          'vote-button',
          userVote === 'up' && 'upvoted'
        )}
        aria-label="Upvote"
      >
        <ChevronUp className="w-5 h-5" />
      </button>
      
      <span className={cn(
        "font-semibold text-sm min-w-[2rem] text-center",
        score > 0 && "text-upvote",
        score < 0 && "text-downvote",
        score === 0 && "text-muted-foreground"
      )}>
        {score}
      </span>
      
      <button
        onClick={() => onVote('down')}
        className={cn(
          'vote-button',
          userVote === 'down' && 'downvoted'
        )}
        aria-label="Downvote"
      >
        <ChevronDown className="w-5 h-5" />
      </button>
    </div>
  );
}
