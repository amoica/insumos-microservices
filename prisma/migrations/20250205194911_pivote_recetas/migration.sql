/*
  Warnings:

  - You are about to drop the column `productoFabricadoId` on the `RecetaProducto` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `RecetaProducto` DROP FOREIGN KEY `RecetaProducto_productoFabricadoId_fkey`;

-- DropIndex
DROP INDEX `RecetaProducto_productoFabricadoId_version_key` ON `RecetaProducto`;

-- AlterTable
ALTER TABLE `RecetaProducto` DROP COLUMN `productoFabricadoId`;

-- CreateTable
CREATE TABLE `_ProductoRecetas` (
    `A` INTEGER NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_ProductoRecetas_AB_unique`(`A`, `B`),
    INDEX `_ProductoRecetas_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `_ProductoRecetas` ADD CONSTRAINT `_ProductoRecetas_A_fkey` FOREIGN KEY (`A`) REFERENCES `ProductoFabricado`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_ProductoRecetas` ADD CONSTRAINT `_ProductoRecetas_B_fkey` FOREIGN KEY (`B`) REFERENCES `RecetaProducto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
