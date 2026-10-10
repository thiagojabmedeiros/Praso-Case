-- CreateEnum
CREATE TYPE "Turno" AS ENUM ('manha', 'tarde', 'noite');

-- AlterTable
ALTER TABLE "establishments" ADD COLUMN     "melhorTurno" "Turno";

-- AlterTable
ALTER TABLE "visits" ADD COLUMN     "melhorTurno" "Turno";
