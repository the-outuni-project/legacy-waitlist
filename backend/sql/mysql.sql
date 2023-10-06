-- Character & Auth related tables
CREATE TABLE `alliance` (
  `id` BIGINT PRIMARY KEY NOT NULL,
  `name` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `corporation` (
  `id` BIGINT PRIMARY KEY NOT NULL,
  `name` text NOT NULL,
  `alliance_id` BIGINT NULL,
  `updated_at` BIGINT NOT NULL,
  CONSTRAINT `alliance_id` FOREIGN KEY (`alliance_id`) REFERENCES `alliance` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `character` (
  `id` bigint PRIMARY KEY,
  `name` varchar(255) NOT NULL,
  `corporation_id` BIGINT NULL,
  `last_seen` BIGINT NOT NULL DEFAULT (UNIX_TIMESTAMP()),
  FULLTEXT INDEX `name` (`name`),
  CONSTRAINT `character_corporation` FOREIGN KEY (`corporation_id`) REFERENCES `corporation` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `access_token` (
  `character_id` bigint NOT NULL,
  `access_token` varchar(2048) NOT NULL,
  `expires` bigint NOT NULL,
  `scopes` varchar(1024) NOT NULL,
  PRIMARY KEY (`character_id`),
  CONSTRAINT `access_token_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `refresh_token` (
  `character_id` bigint NOT NULL,
  `refresh_token` varchar(255) NOT NULL,
  `scopes` varchar(1024) NOT NULL,
  PRIMARY KEY (`character_id`),
  CONSTRAINT `refresh_token_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `admin` (
    `character_id` BIGINT PRIMARY KEY NOT NULL,
    `role` VARCHAR(64) NOT NULL,
    `granted_at` BIGINT NOT NULL,
    `granted_by_id` BIGINT NOT NULL,
    CONSTRAINT `character_role` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`),
    CONSTRAINT `admin_character` FOREIGN KEY (`granted_by_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `alt_character` (
  `account_id` bigint NOT NULL,
  `alt_id` bigint NOT NULL,
  PRIMARY KEY (`account_id`,`alt_id`),
  KEY `alt_id` (`alt_id`),
  CONSTRAINT `alt_character_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `character` (`id`),
  CONSTRAINT `alt_character_ibfk_2` FOREIGN KEY (`alt_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Feature tables
CREATE TABLE `announcement` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `message` VARCHAR(512) NOT NULL,
  `is_alert` BOOLEAN NOT NULL DEFAULT FALSE,
  `pages` TEXT,
  `created_by_id` BIGINT NOT NULL,
  `created_at` BIGINT NOT NULL,
  `revoked_by_id` BIGINT,
  `revoked_at` BIGINT,
  CONSTRAINT `announcement_by` FOREIGN KEY (`created_by_id`) REFERENCES `character` (`id`),
  CONSTRAINT `announcement_revoked_by` FOREIGN KEY (`revoked_by_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `ban` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `entity_id` bigint NOT NULL,
  `entity_name` varchar(64),
  `entity_type` varchar(16) NOT NULL CHECK (
    `entity_type` in (
      'Account',
      'Character',
      'Corporation',
      'Alliance'
    )
  ),
  `issued_at` bigint NOT NULL,
  `issued_by` bigint NOT NULL,
  `public_reason` varchar(512),
  `reason` varchar(512) NOT NULL,
  `revoked_at` bigint,
  `revoked_by` bigint NULL,
  CONSTRAINT `issued_by` FOREIGN KEY (`issued_by`) REFERENCES `character` (`id`),
  CONSTRAINT `revoked_by` FOREIGN KEY (`revoked_by`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `badge` (
  `id` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(64) NOT NULL UNIQUE,
  `exclude_badge_id` BIGINT NULL,
  CONSTRAINT `exclude_badge` FOREIGN KEY (`exclude_badge_id`) REFERENCES `badge` (`id`) ON DELETE SET NULL
);

CREATE TABLE `badge_assignment` (
  `characterId` BIGINT NOT NULL,
  `badgeId` BIGINT NOT NULL,
  `grantedById` BIGINT NULL,
  `grantedAt` BIGINT NOT NULL,
  CONSTRAINT `characterId` FOREIGN KEY (`characterId`) REFERENCES `character` (`id`),
  CONSTRAINT `badgeId` FOREIGN KEY (`badgeId`) REFERENCES `badge` (`id`) ON DELETE CASCADE,
  CONSTRAINT `grantedById` FOREIGN KEY (`grantedById`) REFERENCES `character` (`id`)
);

-- Seed the database with some starting badges
INSERT INTO badge (name) VALUES ('BASTION'), ('LOGI'), ('RETIRED-LOGI'), ('WEB');

-- A pilot cannot have Logi and RETIRED-LOGI at once, update our seed
SELECT @logi_id := id FROM badge WHERE name='LOGI';
SELECT @retired_logi_id := id FROM badge WHERE name='RETIRED-LOGI';
UPDATE badge SET exclude_badge_id=@retired_logi_id WHERE id=@logi_id;
UPDATE badge SET exclude_badge_id=@logi_id WHERE id=@retired_logi_id;


CREATE TABLE `fitting` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `dna` varchar(1024) CHARACTER SET ascii NOT NULL,
  `hull` int NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `dna` (`dna`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `implant_set` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `implants` varchar(255) CHARACTER SET ascii NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `implants` (`implants`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `fit_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `character_id` bigint NOT NULL,
  `fit_id` bigint NOT NULL,
  `implant_set_id` bigint NOT NULL,
  `logged_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `character_id` (`character_id`),
  KEY `fit_id` (`fit_id`),
  KEY `implant_set_id` (`implant_set_id`),
  CONSTRAINT `fit_history_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`),
  CONSTRAINT `fit_history_ibfk_2` FOREIGN KEY (`fit_id`) REFERENCES `fitting` (`id`),
  CONSTRAINT `fit_history_ibfk_3` FOREIGN KEY (`implant_set_id`) REFERENCES `implant_set` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `fleet_activity` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `character_id` bigint NOT NULL,
  `fleet_id` bigint NOT NULL,
  `first_seen` bigint NOT NULL,
  `last_seen` bigint NOT NULL,
  `hull` int NOT NULL,
  `has_left` tinyint NOT NULL,
  `is_boss` boolean NOT NULL,
  PRIMARY KEY (`id`),
  KEY `character_id` (`character_id`),
  KEY `ix_fleet_activity_fleet_id` (`fleet_id`),
  CONSTRAINT `fleet_activity_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`),
  CONSTRAINT `fleet_activity_chk_1` CHECK ((`has_left` in (0,1))),
  CONSTRAINT `fleet_activity_chk_2` CHECK ((`is_boss` in (0,1)))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `skill_current` (
  `character_id` bigint NOT NULL,
  `skill_id` int NOT NULL,
  `level` tinyint NOT NULL,
  PRIMARY KEY (`character_id`,`skill_id`),
  CONSTRAINT `skill_current_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `skill_history` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `character_id` bigint NOT NULL,
  `skill_id` int NOT NULL,
  `old_level` tinyint NOT NULL,
  `new_level` tinyint NOT NULL,
  `logged_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `character_id` (`character_id`),
  CONSTRAINT `skill_history_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `character_note` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `character_id` bigint NOT NULL,
  `author_id` bigint NOT NULL,
  `note` text NOT NULL,
  `logged_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `character_note_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`),
  CONSTRAINT `character_note_ibfk_2` FOREIGN KEY (`author_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Temporary things

CREATE TABLE `fleet` (
  `id` bigint NOT NULL,
  `boss_id` NOT NULL bigint,
  `boss_system_id` BIGINT,
  `max_size` BIGINT NOT NULL,
  `visible` BOOL NOT NULL DEFAULT FALSE,
  `error_count` BIGINT NOT NULL DEFAULT(0)
  PRIMARY KEY (`id`),
  KEY `boss_id` (`boss_id`),
  CONSTRAINT `fleet_ibfk_1` FOREIGN KEY (`boss_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `fleet_squad` (
  `fleet_id` bigint NOT NULL,
  `category` varchar(10) NOT NULL,
  `wing_id` bigint NOT NULL,
  `squad_id` bigint NOT NULL,
  PRIMARY KEY (`fleet_id`,`category`),
  CONSTRAINT `fleet_squad_ibfk_1` FOREIGN KEY (`fleet_id`) REFERENCES `fleet` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `waitlist_entry` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `account_id` bigint NOT NULL,
  `joined_at` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `account_id`,
  KEY `account_id` (`account_id`),
  CONSTRAINT `waitlist_entry_ibfk_2` FOREIGN KEY (`account_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `waitlist_entry_fit` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `character_id` bigint NOT NULL,
  `entry_id` bigint NOT NULL,
  `fit_id` bigint NOT NULL,
  `implant_set_id` bigint NOT NULL,
  `state` VARCHAR(10) NOT NULL DEFAULT 'pending',
  `tags` varchar(255) NOT NULL,
  `category` varchar(10) NOT NULL,
  `fit_analysis` text,
  `review_comment` text,
  `cached_time_in_fleet` bigint NOT NULL,
  `is_alt` tinyint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `character_id` (`character_id`),
  KEY `entry_id` (`entry_id`),
  KEY `fit_id` (`fit_id`),
  KEY `implant_set_id` (`implant_set_id`),
  CONSTRAINT `waitlist_entry_fit_ibfk_1` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`),
  CONSTRAINT `waitlist_entry_fit_ibfk_2` FOREIGN KEY (`entry_id`) REFERENCES `waitlist_entry` (`id`),
  CONSTRAINT `waitlist_entry_fit_ibfk_3` FOREIGN KEY (`fit_id`) REFERENCES `fitting` (`id`),
  CONSTRAINT `waitlist_entry_fit_ibfk_4` FOREIGN KEY (`implant_set_id`) REFERENCES `implant_set` (`id`),
  CONSTRAINT `fit_state` CHECK (`state` in ('pending', 'approved', 'rejected'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `wiki_user` (
  `character_id` BIGINT PRIMARY KEY NOT NULL,
  `user` varchar(255) NOT NULL UNIQUE,
  `hash` varchar(60) NOT NULL,
  `mail` varchar(255) NOT NULL UNIQUE,
  CONSTRAINT `wiki_character` FOREIGN KEY (`character_id`) REFERENCES `character` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `role_mapping` (
  `id` BIGINT PRIMARY KEY AUTO_INCREMENT,
  `waitlist_role` VARCHAR(64) NOT NULL,
  `dokuwiki_role` VARCHAR(64) NOT NULL,
  KEY `waitlist_role` (`waitlist_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE VIEW `dokuwiki_user` AS
SELECT
    w.user AS `user`,
    c.name AS `name`,
    w.hash AS `hash`,
    w.mail AS `mail`
FROM `wiki_user` AS w
JOIN `character` AS c ON
     c.id = w.character_id;

CREATE VIEW `dokuwiki_groups` AS
SELECT
    u.user as `user`,
    COALESCE(m.dokuwiki_role, LOWER(a.role)) AS `group`
FROM `wiki_user` as u
JOIN `admin` AS a USING (`character_id`)
LEFT JOIN `role_mapping` AS m ON
    m.waitlist_role = a.role;
