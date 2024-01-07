/*
Navicat MySQL Data Transfer

Source Server         : test11
Source Server Version : 50639
Source Host           : 47.104.172.100:3306
Source Database       : poker

Target Server Type    : MYSQL
Target Server Version : 50639
File Encoding         : 65001

Date: 2020-07-08 15:11:08
*/

SET FOREIGN_KEY_CHECKS=0;

USE poker;

-- ----------------------------
-- Table structure for command_record
-- ----------------------------
DROP TABLE IF EXISTS `command_record`;
CREATE TABLE `command_record` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` int(11) DEFAULT NULL,
  `gameId` int(11) DEFAULT NULL,
  `type` text,
  `gameStatus` int(11) DEFAULT NULL,
  `counter` int(11) DEFAULT NULL,
  `command` text,
  `commonCard` text,
  `pot` int(11) DEFAULT NULL,
  `roomNumber` int(11) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=26259 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for game
-- ----------------------------
DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `roomNumber` int(11) DEFAULT NULL,
  `status` int(11) DEFAULT NULL,
  `commonCard` text,
  `winners` text CHARACTER SET utf8,
  `pot` decimal(8,0) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2546 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for player
-- ----------------------------
DROP TABLE IF EXISTS `player`;
CREATE TABLE `player` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `gameId` int(11) DEFAULT NULL,
  `roomNumber` int(11) DEFAULT NULL,
  `buyIn` int(11) NOT NULL,
  `handCard` varchar(25) DEFAULT NULL,
  `counter` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7440 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Table structure for room
-- ----------------------------
DROP TABLE IF EXISTS `room`;
CREATE TABLE `room` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `smallBlind` int(11) DEFAULT NULL,
  `isShort` int(11) DEFAULT NULL,
  `time` int(11) DEFAULT NULL,
  `roomNumber` text CHARACTER SET latin1,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=351 DEFAULT CHARSET=utf8;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nickName` char(25) CHARACTER SET utf8 DEFAULT NULL,
  `password` char(25) DEFAULT NULL,
  `account` char(25) CHARACTER SET utf8 DEFAULT NULL,
  `create_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `update_time` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=45 DEFAULT CHARSET=latin1;
DROP TRIGGER IF EXISTS `update_comand_record_time`;
DELIMITER ;;
CREATE TRIGGER `update_comand_record_time` BEFORE UPDATE ON `command_record` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
DROP TRIGGER IF EXISTS `update_game_time`;
DELIMITER ;;
CREATE TRIGGER `update_game_time` BEFORE UPDATE ON `game` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
DROP TRIGGER IF EXISTS `update_game_record_time`;
DELIMITER ;;
CREATE TRIGGER `update_game_record_time` BEFORE UPDATE ON `player` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
DROP TRIGGER IF EXISTS `update_user_time`;
DELIMITER ;;
CREATE TRIGGER `update_user_time` BEFORE UPDATE ON `user` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;


/* 2022.10.16 command record 添加 user id 和 game id 索引 */
ALTER TABLE `command_record` ADD INDEX `idx_user_id`(`userId`);
ALTER TABLE `command_record` ADD INDEX `idx_game_id`(`gameId`);
ALTER TABLE `player` ADD INDEX `idx_user_id`(`userId`);

