-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- Promote existing Admin users
UPDATE "users" SET "role" = 'ADMIN' WHERE "name" ILIKE '%Admin%';
