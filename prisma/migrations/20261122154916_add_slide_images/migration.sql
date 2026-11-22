-- CreateEnum
CREATE TYPE "SlideImageStatus" AS ENUM ('PENDING', 'COMPLETE', 'FAILED', 'REFUSED', 'SKIPPED');

-- AlterTable
ALTER TABLE "Slide" ADD COLUMN     "imageError" TEXT,
ADD COLUMN     "imageFileId" TEXT,
ADD COLUMN     "imageStatus" "SlideImageStatus" NOT NULL DEFAULT 'PENDING';

-- Slides made before images existed will never get one, so do not leave them waiting.
UPDATE "Slide" SET "imageStatus" = 'SKIPPED' WHERE "imageUrl" IS NULL;
