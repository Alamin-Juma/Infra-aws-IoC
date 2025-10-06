/*
  Warnings:

  - You are about to drop the `_AuditTrailToVendor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[requestNumber]` on the table `ProcurementRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "EvaluationFrequency" AS ENUM ('QUARTERLY', 'ANNUALLY');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'ALERT', 'TASK');

-- CreateEnum
CREATE TYPE "InventoryDeviceStatus" AS ENUM ('AVAILABLE', 'UNAVAILABLE');

-- DropForeignKey
ALTER TABLE "Contract" DROP CONSTRAINT "Contract_uploadedById_fkey";

-- DropForeignKey
ALTER TABLE "ExternalRequest" DROP CONSTRAINT "ExternalRequest_deviceId_fkey";

-- DropForeignKey
ALTER TABLE "_AuditTrailToVendor" DROP CONSTRAINT "_AuditTrailToVendor_A_fkey";

-- DropForeignKey
ALTER TABLE "_AuditTrailToVendor" DROP CONSTRAINT "_AuditTrailToVendor_B_fkey";

-- AlterTable
ALTER TABLE "Contract" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ALTER COLUMN "uploadedBy" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ExternalRequest" ADD COLUMN     "notes" TEXT,
ALTER COLUMN "deviceId" DROP NOT NULL,
ALTER COLUMN "deviceTypeId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "ProcurementRequest" ADD COLUMN     "requestNumber" TEXT;

-- AlterTable
ALTER TABLE "Vendor" ADD COLUMN     "lastEvaluationDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VendorEvaluation" ADD COLUMN     "complianceAndSecurity" INTEGER,
ADD COLUMN     "innovation" INTEGER;

-- DropTable
DROP TABLE "_AuditTrailToVendor";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "link" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InventoryAudit" (
    "id" SERIAL NOT NULL,
    "expectedCount" INTEGER,
    "deviceTypeId" INTEGER NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "serial" TEXT NOT NULL,
    "quantityCounted" INTEGER NOT NULL,
    "notes" TEXT,
    "createdById" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryAudit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeviceInventory" (
    "id" SERIAL NOT NULL,
    "deviceType" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "expectedCount" INTEGER NOT NULL,
    "actualCount" INTEGER,
    "status" "InventoryDeviceStatus" NOT NULL DEFAULT 'AVAILABLE',
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeviceInventory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Frequency" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Frequency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditStatus" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "AuditStatus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "ticketNumber" TEXT NOT NULL,
    "auditDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deviceTypeId" INTEGER NOT NULL,
    "frequencyId" INTEGER NOT NULL,
    "statusId" INTEGER NOT NULL,
    "scheduledById" INTEGER NOT NULL,
    "assignedToId" INTEGER,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_VendorAuditTrail" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_VendorAuditTrail_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "DeviceInventory_serial_key" ON "DeviceInventory"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "Frequency_name_key" ON "Frequency"("name");

-- CreateIndex
CREATE UNIQUE INDEX "AuditStatus_name_key" ON "AuditStatus"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Audit_ticketNumber_key" ON "Audit"("ticketNumber");

-- CreateIndex
CREATE INDEX "_VendorAuditTrail_B_index" ON "_VendorAuditTrail"("B");

-- CreateIndex
CREATE UNIQUE INDEX "ProcurementRequest_requestNumber_key" ON "ProcurementRequest"("requestNumber");

-- AddForeignKey
ALTER TABLE "ExternalRequest" ADD CONSTRAINT "ExternalRequest_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "Device"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAudit" ADD CONSTRAINT "InventoryAudit_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "DeviceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryAudit" ADD CONSTRAINT "InventoryAudit_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "DeviceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_frequencyId_fkey" FOREIGN KEY ("frequencyId") REFERENCES "Frequency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_statusId_fkey" FOREIGN KEY ("statusId") REFERENCES "AuditStatus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_scheduledById_fkey" FOREIGN KEY ("scheduledById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendorAuditTrail" ADD CONSTRAINT "_VendorAuditTrail_A_fkey" FOREIGN KEY ("A") REFERENCES "AuditTrail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_VendorAuditTrail" ADD CONSTRAINT "_VendorAuditTrail_B_fkey" FOREIGN KEY ("B") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
