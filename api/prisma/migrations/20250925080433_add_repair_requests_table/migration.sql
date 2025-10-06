-- CreateEnum
CREATE TYPE "public"."RepairRequestStatus" AS ENUM ('SUBMITTED', 'IN_PROGRESS', 'COMPLETED');

-- CreateEnum
CREATE TYPE "public"."RepairDeviceStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'FIXED', 'RETIRED', 'ASSIGNED_TO_VENDOR');

-- CreateTable
CREATE TABLE "public"."RepairRequest" (
    "id" SERIAL NOT NULL,
    "deviceTypeId" INTEGER NOT NULL,
    "severity" VARCHAR(32) NOT NULL,
    "location" VARCHAR(255),
    "currentStatus" "public"."RepairRequestStatus" NOT NULL DEFAULT 'SUBMITTED',
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "assignedOn" TIMESTAMP(3),
    "assignedById" INTEGER,
    "isDeleted" BOOLEAN NOT NULL,
    "deletedOn" TIMESTAMP(3),
    "deletedById" INTEGER,

    CONSTRAINT "RepairRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RepairDevice" (
    "id" SERIAL NOT NULL,
    "repairRequestId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "currentStatus" "public"."RepairDeviceStatus" NOT NULL DEFAULT 'PENDING',
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "isDeleted" BOOLEAN NOT NULL,
    "deletedOn" TIMESTAMP(3),
    "deletedById" INTEGER NOT NULL,

    CONSTRAINT "RepairDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RepairDeviceHistory" (
    "id" SERIAL NOT NULL,
    "repairDeviceId" INTEGER,
    "deviceStatus" "public"."RepairDeviceStatus" NOT NULL,
    "createdOn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdById" INTEGER NOT NULL,
    "vendorId" INTEGER,
    "notes" TEXT,

    CONSTRAINT "RepairDeviceHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."RepairRequest" ADD CONSTRAINT "RepairRequest_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "public"."DeviceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRequest" ADD CONSTRAINT "RepairRequest_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRequest" ADD CONSTRAINT "RepairRequest_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRequest" ADD CONSTRAINT "RepairRequest_assignedById_fkey" FOREIGN KEY ("assignedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairRequest" ADD CONSTRAINT "RepairRequest_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDevice" ADD CONSTRAINT "RepairDevice_repairRequestId_fkey" FOREIGN KEY ("repairRequestId") REFERENCES "public"."RepairRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDevice" ADD CONSTRAINT "RepairDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "public"."Device"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDevice" ADD CONSTRAINT "RepairDevice_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDevice" ADD CONSTRAINT "RepairDevice_deletedById_fkey" FOREIGN KEY ("deletedById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDeviceHistory" ADD CONSTRAINT "RepairDeviceHistory_repairDeviceId_fkey" FOREIGN KEY ("repairDeviceId") REFERENCES "public"."RepairDevice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDeviceHistory" ADD CONSTRAINT "RepairDeviceHistory_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RepairDeviceHistory" ADD CONSTRAINT "RepairDeviceHistory_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
