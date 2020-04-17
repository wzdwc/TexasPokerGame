/*
Navicat MySQL Data Transfer

Source Server         : test
Source Server Version : 50077
Source Host           : localhost:3306
Source Database       : poker

Target Server Type    : MYSQL
Target Server Version : 50077
File Encoding         : 65001

Date: 2020-04-17 23:05:30
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for comand_record
-- ----------------------------
DROP TABLE IF EXISTS `comand_record`;
CREATE TABLE `comand_record` (
  `id` int(11) NOT NULL auto_increment,
  `user_id` int(11) default NULL,
  `game_id` int(11) default NULL,
  `type` text,
  `comand` text,
  `room_id` int(11) default NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of comand_record
-- ----------------------------
DROP TRIGGER IF EXISTS `update_comand_record_time`;
DELIMITER ;;
CREATE TRIGGER `update_comand_record_time` BEFORE UPDATE ON `comand_record` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
