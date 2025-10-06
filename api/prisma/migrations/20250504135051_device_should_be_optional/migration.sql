-- DropForeignKey
ALTER TABLE "ExternalRequest" DROP CONSTRAINT "ExternalRequest_deviceId_fkey";

-- AlterTable
ALTER TABLE "ExternalRequest" ALTER COLUMN "deviceId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ExternalRequest" ADD CONSTRAINT "ExternalRequest_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;
