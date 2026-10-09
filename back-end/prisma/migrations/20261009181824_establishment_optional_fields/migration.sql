-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "telefone" TEXT,
ALTER COLUMN "razaoSocial" DROP NOT NULL,
ALTER COLUMN "cnpj" DROP NOT NULL,
ALTER COLUMN "tipoDoc" DROP NOT NULL,
ALTER COLUMN "fornecedorAtual" DROP NOT NULL,
ALTER COLUMN "melhorHorario" DROP NOT NULL;
