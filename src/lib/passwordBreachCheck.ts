/**
 * Check if a password has been exposed in data breaches using the Have I Been Pwned API.
 * Uses k-anonymity to protect the password - only the first 5 characters of the SHA-1 hash are sent.
 */

async function sha1Hash(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
}

export interface BreachCheckResult {
  isBreached: boolean;
  count: number;
  error?: string;
}

export async function checkPasswordBreach(password: string): Promise<BreachCheckResult> {
  try {
    const hash = await sha1Hash(password);
    const prefix = hash.substring(0, 5);
    const suffix = hash.substring(5);

    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: {
        'Add-Padding': 'true', // Adds padding to prevent response length analysis
      },
    });

    if (!response.ok) {
      throw new Error('Failed to check password');
    }

    const text = await response.text();
    const hashes = text.split('\r\n');

    for (const line of hashes) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix === suffix) {
        return {
          isBreached: true,
          count: parseInt(count, 10),
        };
      }
    }

    return {
      isBreached: false,
      count: 0,
    };
  } catch (error) {
    console.error('Password breach check failed:', error);
    return {
      isBreached: false,
      count: 0,
      error: 'Unable to verify password security',
    };
  }
}
