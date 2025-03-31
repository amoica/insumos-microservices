/*
  Warnings:

  - Added the required column `imagenUrl` to the `Insumo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Insumo` ADD COLUMN `imagenUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `unidad` VARCHAR(191) NOT NULL DEFAULT 'SIN UNIDAD MEDIDA';
