-- This SQL file contains all the necessary database creation commands for the StudyNotes app
-- It should be executed directly in the Supabase SQL Editor

-- Ensure the Postgres extensions needed by Supabase are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create the User table (this will be managed by Supabase Auth)
CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  "emailVerified" TIMESTAMP WITH TIME ZONE,
  image TEXT,
  password TEXT,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the Subscription table
CREATE TABLE IF NOT EXISTS "Subscription" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL UNIQUE,
  "planType" TEXT NOT NULL DEFAULT 'FREE',
  plan TEXT NOT NULL DEFAULT 'FREE',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "startDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "endDate" TIMESTAMP WITH TIME ZONE,
  "quotaLimit" INTEGER NOT NULL DEFAULT 10,
  "quotaUsed" INTEGER NOT NULL DEFAULT 0,
  "validUntil" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create the Note table
CREATE TABLE IF NOT EXISTS "Note" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  prompt TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create the PracticePage table
CREATE TABLE IF NOT EXISTS "PracticePage" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT,
  topic TEXT,
  difficulty TEXT,
  prompt TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create the ApiKey table
CREATE TABLE IF NOT EXISTS "ApiKey" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  key TEXT NOT NULL UNIQUE,
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create the PracticePaper table
CREATE TABLE IF NOT EXISTS "PracticePaper" (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  topic TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  content TEXT NOT NULL,
  prompt TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id)
);

-- Create the TextSummary table
CREATE TABLE IF NOT EXISTS "TextSummary" (
  id TEXT PRIMARY KEY,
  "originalTextLength" INTEGER NOT NULL,
  "summaryLength" INTEGER NOT NULL,
  style TEXT NOT NULL,
  length TEXT NOT NULL,
  "storagePath" TEXT,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"(id) ON DELETE CASCADE
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Note_userId_idx" ON "Note"("userId");
CREATE INDEX IF NOT EXISTS "PracticePage_userId_idx" ON "PracticePage"("userId");

-- Note: For creating storage buckets and policies, please use the Supabase UI
-- Go to Storage > Create a new bucket named "user-content"
-- Then set up the following policies:
-- 1. Create a policy named "Allow authenticated uploads" with this SQL:
--    (auth.role() = 'authenticated') AND (bucket_id = 'user-content') AND (storage.foldername(name)[1] = auth.uid()::text)
-- 2. Create a policy named "Allow authenticated reads" with this SQL:
--    (auth.role() = 'authenticated') AND (bucket_id = 'user-content') AND (storage.foldername(name)[1] = auth.uid()::text) 