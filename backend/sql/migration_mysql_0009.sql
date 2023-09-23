ALTER TABLE `fleet` ADD COLUMN `boss_system_id` BIGINT AFTER `boss_id`;
ALTER TABLE `fleet` ADD COLUMN `max_size` BIGINT NOT NULL AFTER `boss_system_id`;
ALTER TABLE `fleet` ADD COLUMN `visible` BOOL NOT NULL DEFAULT FALSE AFTER `max_size`;
ALTER TABLE `fleet` ADD COLUMN `error_count` BIGINT NOT NULL DEFAULT(0);
ALTER TABLE `fleet` DROP COLUMN `is_updating`;

ALTER TABLE fleet_activity MODIFY is_boss boolean NOT NULL;

ALTER TABLE `waitlist_entry` DROP FOREIGN KEY `waitlist_entry_ibfk_1`;
ALTER TABLE `waitlist_entry` DROP COLUMN `waitlist_id`;
DROP TABLE `waitlist`;
