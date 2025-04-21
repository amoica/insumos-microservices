/*
  Warnings:

  - You are about to drop the column `documento` on the `PedidoCliente` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `PedidoCliente` DROP COLUMN `documento`,
    ADD COLUMN `adjunto` VARCHAR(191) NULL;
