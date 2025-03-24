-- Create tables based on Prisma schema

-- User table
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT,
  "email" TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP,
  "image" TEXT,
  "password" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT UNIQUE NOT NULL,
  "planType" TEXT NOT NULL DEFAULT 'FREE',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "startDate" TIMESTAMP NOT NULL DEFAULT NOW(),
  "endDate" TIMESTAMP,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Note table
CREATE TABLE IF NOT EXISTS "Note" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "subject" TEXT,
  "topic" TEXT,
  "prompt" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- PracticePage table
CREATE TABLE IF NOT EXISTS "PracticePage" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "subject" TEXT,
  "topic" TEXT,
  "difficulty" TEXT,
  "prompt" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ApiKey table
CREATE TABLE IF NOT EXISTS "ApiKey" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "key" TEXT UNIQUE NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Note_userId_idx" ON "Note"("userId");
CREATE INDEX IF NOT EXISTS "PracticePage_userId_idx" ON "PracticePage"("userId"); 