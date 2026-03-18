-- AlterTable: Add settings, security, and refresh token fields to users
ALTER TABLE "users" ADD COLUMN "settings" JSONB DEFAULT '{}';
ALTER TABLE "users" ADD COLUMN "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN "lockedUntil" TIMESTAMP(3);
ALTER TABLE "users" ADD COLUMN "refreshToken" TEXT;

-- Drop the old user_settings table if it exists (settings now stored as JSON on users)
DROP TABLE IF EXISTS "user_settings";
