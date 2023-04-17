-- DropForeignKey
ALTER TABLE `message_ack` DROP FOREIGN KEY `message_ack_device_id_fkey`;

-- AddForeignKey
ALTER TABLE `message_ack` ADD CONSTRAINT `message_ack_device_id_fkey` FOREIGN KEY (`device_id`) REFERENCES `device`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
