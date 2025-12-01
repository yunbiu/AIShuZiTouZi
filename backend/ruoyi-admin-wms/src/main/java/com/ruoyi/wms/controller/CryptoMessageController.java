package com.ruoyi.wms.controller;


import cn.dev33.satoken.annotation.SaIgnore;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.wms.domain.entity.CryptoMessage;
import com.ruoyi.wms.service.CryptoMessageService;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

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
     * @param pageNum 当前页码
     * @param pageSize 每页大小
     * @param coin 币种筛选
     * @param sentiment 情感倾向筛选
     * @param keyword 关键词搜索
     * @param startTime 开始时间
     * @param endTime 结束时间
     * @return 分页结果
     */
    @SaIgnore
    @GetMapping("/list")
    public R<Page<CryptoMessage>> list(
        @RequestParam(defaultValue = "1") Integer pageNum,
        @RequestParam(defaultValue = "10") Integer pageSize,
        @RequestParam(required = false) String coin,
        @RequestParam(required = false) String sentiment,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime startTime,
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") LocalDateTime endTime) {
        // 创建分页对象
        Page<CryptoMessage> page = new Page<>(pageNum, pageSize);
        // 构建查询条件
        LambdaQueryWrapper<CryptoMessage> queryWrapper = new LambdaQueryWrapper<>();
        // 币种筛选
        if (StringUtils.isNotBlank(coin) && !"all".equals(coin)) {
            queryWrapper.eq(CryptoMessage::getCoin, coin);
        }
        // 情感倾向筛选
        if (StringUtils.isNotBlank(sentiment) && !"all".equals(sentiment)) {
            queryWrapper.eq(CryptoMessage::getSentiment, sentiment);
        }
        // 关键词搜索（标题和内容）
        if (StringUtils.isNotBlank(keyword)) {
            queryWrapper.and(wrapper -> wrapper
                .like(CryptoMessage::getTitle, keyword)
                .or()
                .like(CryptoMessage::getContent, keyword)
            );
        }
        // 时间范围筛选
        if (startTime != null) {
            queryWrapper.ge(CryptoMessage::getPublishTime, startTime);
        }
        if (endTime != null) {
            queryWrapper.le(CryptoMessage::getPublishTime, endTime);
        }
        // 按发布时间倒序排列
        queryWrapper.orderByDesc(CryptoMessage::getPublishTime);
        // 执行分页查询
        Page<CryptoMessage> result = messageService.page(page, queryWrapper);

        return R.ok(result);
    }

    /**
     * 根据ID获取消息详情
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
        return R.ok(message);
    }
}
