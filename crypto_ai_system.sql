/*
Navicat MySQL Data Transfer

Source Server         : sy
Source Server Version : 80013
Source Host           : localhost:3306
Source Database       : crypto_ai_system

Target Server Type    : MYSQL
Target Server Version : 80013
File Encoding         : 65001

Date: 2025-11-24 15:44:15
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for ai_report
-- ----------------------------
DROP TABLE IF EXISTS `ai_report`;
CREATE TABLE `ai_report` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '报告ID',
  `news_id` bigint(20) NOT NULL COMMENT '关联消息ID',
  `sentiment_analysis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '情感分析结果',
  `portfolio_analysis` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '持仓分析结果',
  `adjustment_suggestion` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '调整建议',
  `adjustment_details` json DEFAULT NULL COMMENT '详细调整方案（JSON格式）',
  `report_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'PENDING' COMMENT '报告状态（PENDING/APPROVED/REJECTED）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of ai_report
-- ----------------------------

-- ----------------------------
-- Table structure for news
-- ----------------------------
DROP TABLE IF EXISTS `news`;
CREATE TABLE `news` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '消息ID',
  `coin_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '数字货币类型（BTC/ETH/SOL等）',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '消息内容',
  `sentiment` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'NEUTRAL' COMMENT '情感分析结果（POSITIVE/NEGATIVE/NEUTRAL）',
  `confidence` decimal(4,3) NOT NULL DEFAULT '0.000' COMMENT '置信度（0-1）',
  `source` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '数据来源',
  `source_url` varchar(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci DEFAULT NULL COMMENT '原文链接',
  `publish_time` datetime NOT NULL COMMENT '消息发布时间',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of news
-- ----------------------------

-- ----------------------------
-- Table structure for portfolio
-- ----------------------------
DROP TABLE IF EXISTS `portfolio`;
CREATE TABLE `portfolio` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '持仓ID',
  `asset_type` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '资产类型（BTC/ETH/SOL/USDT）',
  `percentage` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '持仓百分比',
  `amount` decimal(15,8) NOT NULL DEFAULT '0.00000000' COMMENT '资产数量',
  `usd_value` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '美元价值',
  `update_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of portfolio
-- ----------------------------

-- ----------------------------
-- Table structure for portfolio_history
-- ----------------------------
DROP TABLE IF EXISTS `portfolio_history`;
CREATE TABLE `portfolio_history` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '历史记录ID',
  `portfolio_id` bigint(20) NOT NULL COMMENT '关联持仓ID',
  `asset_type` varchar(20) NOT NULL COMMENT '资产类型',
  `percentage` decimal(5,2) NOT NULL DEFAULT '0.00' COMMENT '历史持仓百分比',
  `amount` decimal(15,8) NOT NULL DEFAULT '0.00000000' COMMENT '历史资产数量',
  `usd_value` decimal(15,2) NOT NULL DEFAULT '0.00' COMMENT '历史美元价值',
  `snapshot_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '快照时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of portfolio_history
-- ----------------------------

-- ----------------------------
-- Table structure for review_record
-- ----------------------------
DROP TABLE IF EXISTS `review_record`;
CREATE TABLE `review_record` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '审核记录ID',
  `report_id` bigint(20) NOT NULL COMMENT '关联报告ID',
  `reviewer_id` bigint(20) NOT NULL COMMENT '审核人ID',
  `review_result` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '审核结果（APPROVED/REJECTED）',
  `reject_reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci COMMENT '驳回原因',
  `review_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '审核时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of review_record
-- ----------------------------

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '用户ID',
  `username` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '用户名',
  `password` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL COMMENT '加密密码',
  `role` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL DEFAULT 'USER' COMMENT '用户角色（ADMIN/USER）',
  `create_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ----------------------------
-- Records of user
-- ----------------------------
