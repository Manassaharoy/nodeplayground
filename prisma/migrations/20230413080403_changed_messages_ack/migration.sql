-- AlterTable
ALTER TABLE `message_ack` MODIFY `receiving_time` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
