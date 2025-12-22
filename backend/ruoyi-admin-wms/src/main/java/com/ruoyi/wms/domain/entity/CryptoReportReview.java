package com.ruoyi.wms.domain.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("crypto_report_review")
public class CryptoReportReview {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String reportId;
    private Long reviewerId;
    private String status;
    private BigDecimal confidence;
    private BigDecimal expectedReturn;
    private String analyst;
    private String comment;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime decisionTime;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
