/*
  Warnings:

  - You are about to drop the column `ordenCompraCliente` on the `OrdenFabricacion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `OrdenFabricacion` DROP COLUMN `ordenCompraCliente`,
    ADD COLUMN `pedidoClienteId` INTEGER NULL,
    ADD COLUMN `snapshotSkid` JSON NULL;

-- AlterTable
ALTER TABLE `RecetaProducto` ADD COLUMN `tipo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `PedidoCliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero` VARCHAR(191) NOT NULL,
    `fecha` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `clienteId` INTEGER NOT NULL,
    `documento` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `PedidoCliente_numero_key`(`numero`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenFabricacion` ADD CONSTRAINT `OrdenFabricacion_pedidoClienteId_fkey` FOREIGN KEY (`pedidoClienteId`) REFERENCES `PedidoCliente`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoCliente` ADD CONSTRAINT `PedidoCliente_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
