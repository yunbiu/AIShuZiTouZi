package com.ruoyi.wms.controller;


import cn.dev33.satoken.annotation.SaIgnore;
import cn.hutool.core.util.StrUtil;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.wms.domain.entity.CryptoMessage;
import com.ruoyi.wms.domain.query.CryptoMessageQuery;
import com.ruoyi.wms.service.CryptoMessageService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 加密货币消息控制器
 */
@RestController
@SaIgnore
@RequestMapping("/message")
@RequiredArgsConstructor
public class CryptoMessageController {

    private final CryptoMessageService messageService;

    /**
     * 分页查询消息列表
     *
     * @param query 查询条件封装类
     * @return 分页结果
     */
    @SaIgnore
    @GetMapping("/list")
// 直接使用Query类作为参数，Spring自动完成请求参数绑定
    public R<Page<CryptoMessage>> list(CryptoMessageQuery query) {
        Page<CryptoMessage> page = new Page<>(query.getPageNum(), query.getPageSize());
        // 构建查询条件
        LambdaQueryWrapper<CryptoMessage> queryWrapper = new LambdaQueryWrapper<>();
        // 币种筛选
        if (StrUtil.isNotBlank(query.getCoin()) && !"all".equals(query.getCoin())) {
            queryWrapper.eq(CryptoMessage::getCoin, query.getCoin());
        }
        // 情感倾向筛选
        if (StrUtil.isNotBlank(query.getSentiment()) && !"all".equals(query.getSentiment())) {
            queryWrapper.eq(CryptoMessage::getSentiment, query.getSentiment());
        }
        // 阅读状态筛选
        if (query.getStatus() != null) {
            queryWrapper.eq(CryptoMessage::getStatus, query.getStatus());
        }
        // 关键词搜索
        if (StrUtil.isNotBlank(query.getKeyword())) {
            queryWrapper.and(wrapper -> wrapper
                .like(CryptoMessage::getTitle, query.getKeyword())
                .or()
                .like(CryptoMessage::getContent, query.getKeyword())
            );
        }
        if (query.getStartTime() != null) {
            queryWrapper.ge(CryptoMessage::getPublishTime, query.getStartTime());
        }
        // 倒序
        queryWrapper.orderByDesc(CryptoMessage::getPublishTime);
        // 执行分页查询
        Page<CryptoMessage> result = messageService.page(page, queryWrapper);
        return R.ok(result);
    }

    /**
     * 根据ID获取消息详情（并自动标记为已读）
     *
     * @param id 消息ID
     * @return 消息详情
     */
    @SaIgnore
    @GetMapping("/{id}")
    public R<CryptoMessage> detail(@PathVariable Long id) {
        CryptoMessage message = messageService.getById(id);
        if (message == null) {
            return R.fail("消息不存在");
        }
        if (0 == message.getStatus()) {
            CryptoMessage updateMsg = new CryptoMessage();
            updateMsg.setId(id);
            updateMsg.setStatus(1);
            messageService.updateById(updateMsg);
        }
        return R.ok(message);
    }
    /**
     * 获取所有未读消息列表（不分页）
     * @return 未读消息列表
     */
    @SaIgnore
    @GetMapping("/unread/list")
    public R<List<CryptoMessage>> getUnreadMessages() {
        LambdaQueryWrapper<CryptoMessage> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CryptoMessage::getStatus, 0);
//        queryWrapper.orderByDesc(CryptoMessage::getPublishTime); // 按发布时间倒序排列
        List<CryptoMessage> unreadMessages = messageService.list(queryWrapper);
        return R.ok(unreadMessages);
    }

    /**
     * 获取未读消息数量
     * @return 未读消息数量
     */
    @SaIgnore
    @GetMapping("/unread/count")
    public R<Long> getUnreadCount() {
        LambdaQueryWrapper<CryptoMessage> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CryptoMessage::getStatus, 0);
        long count = messageService.count(queryWrapper);
        return R.ok(count);
    }

    /**
     * 批量保存加密货币消息
     * 接收从Dify爬取的数据列表
     *
     * @param messages 消息列表
     * @return 保存结果
     */
    @SaIgnore
    @PostMapping("/saveBatch")
    public R<String> saveBatch(@RequestBody List<CryptoMessage> messages) {
        try {
            if (messages == null || messages.isEmpty()) {
                return R.fail("消息列表不能为空");
            }
            // 简单的数据验证
            for (CryptoMessage message : messages) {
                if (StringUtils.isBlank(message.getTitle())) {
                    return R.fail("消息标题不能为空");
                }
                if (StringUtils.isBlank(message.getCoin())) {
                    return R.fail("涉及币种不能为空");
                }
                if (message.getPublishTime() == null) {
                    return R.fail("发布时间不能为空");
                }
            }
            // 使用批量保存，提高效率
            boolean result = messageService.saveBatch(messages);
            if (result) {
//                log.info("成功保存 {} 条加密货币消息", messages.size());
                return R.ok(String.format("成功保存 %d 条消息", messages.size()));
            } else {
//                log.error("保存加密货币消息失败");
                return R.fail("保存失败");
            }
        } catch (Exception e) {
//            log.error("保存加密货币消息时发生异常", e);
            return R.fail("保存时发生异常：" + e.getMessage());
        }
    }
}
