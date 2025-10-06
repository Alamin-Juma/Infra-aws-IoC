ALTER TABLE "Contract" ADD COLUMN "uploadedById" INTEGER;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE SET NULL;