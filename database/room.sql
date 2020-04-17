/*
Navicat MySQL Data Transfer

Source Server         : test
Source Server Version : 50077
Source Host           : localhost:3306
Source Database       : poker

Target Server Type    : MYSQL
Target Server Version : 50077
File Encoding         : 65001

Date: 2020-04-17 23:05:49
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for room
-- ----------------------------
DROP TABLE IF EXISTS `room`;
CREATE TABLE `room` (
  `id` int(11) NOT NULL auto_increment,
  `room_number` text,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of room
-- ----------------------------
INSERT INTO `room` VALUES ('1', '522687', '2020-04-01 15:33:32', null);
INSERT INTO `room` VALUES ('2', '145519', '2020-04-01 16:58:53', null);
INSERT INTO `room` VALUES ('3', '354507', '2020-04-01 17:35:32', null);
INSERT INTO `room` VALUES ('4', '973599', '2020-04-02 17:09:52', null);
INSERT INTO `room` VALUES ('5', '338302', '2020-04-02 17:12:39', null);
INSERT INTO `room` VALUES ('6', '739937', '2020-04-16 16:33:43', null);
INSERT INTO `room` VALUES ('7', '604560', '2020-04-16 16:35:35', null);
INSERT INTO `room` VALUES ('8', '205826', '2020-04-17 09:57:41', null);
INSERT INTO `room` VALUES ('9', '507003', '2020-04-17 13:51:25', null);
INSERT INTO `room` VALUES ('10', '633228', '2020-04-17 13:55:04', null);
INSERT INTO `room` VALUES ('11', '719376', '2020-04-17 15:06:55', null);
INSERT INTO `room` VALUES ('12', '516433', '2020-04-17 16:08:29', null);
INSERT INTO `room` VALUES ('13', '991922', '2020-04-17 16:20:18', null);
INSERT INTO `room` VALUES ('14', '346124', '2020-04-17 16:20:52', null);
INSERT INTO `room` VALUES ('15', '261855', '2020-04-17 17:29:38', null);
DROP TRIGGER IF EXISTS `update_room_time`;
DELIMITER ;;
CREATE TRIGGER `update_room_time` BEFORE UPDATE ON `room` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
