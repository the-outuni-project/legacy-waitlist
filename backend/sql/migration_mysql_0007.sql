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
