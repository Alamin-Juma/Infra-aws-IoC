-- CreateTable
CREATE TABLE "ExternalRequestDeviceType" (
    "id" SERIAL NOT NULL,
    "externalRequestId" INTEGER NOT NULL,
    "deviceTypeId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ExternalRequestDeviceType_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExternalRequestDeviceType" ADD CONSTRAINT "ExternalRequestDeviceType_externalRequestId_fkey" FOREIGN KEY ("externalRequestId") REFERENCES "ExternalRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExternalRequestDeviceType" ADD CONSTRAINT "ExternalRequestDeviceType_deviceTypeId_fkey" FOREIGN KEY ("deviceTypeId") REFERENCES "DeviceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
