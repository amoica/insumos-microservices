/*
  Warnings:

  - You are about to drop the column `unidad` on the `ComponenteProducto` table. All the data in the column will be lost.
  - You are about to drop the column `unidad` on the `SkidSectionItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `ComponenteProducto` DROP COLUMN `unidad`;

-- AlterTable
ALTER TABLE `SkidSectionItem` DROP COLUMN `unidad`;
