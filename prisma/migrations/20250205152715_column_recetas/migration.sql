/*
  Warnings:

  - A unique constraint covering the columns `[codigo]` on the table `RecetaProducto` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `RecetaProducto` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `RecetaProducto` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RecetaProducto` ADD COLUMN `codigo` VARCHAR(191) NOT NULL,
    ADD COLUMN `nombre` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `RecetaProducto_codigo_key` ON `RecetaProducto`(`codigo`);
