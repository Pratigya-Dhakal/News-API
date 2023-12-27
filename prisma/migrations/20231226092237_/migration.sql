-- AlterTable
ALTER TABLE `article` MODIFY `status` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `comment` MODIFY `status` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `user` MODIFY `status` BOOLEAN NOT NULL DEFAULT true;
