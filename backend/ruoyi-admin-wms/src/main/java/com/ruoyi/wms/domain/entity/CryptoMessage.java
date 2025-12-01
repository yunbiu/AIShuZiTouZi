package com.ruoyi.wms.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * 加密货币消息实体
 */
@Data
@TableName("crypto_message")
public class CryptoMessage {

    /**
     * 主键ID
     */
    @TableId(type = IdType.AUTO)
    private Long id;

    /**
     * 消息标题
     */
    private String title;

    /**
     * 涉及币种
     */
    private String coin;

    /**
     * 情感倾向：利好、利空、中性
     */
    private String sentiment;

    /**
     * 消息来源
     */
    private String source;

    /**
     * 消息内容
     */
    private String content;

    /**
     * 发布时间
     */
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime publishTime;

//    /**
//     * 创建时间
//     */
//    @TableField(fill = FieldFill.INSERT)
//    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
//    private LocalDateTime createTime;

    /**
     * 更新时间
     */
    @TableField(fill = FieldFill.INSERT_UPDATE)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime updateTime;
}
