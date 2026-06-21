/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `achievements` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `achievements` table without a default value. This is not possible if the table is not empty.
  - Added the required column `rarity` to the `achievements` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Rarity" AS ENUM ('COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY', 'MYTHIC');

-- AlterTable
ALTER TABLE "achievements" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "rarity" "Rarity" NOT NULL,
ADD COLUMN     "xp_reward" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_achievements" ADD COLUMN     "progress" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "match_questions" (
    "id" TEXT NOT NULL,
    "match_id" TEXT NOT NULL,
    "question_id" TEXT NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "match_questions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");

-- AddForeignKey
ALTER TABLE "match_questions" ADD CONSTRAINT "match_questions_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "match_questions" ADD CONSTRAINT "match_questions_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
