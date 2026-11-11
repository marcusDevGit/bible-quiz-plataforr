-- AlterTable
ALTER TABLE "users" ADD COLUMN     "best_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "current_streak" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "last_active_date" TIMESTAMP(3);
