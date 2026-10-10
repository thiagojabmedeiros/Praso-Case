-- CreateEnum
CREATE TYPE "CategoriaFornecimento" AS ENUM ('carne', 'pao', 'bebidas', 'laticinios', 'hortifruti', 'mercearia', 'embalagens', 'outros');

-- CreateTable
CREATE TABLE "distribuidoras" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "distribuidoras_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fornecimentos" (
    "id" TEXT NOT NULL,
    "establishmentId" TEXT NOT NULL,
    "distribuidoraId" TEXT NOT NULL,
    "categoria" "CategoriaFornecimento" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fornecimentos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "distribuidoras_nome_key" ON "distribuidoras"("nome");

-- CreateIndex
CREATE INDEX "fornecimentos_establishmentId_idx" ON "fornecimentos"("establishmentId");

-- CreateIndex
CREATE UNIQUE INDEX "fornecimentos_establishmentId_distribuidoraId_categoria_key" ON "fornecimentos"("establishmentId", "distribuidoraId", "categoria");

-- AddForeignKey
ALTER TABLE "fornecimentos" ADD CONSTRAINT "fornecimentos_establishmentId_fkey" FOREIGN KEY ("establishmentId") REFERENCES "establishments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fornecimentos" ADD CONSTRAINT "fornecimentos_distribuidoraId_fkey" FOREIGN KEY ("distribuidoraId") REFERENCES "distribuidoras"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Data migration: copia o fornecedor de texto para o novo cadastro (categoria "outros")
INSERT INTO "distribuidoras" ("id", "nome", "createdAt")
SELECT gen_random_uuid()::text, nome, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT trim("fornecedorAtual") AS nome FROM "establishments"
      WHERE "fornecedorAtual" IS NOT NULL AND trim("fornecedorAtual") <> '') AS d;

INSERT INTO "fornecimentos" ("id", "establishmentId", "distribuidoraId", "categoria", "createdAt")
SELECT gen_random_uuid()::text, e."id", d."id", 'outros', CURRENT_TIMESTAMP
FROM "establishments" e
JOIN "distribuidoras" d ON d."nome" = trim(e."fornecedorAtual")
WHERE e."fornecedorAtual" IS NOT NULL AND trim(e."fornecedorAtual") <> '';

-- AlterTable
ALTER TABLE "establishments" DROP COLUMN "fornecedorAtual";
