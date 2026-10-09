-- CreateEnum
CREATE TYPE "EstablishmentStatus" AS ENUM ('lead', 'oportunidade', 'cliente', 'churn');

-- CreateEnum
CREATE TYPE "EstablishmentSegment" AS ENUM ('restaurante', 'padaria', 'lanchonete', 'pizzaria', 'hamburgueria', 'cafeteria', 'bar');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('MEI', 'nao-MEI');

-- CreateEnum
CREATE TYPE "Potential" AS ENUM ('alto', 'normal');

-- CreateEnum
CREATE TYPE "VisitType" AS ENUM ('planejada', 'efetiva');

-- CreateEnum
CREATE TYPE "VisitResult" AS ENUM ('cadastrou', 'recusou', 'fechado', 'ausente', 'compra', 'em-acompanhamento');

-- CreateTable
CREATE TABLE "sellers" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "pontuacaoAcumulada" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sellers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "establishments" (
    "id" TEXT NOT NULL,
    "razaoSocial" TEXT NOT NULL,
    "nomeFantasia" TEXT NOT NULL,
    "cnpj" TEXT NOT NULL,
    "segmento" "EstablishmentSegment" NOT NULL,
    "tipoDoc" "DocumentType" NOT NULL,
    "potencial" "Potential" NOT NULL,
    "status" "EstablishmentStatus" NOT NULL DEFAULT 'lead',
    "endereco" TEXT NOT NULL,
    "bairro" TEXT NOT NULL,
    "fornecedorAtual" TEXT NOT NULL,
    "melhorHorario" TEXT NOT NULL,
    "notasContexto" TEXT NOT NULL DEFAULT '',
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vendedorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "establishments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "visits" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "dataHora" TIMESTAMP(3) NOT NULL,
    "tipo" "VisitType" NOT NULL,
    "resultado" "VisitResult" NOT NULL,
    "geoLat" DOUBLE PRECISION,
    "geoLng" DOUBLE PRECISION,
    "geoAccuracy" DOUBLE PRECISION,
    "nota" TEXT NOT NULL DEFAULT '',
    "anuladaEm" TIMESTAMP(3),
    "motivoAnulacao" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "visits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL,
    "valor" DECIMAL(12,2) NOT NULL,
    "autonoma" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "establishments_cnpj_key" ON "establishments"("cnpj");

-- CreateIndex
CREATE INDEX "establishments_status_idx" ON "establishments"("status");

-- CreateIndex
CREATE INDEX "establishments_bairro_idx" ON "establishments"("bairro");

-- CreateIndex
CREATE INDEX "establishments_vendedorId_idx" ON "establishments"("vendedorId");

-- CreateIndex
CREATE INDEX "visits_establishmentId_dataHora_idx" ON "visits"("establishmentId", "dataHora");

-- CreateIndex
CREATE INDEX "visits_vendedorId_dataHora_idx" ON "visits"("vendedorId", "dataHora");

-- CreateIndex
CREATE INDEX "purchases_establishmentId_data_idx" ON "purchases"("establishmentId", "data");

-- CreateIndex
CREATE INDEX "purchases_vendedorId_idx" ON "purchases"("vendedorId");

-- AddForeignKey
ALTER TABLE "establishments" ADD CONSTRAINT "establishments_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "sellers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "visits" ADD CONSTRAINT "visits_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "sellers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
