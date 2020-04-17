/*
Navicat MySQL Data Transfer

Source Server         : test
Source Server Version : 50077
Source Host           : localhost:3306
Source Database       : poker

Target Server Type    : MYSQL
Target Server Version : 50077
File Encoding         : 65001

Date: 2020-04-17 23:05:58
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` int(11) NOT NULL auto_increment,
  `nick_name` char(25) character set utf8 default NULL,
  `password` char(25) default NULL,
  `account` char(25) default NULL,
  `create_time` timestamp NOT NULL default CURRENT_TIMESTAMP,
  `update_time` datetime default NULL,
  PRIMARY KEY  (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=latin1;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'c', '123', 'cai', '2020-04-01 16:26:32', null);
INSERT INTO `user` VALUES ('2', '蔡', '123', 'cai111', '2020-04-01 16:28:17', null);
INSERT INTO `user` VALUES ('3', '蔡1', '123', 'cai11', '2020-04-01 16:29:43', null);
DROP TRIGGER IF EXISTS `update_user_time`;
DELIMITER ;;
CREATE TRIGGER `update_user_time` BEFORE UPDATE ON `user` FOR EACH ROW SET NEW.`UPDATE_TIME` = NOW()
;;
DELIMITER ;
