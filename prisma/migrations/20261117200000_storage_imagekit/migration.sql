DELETE FROM "document";

-- AlterTable
ALTER TABLE "document" ADD COLUMN "storageFileId" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "document_storageFileId_key" ON "document"("storageFileId");
