ALTER TABLE `character` DROP INDEX `name`;
ALTER TABLE `character` ADD FULLTEXT INDEX `name` (`name`);
ALTER TABLE `character` MODIFY `name` varchar(128) NOT NULL;
ALTER TABLE `character` ADD COLUMN (`last_seen` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()));

