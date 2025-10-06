/*
  Warnings:

  - Changed the type of `eventCategory` on the `AuditLog` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "EventCategory" AS ENUM ('DATA_CHANGE', 'ENDPOINT');

-- AlterTable
ALTER TABLE "AuditLog" DROP COLUMN "eventCategory",
ADD COLUMN     "eventCategory" "EventCategory" NOT NULL;

-- CreateIndex
CREATE INDEX "AuditLog_eventCategory_action_idx" ON "AuditLog"("eventCategory", "action");
