// Re-export from centralized prisma instance for backward compatibility
// This ensures serverless environments use a single PrismaClient instance
import { prisma } from './prisma';

export const db = prisma;

export default db;
