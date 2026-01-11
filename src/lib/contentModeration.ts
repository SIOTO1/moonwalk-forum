// Content moderation utilities for detecting prohibited language
// This runs client-side as a first line of defense, with server-side validation as backup

export type ViolationType = 'profanity' | 'hate_speech' | 'threats' | 'harassment' | 'personal_attack' | 'other';

export interface ContentCheckResult {
  isViolation: boolean;
  violationType?: ViolationType;
  detectedTerms: string[];
  message: string;
}

// Profanity and explicit language patterns (obfuscated for code safety)
const profanityPatterns = [
  /\b(f+u+c+k+|f+c+k+|f+u+k+)\w*/gi,
  /\b(s+h+i+t+|s+h+1+t+)\w*/gi,
  /\b(a+s+s+h+o+l+e+|a+s+s+)\b/gi,
  /\b(b+i+t+c+h+)\w*/gi,
  /\b(d+a+m+n+)\b/gi,
  /\b(c+r+a+p+)\b/gi,
  /\b(h+e+l+l+)\b(?!\s*(yeah|yes|no|of|on|bent))/gi,
  /\b(p+i+s+s+)\w*/gi,
  /\b(d+i+c+k+|c+o+c+k+|p+e+n+i+s+)\b/gi,
  /\b(b+a+s+t+a+r+d+)\b/gi,
];

// Hate speech and discriminatory language patterns
const hateSpeechPatterns = [
  /\b(n+[i1]+g+g+[ae3]+r*|n+[i1]+g+g+[a4]+)\b/gi,
  /\b(f+[a4]+g+[g0]*[o0]*t*|f+[a4]+g+)\b/gi,
  /\b(r+e+t+a+r+d+)\w*/gi,
  /\b(tr+a+n+n+y+|tr+a+n+s+ph+o+b+)\w*/gi,
  /\b(ch+i+n+k+)\b/gi,
  /\b(sp+i+c+|sp+i+k+)\b/gi,
  /\b(w+e+t+b+a+c+k+)\b/gi,
  /\b(k+i+k+e+)\b/gi,
  /\b(g+o+o+k+)\b/gi,
];

// Threat patterns
const threatPatterns = [
  /\b(i('ll|'m going to|will)\s*(kill|murder|hurt|destroy|end)\s*(you|him|her|them))\b/gi,
  /\b(you('re| are)\s*(dead|going to die))\b/gi,
  /\b(i('ll| will)\s*find\s*(you|where you live))\b/gi,
  /\b(watch your back|you('ll| will)\s*regret)\b/gi,
  /\b(death threat|kill yourself|kys)\b/gi,
  /\b(i('ll| am going to| will)\s*beat\s*(you|the|your))\b/gi,
];

// Harassment and bullying patterns
const harassmentPatterns = [
  /\b(you('re| are)\s*(stupid|dumb|idiot|moron|worthless|pathetic|loser))\b/gi,
  /\b(nobody\s*(likes|cares about)\s*you)\b/gi,
  /\b(go\s*(away|die|kill yourself))\b/gi,
  /\b(shut\s*(up|your\s*(mouth|face)))\b/gi,
  /\b(you\s*suck|you('re| are)\s*trash)\b/gi,
  /\b(get\s*lost|drop\s*dead)\b/gi,
];

// Personal attack patterns
const personalAttackPatterns = [
  /\b(you('re| are)\s*a\s*(liar|fraud|scam|cheat|thief|criminal))\b/gi,
  /\b(everyone\s*knows\s*you('re| are))\b/gi,
  /\b(typical\s*(behavior|response)\s*from)\b/gi,
  /\b(what\s*a\s*(joke|clown|disgrace)\s*you\s*are)\b/gi,
];

function findMatches(text: string, patterns: RegExp[]): string[] {
  const matches: string[] = [];
  for (const pattern of patterns) {
    const found = text.match(pattern);
    if (found) {
      matches.push(...found.map(m => m.toLowerCase().trim()));
    }
  }
  return [...new Set(matches)]; // Remove duplicates
}

export function checkContent(content: string): ContentCheckResult {
  const text = content.toLowerCase();
  
  // Check for hate speech first (most severe)
  const hateSpeechMatches = findMatches(text, hateSpeechPatterns);
  if (hateSpeechMatches.length > 0) {
    return {
      isViolation: true,
      violationType: 'hate_speech',
      detectedTerms: hateSpeechMatches,
      message: 'Your message contains discriminatory or hateful language. This type of content is strictly prohibited. Please revise your message to be respectful of all community members.',
    };
  }
  
  // Check for threats
  const threatMatches = findMatches(text, threatPatterns);
  if (threatMatches.length > 0) {
    return {
      isViolation: true,
      violationType: 'threats',
      detectedTerms: threatMatches,
      message: 'Your message appears to contain threatening language. Threats of violence or harm are not tolerated. Please express your concerns constructively.',
    };
  }
  
  // Check for harassment
  const harassmentMatches = findMatches(text, harassmentPatterns);
  if (harassmentMatches.length > 0) {
    return {
      isViolation: true,
      violationType: 'harassment',
      detectedTerms: harassmentMatches,
      message: 'Your message contains language that could be considered harassment or bullying. Please communicate respectfully, even during disagreements.',
    };
  }
  
  // Check for personal attacks
  const personalAttackMatches = findMatches(text, personalAttackPatterns);
  if (personalAttackMatches.length > 0) {
    return {
      isViolation: true,
      violationType: 'personal_attack',
      detectedTerms: personalAttackMatches,
      message: 'Your message appears to contain a personal attack. Focus on ideas and topics rather than attacking individuals or companies.',
    };
  }
  
  // Check for profanity
  const profanityMatches = findMatches(text, profanityPatterns);
  if (profanityMatches.length > 0) {
    return {
      isViolation: true,
      violationType: 'profanity',
      detectedTerms: profanityMatches,
      message: 'Your message contains explicit or inappropriate language. Please revise your message to maintain a professional tone.',
    };
  }
  
  return {
    isViolation: false,
    detectedTerms: [],
    message: '',
  };
}

export function sanitizeForPreview(content: string): string {
  // Truncate for storage in violations table
  return content.slice(0, 500);
}
