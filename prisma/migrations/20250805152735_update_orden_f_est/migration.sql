/*
  Warnings:

  - Added the required column `estado` to the `Yacimiento` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Yacimiento` ADD COLUMN `estado` BOOLEAN NOT NULL;
