/*
  Warnings:

  - You are about to drop the column `yacimiento` on the `OrdenFabricacion` table. All the data in the column will be lost.
  - Added the required column `yacimientoId` to the `OrdenFabricacion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Movimiento` ADD COLUMN `ordenCompraId` INTEGER NULL;

-- AlterTable
ALTER TABLE `OrdenFabricacion` DROP COLUMN `yacimiento`,
    ADD COLUMN `yacimientoId` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Yacimiento` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `ubicacion` VARCHAR(191) NOT NULL,
    `clienteId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Movimiento` ADD CONSTRAINT `Movimiento_ordenCompraId_fkey` FOREIGN KEY (`ordenCompraId`) REFERENCES `OrdenCompra`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `OrdenFabricacion` ADD CONSTRAINT `OrdenFabricacion_yacimientoId_fkey` FOREIGN KEY (`yacimientoId`) REFERENCES `Yacimiento`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Yacimiento` ADD CONSTRAINT `Yacimiento_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
