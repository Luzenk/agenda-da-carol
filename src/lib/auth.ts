import bcrypt from 'bcryptjs';

// Store active tokens in memory (in production, use Redis or database)
const activeSessions = new Set<string>();

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD;
  
  if (!adminPassword) {
    return false;
  }

  // Direct comparison for development, use bcrypt.compare for hashed passwords
  if (password === adminPassword) {
    return true;
  }

  // Try bcrypt comparison in case password is hashed
  try {
    return await bcrypt.compare(password, adminPassword);
  } catch {
    return false;
  }
}

export function createAdminSession(): string {
  const sessionToken = generateSessionToken();
  activeSessions.add(sessionToken);
  return sessionToken;
}

export function clearAdminSession(token: string): void {
  activeSessions.delete(token);
}

export function isValidAdminSession(token: string | null): boolean {
  if (!token) return false;
  return activeSessions.has(token);
}

export async function isAdminAuthenticated(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return isValidAdminSession(token);
}

function generateSessionToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36) + Math.random().toString(36).substring(2);
}