/*
  Warnings:

  - You are about to drop the column `clienteId` on the `OrdenFabricacion` table. All the data in the column will be lost.
  - You are about to drop the column `contactoId` on the `OrdenFabricacion` table. All the data in the column will be lost.
  - Made the column `pedidoClienteId` on table `OrdenFabricacion` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `OrdenFabricacion` DROP FOREIGN KEY `OrdenFabricacion_clienteId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdenFabricacion` DROP FOREIGN KEY `OrdenFabricacion_contactoId_fkey`;

-- DropForeignKey
ALTER TABLE `OrdenFabricacion` DROP FOREIGN KEY `OrdenFabricacion_pedidoClienteId_fkey`;

-- AlterTable
ALTER TABLE `OrdenFabricacion` DROP COLUMN `clienteId`,
    DROP COLUMN `contactoId`,
    MODIFY `pedidoClienteId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `PedidoCliente` ADD COLUMN `contactoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `OrdenFabricacion` ADD CONSTRAINT `OrdenFabricacion_pedidoClienteId_fkey` FOREIGN KEY (`pedidoClienteId`) REFERENCES `PedidoCliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PedidoCliente` ADD CONSTRAINT `PedidoCliente_contactoId_fkey` FOREIGN KEY (`contactoId`) REFERENCES `Contacto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
