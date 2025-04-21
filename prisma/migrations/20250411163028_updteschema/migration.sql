/*
  Warnings:

  - You are about to drop the column `numero` on the `OrdenFabricacion` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[codigo]` on the table `OrdenFabricacion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `codigo` to the `OrdenFabricacion` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `OrdenFabricacion_numero_key` ON `OrdenFabricacion`;

-- AlterTable
ALTER TABLE `OrdenFabricacion` DROP COLUMN `numero`,
    ADD COLUMN `codigo` VARCHAR(191) NOT NULL,
    ADD COLUMN `contactoId` INTEGER NULL;

-- CreateIndex
CREATE UNIQUE INDEX `OrdenFabricacion_codigo_key` ON `OrdenFabricacion`(`codigo`);

-- AddForeignKey
ALTER TABLE `OrdenFabricacion` ADD CONSTRAINT `OrdenFabricacion_contactoId_fkey` FOREIGN KEY (`contactoId`) REFERENCES `Contacto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
