/*
  Warnings:

  - You are about to drop the `_AuthorizedRoles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_AuthorizedRoles" DROP CONSTRAINT "_AuthorizedRoles_A_fkey";

-- DropForeignKey
ALTER TABLE "_AuthorizedRoles" DROP CONSTRAINT "_AuthorizedRoles_B_fkey";

-- DropTable
DROP TABLE "_AuthorizedRoles";

-- CreateTable
CREATE TABLE "RequestTypeRole" (
    "requestTypeId" INTEGER NOT NULL,
    "roleId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestTypeRole_pkey" PRIMARY KEY ("requestTypeId","roleId")
);

-- AddForeignKey
ALTER TABLE "RequestTypeRole" ADD CONSTRAINT "RequestTypeRole_requestTypeId_fkey" FOREIGN KEY ("requestTypeId") REFERENCES "RequestType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestTypeRole" ADD CONSTRAINT "RequestTypeRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
