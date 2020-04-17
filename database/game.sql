/*
Navicat MySQL Data Transfer

Source Server         : test
Source Server Version : 50077
Source Host           : localhost:3306
Source Database       : poker

Target Server Type    : MYSQL
Target Server Version : 50077
File Encoding         : 65001

Date: 2020-04-17 23:05:17
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for game
-- ----------------------------
DROP TABLE IF EXISTS `game`;
CREATE TABLE `game` (
  `id` int(11) NOT NULL auto_increment,
  `room_id` int(11) default NULL,
  `status` int(11) default NULL,
  `common_card` text,
  `winners` varchar(255) default NULL,
  `pot` decimal(8,0) default NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of game
-- ----------------------------
DROP TRIGGER IF EXISTS `update_game_time`;
DELIMITER ;;
CREATE TRIGGER `update_game_time` BEFORE UPDATE ON `game` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
