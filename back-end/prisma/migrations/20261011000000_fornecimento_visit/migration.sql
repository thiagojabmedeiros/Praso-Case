-- AlterTable
ALTER TABLE "fornecimentos" ADD COLUMN "visitId" TEXT;

-- CreateIndex
CREATE INDEX "fornecimentos_visitId_idx" ON "fornecimentos"("visitId");
