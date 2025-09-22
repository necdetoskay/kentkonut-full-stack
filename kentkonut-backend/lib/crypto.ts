/**
 * Edge Runtime compatible password hashing utilities
 * Uses Web Crypto API instead of bcryptjs for Edge Runtime compatibility
 */

// Convert string to Uint8Array
function stringToUint8Array(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert Uint8Array to hex string
function uint8ArrayToHex(arr: Uint8Array): string {
  return Array.from(arr)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

// Generate a random salt
export async function generateSalt(): Promise<string> {
  const saltArray = new Uint8Array(16);
  crypto.getRandomValues(saltArray);
  return uint8ArrayToHex(saltArray);
}

// Hash password with salt using PBKDF2
export async function hashPassword(password: string, salt?: string): Promise<string> {
  const actualSalt = salt || await generateSalt();
  
  const passwordBuffer = stringToUint8Array(password);
  const saltBuffer = stringToUint8Array(actualSalt);
  
  // Import password as key material
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  
  // Derive key using PBKDF2
  const derivedBits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: saltBuffer,
      iterations: 100000, // 100k iterations for security
      hash: 'SHA-256'
    },
    keyMaterial,
    256 // 32 bytes
  );
  
  const hashArray = new Uint8Array(derivedBits);
  const hashHex = uint8ArrayToHex(hashArray);
  
  return `${actualSalt}:${hashHex}`;
}

// Verify password against hash
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  try {
    const [salt, hash] = hashedPassword.split(':');
    if (!salt || !hash) {
      return false;
    }
    
    const newHash = await hashPassword(password, salt);
    const [, newHashPart] = newHash.split(':');
    
    return hash === newHashPart;
  } catch (error) {
    console.error('Password verification error:', error);
    return false;
  }
}

// Fallback for bcryptjs compatibility - for existing hashed passwords
export async function verifyBcryptPassword(password: string, bcryptHash: string): Promise<boolean> {
  // If it's a bcrypt hash (starts with $2a$, $2b$, etc.)
  if (bcryptHash.startsWith('$2')) {
    try {
      // Try to use bcryptjs in Node.js runtime only
      // Check for Node.js environment without using process.versions
      if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
        const mod = await import('bcryptjs');
        const bcrypt: any = (mod as any)?.default ?? (mod as any);
        if (typeof bcrypt?.compare !== 'function') {
          throw new Error('bcryptjs.compare is not a function (ESM/CJS interop issue)');
        }
        return await bcrypt.compare(password, bcryptHash);
      }
    } catch (error) {
      console.error('bcryptjs fallback failed:', error);
    }
    return false;
  }

  // Otherwise use our new format
  return verifyPassword(password, bcryptHash);
}

// Migration utility to convert bcrypt hashes to new format
export async function migrateBcryptHash(password: string, bcryptHash: string): Promise<string | null> {
  try {
    // Check for Node.js environment without using process.versions
    if (typeof globalThis !== 'undefined' && 'process' in globalThis) {
      const bcrypt = await import('bcryptjs');
      const isValid = await bcrypt.compare(password, bcryptHash);
      if (isValid) {
        return await hashPassword(password);
      }
    }
  } catch (error) {
    console.error('Migration failed:', error);
  }
  return null;
}
