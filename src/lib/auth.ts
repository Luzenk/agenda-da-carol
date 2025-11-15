import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d'; // Token válido por 7 dias

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
  // Create JWT token with admin claim
  const token = jwt.sign(
    { 
      role: 'admin',
      iat: Math.floor(Date.now() / 1000)
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
  
  return token;
}

export function clearAdminSession(token: string): void {
  // JWT is stateless, no need to clear
  // Token will expire automatically
}

export function isValidAdminSession(token: string | null): boolean {
  if (!token) return false;
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { role: string };
    return decoded.role === 'admin';
  } catch {
    return false;
  }
}

export async function isAdminAuthenticated(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  
  const token = authHeader.replace('Bearer ', '');
  return isValidAdminSession(token);
}