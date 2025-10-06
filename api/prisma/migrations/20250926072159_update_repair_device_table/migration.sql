-- DropForeignKey
ALTER TABLE "RepairDevice" DROP CONSTRAINT "RepairDevice_deletedById_fkey";

-- AlterTable
ALTER TABLE "RepairDevice" ALTER COLUMN "deletedById" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "RepairDevice" ADD CONSTRAINT "RepairDevice_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
