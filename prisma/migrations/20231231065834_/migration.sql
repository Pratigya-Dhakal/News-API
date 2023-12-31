/*
  Warnings:

  - You are about to alter the column `status` on the `article` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(4))`.
  - You are about to alter the column `status` on the `category` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(4))`.
  - You are about to alter the column `status` on the `comment` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(4))`.
  - You are about to alter the column `status` on the `user` table. The data in that column could be lost. The data in that column will be cast from `TinyInt` to `Enum(EnumId(4))`.
  - A unique constraint covering the columns `[name]` on the table `Category` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Article_categoryName_key` ON `article`;

-- AlterTable
ALTER TABLE `article` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `category` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `comment` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- AlterTable
ALTER TABLE `user` MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE UNIQUE INDEX `Category_name_key` ON `Category`(`name`);
