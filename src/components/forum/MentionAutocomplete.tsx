import { useState, useRef, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useMentionSearch, MentionUser } from '@/hooks/useMentionSearch';
import { cn } from '@/lib/utils';

interface MentionAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export interface MentionAutocompleteRef {
  focus: () => void;
}

export const MentionAutocomplete = forwardRef<MentionAutocompleteRef, MentionAutocompleteProps>(
  ({ value, onChange, placeholder, className, minHeight = '100px' }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

    const { data: suggestions = [], isLoading } = useMentionSearch(mentionQuery, showSuggestions);

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
    }));

    // Calculate dropdown position based on caret position
    const updateDropdownPosition = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea || mentionStartIndex === null) return;

      // Create a hidden div to measure text position
      const div = document.createElement('div');
      const style = window.getComputedStyle(textarea);
      
      // Copy styles
      div.style.cssText = `
        position: absolute;
        visibility: hidden;
        white-space: pre-wrap;
        word-wrap: break-word;
        overflow-wrap: break-word;
        width: ${textarea.clientWidth}px;
        font-family: ${style.fontFamily};
        font-size: ${style.fontSize};
        line-height: ${style.lineHeight};
        padding: ${style.padding};
      `;

      // Get text up to cursor
      const textBeforeCursor = value.substring(0, mentionStartIndex);
      div.textContent = textBeforeCursor;
      
      // Add a span to measure position
      const span = document.createElement('span');
      span.textContent = '@';
      div.appendChild(span);
      
      document.body.appendChild(div);
      
      const spanRect = span.getBoundingClientRect();
      const textareaRect = textarea.getBoundingClientRect();
      
      document.body.removeChild(div);

      // Calculate relative position within textarea
      const lineHeight = parseInt(style.lineHeight) || 20;
      const paddingTop = parseInt(style.paddingTop) || 0;
      const lines = textBeforeCursor.split('\n').length;
      
      setDropdownPosition({
        top: Math.min(lines * lineHeight + paddingTop + 24, textarea.clientHeight),
        left: 0,
      });
    }, [value, mentionStartIndex]);

    // Detect @ mentions while typing
    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      const cursorPos = e.target.selectionStart;
      
      onChange(newValue);

      // Find if we're in a mention context
      const textBeforeCursor = newValue.substring(0, cursorPos);
      const lastAtIndex = textBeforeCursor.lastIndexOf('@');
      
      if (lastAtIndex !== -1) {
        // Check if this @ is starting a new mention (preceded by space, newline, or start)
        const charBefore = textBeforeCursor[lastAtIndex - 1];
        const isValidMentionStart = !charBefore || charBefore === ' ' || charBefore === '\n';
        
        if (isValidMentionStart) {
          const query = textBeforeCursor.substring(lastAtIndex + 1);
          // Only show if query doesn't contain spaces and isn't too long
          if (!query.includes(' ') && query.length <= 20) {
            setMentionQuery(query);
            setMentionStartIndex(lastAtIndex);
            setShowSuggestions(true);
            setSelectedIndex(0);
            return;
          }
        }
      }
      
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartIndex(null);
    }, [onChange]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (!showSuggestions || suggestions.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % suggestions.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + suggestions.length) % suggestions.length);
          break;
        case 'Enter':
        case 'Tab':
          if (suggestions[selectedIndex]) {
            e.preventDefault();
            insertMention(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          break;
      }
    }, [showSuggestions, suggestions, selectedIndex]);

    // Insert selected mention
    const insertMention = useCallback((user: MentionUser) => {
      if (mentionStartIndex === null) return;

      const textarea = textareaRef.current;
      if (!textarea) return;

      const before = value.substring(0, mentionStartIndex);
      const after = value.substring(textarea.selectionStart);
      const mention = `@${user.username} `;
      
      const newValue = before + mention + after;
      onChange(newValue);
      
      setShowSuggestions(false);
      setMentionQuery('');
      setMentionStartIndex(null);

      // Set cursor position after mention
      requestAnimationFrame(() => {
        const newPos = mentionStartIndex + mention.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      });
    }, [value, mentionStartIndex, onChange]);

    // Update dropdown position when showing suggestions
    useEffect(() => {
      if (showSuggestions) {
        updateDropdownPosition();
      }
    }, [showSuggestions, updateDropdownPosition]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        if (
          dropdownRef.current && 
          !dropdownRef.current.contains(e.target as Node) &&
          textareaRef.current &&
          !textareaRef.current.contains(e.target as Node)
        ) {
          setShowSuggestions(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={cn(className)}
          style={{ minHeight }}
        />

        {/* Mention Suggestions Dropdown */}
        {showSuggestions && (mentionQuery.length >= 1 || isLoading) && (
          <div
            ref={dropdownRef}
            className="absolute z-50 w-64 max-h-60 overflow-auto bg-popover border border-border rounded-lg shadow-lg"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
            }}
          >
            {isLoading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Searching...
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="py-1">
                {suggestions.map((user, index) => (
                  <li key={user.user_id}>
                    <button
                      type="button"
                      onClick={() => insertMention(user)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                        index === selectedIndex 
                          ? 'bg-accent/10 text-accent-foreground' 
                          : 'hover:bg-muted'
                      )}
                    >
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={user.avatar_url || undefined} />
                        <AvatarFallback className="text-xs">
                          {user.display_name?.[0] || user.username[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {user.display_name || user.username}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          @{user.username}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : mentionQuery.length >= 1 ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No users found
              </div>
            ) : null}
          </div>
        )}
      </div>
    );
  }
);

MentionAutocomplete.displayName = 'MentionAutocomplete';
