/*
Navicat MySQL Data Transfer

Source Server         : test
Source Server Version : 50077
Source Host           : localhost:3306
Source Database       : poker

Target Server Type    : MYSQL
Target Server Version : 50077
File Encoding         : 65001

Date: 2020-04-17 23:05:40
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for game_record
-- ----------------------------
DROP TABLE IF EXISTS `game_record`;
CREATE TABLE `game_record` (
  `id` int(11) NOT NULL auto_increment,
  `game_id` int(11) default NULL,
  `room_number` int(11) default NULL,
  `buy_in` int(11) NOT NULL,
  `hand_card` varchar(25) default NULL,
  `user_id` int(11) default NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of game_record
-- ----------------------------
DROP TRIGGER IF EXISTS `update_game_record_time`;
DELIMITER ;;
CREATE TRIGGER `update_game_record_time` BEFORE UPDATE ON `game_record` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
