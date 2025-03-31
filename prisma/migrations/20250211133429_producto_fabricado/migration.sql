-- CreateTable
CREATE TABLE `SkidSection` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NULL,
    `baseComponenteId` INTEGER NULL,
    `productoFabricadoId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SkidSectionItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `insumoId` INTEGER NOT NULL,
    `cantidad` DOUBLE NOT NULL,
    `unidad` VARCHAR(191) NOT NULL,
    `sectionId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `SkidSection` ADD CONSTRAINT `SkidSection_productoFabricadoId_fkey` FOREIGN KEY (`productoFabricadoId`) REFERENCES `ProductoFabricado`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SkidSectionItem` ADD CONSTRAINT `SkidSectionItem_sectionId_fkey` FOREIGN KEY (`sectionId`) REFERENCES `SkidSection`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
