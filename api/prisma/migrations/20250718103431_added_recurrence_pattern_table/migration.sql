-- CreateTable
CREATE TABLE "RecurrencePattern" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "frequency" INTEGER,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RecurrencePattern_pkey" PRIMARY KEY ("id")
);
