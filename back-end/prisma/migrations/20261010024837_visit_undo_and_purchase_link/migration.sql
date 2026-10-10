-- AlterTable
ALTER TABLE "purchases" ADD COLUMN     "visitId" TEXT;

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "pontosGerados" DOUBLE PRECISION NOT NULL DEFAULT 0;
