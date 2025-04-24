/*
  Warnings:

  - You are about to drop the column `imagenUrl` on the `RecetaProducto` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RecetaProducto` DROP COLUMN `imagenUrl`,
    ADD COLUMN `imagen` VARCHAR(191) NULL;
