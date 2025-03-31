/*
  Warnings:

  - A unique constraint covering the columns `[sinonimo]` on the table `Insumo` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Insumo` ADD COLUMN `sinonimo` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `InsumoProveedor` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insumoId` INTEGER NOT NULL,
    `proveedorId` INTEGER NOT NULL,
    `codigoProveedor` VARCHAR(191) NOT NULL,
    `precioUnitario` DOUBLE NULL,
    `fechaActualizacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InsumoProveedor_insumoId_proveedorId_key`(`insumoId`, `proveedorId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Insumo_sinonimo_key` ON `Insumo`(`sinonimo`);

-- AddForeignKey
ALTER TABLE `InsumoProveedor` ADD CONSTRAINT `InsumoProveedor_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InsumoProveedor` ADD CONSTRAINT `InsumoProveedor_proveedorId_fkey` FOREIGN KEY (`proveedorId`) REFERENCES `Proveedor`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
