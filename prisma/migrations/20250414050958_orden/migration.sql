/*
  Warnings:

  - You are about to alter the column `nroPresupuesto` on the `OrdenFabricacion` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- AlterTable
ALTER TABLE `OrdenFabricacion` MODIFY `nroPresupuesto` INTEGER NULL;
