-- AddForeignKey
ALTER TABLE `SkidSectionItem` ADD CONSTRAINT `SkidSectionItem_insumoId_fkey` FOREIGN KEY (`insumoId`) REFERENCES `Insumo`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
