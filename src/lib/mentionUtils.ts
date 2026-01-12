/**
 * Extract @mentions from text content
 * Matches @username patterns (alphanumeric, underscores, hyphens)
 */
export function extractMentions(content: string): string[] {
  const mentionRegex = /@([a-zA-Z0-9_-]+)/g;
  const matches = content.match(mentionRegex);
  
  if (!matches) return [];
  
  // Remove @ prefix and deduplicate
  const usernames = matches.map(m => m.substring(1).toLowerCase());
  return [...new Set(usernames)];
}

/**
 * Render content with highlighted @mentions
 */
export function highlightMentions(content: string): string {
  return content.replace(
    /@([a-zA-Z0-9_-]+)/g,
    '<span class="text-accent font-medium">@$1</span>'
  );
}
