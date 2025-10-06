-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "eventCategory" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "userId" INTEGER,
    "auditableId" TEXT,
    "auditableType" TEXT,
    "oldValues" JSONB,
    "newValues" JSONB,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_eventCategory_action_idx" ON "AuditLog"("eventCategory", "action");

-- CreateIndex
CREATE INDEX "AuditLog_auditableType_auditableId_idx" ON "AuditLog"("auditableType", "auditableId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
