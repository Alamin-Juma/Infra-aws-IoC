-- AlterTable
ALTER TABLE "RequestType" ADD COLUMN     "restrict" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "_AuthorizedRoles" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_AuthorizedRoles_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_AuthorizedRoles_B_index" ON "_AuthorizedRoles"("B");

-- AddForeignKey
ALTER TABLE "_AuthorizedRoles" ADD CONSTRAINT "_AuthorizedRoles_A_fkey" FOREIGN KEY ("A") REFERENCES "RequestType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorizedRoles" ADD CONSTRAINT "_AuthorizedRoles_B_fkey" FOREIGN KEY ("B") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;
