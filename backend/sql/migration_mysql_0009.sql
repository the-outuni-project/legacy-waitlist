ALTER TABLE `fleet` ADD COLUMN `boss_system_id` BIGINT AFTER `boss_id`;
ALTER TABLE `fleet` ADD COLUMN `max_size` BIGINT NOT NULL AFTER `boss_system_id`;
ALTER TABLE `fleet` ADD COLUMN `visible` BOOL NOT NULL DEFAULT FALSE AFTER `max_size`;
