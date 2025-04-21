-- AlterTable
ALTER TABLE `OrdenFabricacion` ADD COLUMN `nroPresupuesto` VARCHAR(191) NULL,
    MODIFY `estado` ENUM('CREADA', 'PENDIENTE', 'EN_PROCESO', 'FINALIZADA', 'CANCELADA') NOT NULL DEFAULT 'CREADA';

-- CreateTable
CREATE TABLE `OrdenFabricacionRevision` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ordenFabricacionId` INTEGER NOT NULL,
    `snapshot` JSON NOT NULL,
    `version` INTEGER NOT NULL,
    `revisionObservacion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `OrdenFabricacionRevision_ordenFabricacionId_version_key`(`ordenFabricacionId`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `OrdenFabricacionRevision` ADD CONSTRAINT `OrdenFabricacionRevision_ordenFabricacionId_fkey` FOREIGN KEY (`ordenFabricacionId`) REFERENCES `OrdenFabricacion`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
