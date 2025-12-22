package com.ruoyi.wms.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.FieldFill;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("crypto_report")
public class CryptoReport {
    @TableId(type = IdType.INPUT)
    private String id;
    @JsonProperty("Generation_Time")
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime generationTime;
    @JsonProperty("Involved_Currencies")
    private String involvedCurrencies;
    @JsonProperty("Suggestion_Type")
    private String suggestionType;
    @JsonProperty("Suggestions")
    private String suggestions;
    @JsonProperty("user_id")
    private Long userId;
    @TableField(fill = FieldFill.INSERT)
    private LocalDateTime createTime;
    @TableField(fill = FieldFill.INSERT_UPDATE)
    private LocalDateTime updateTime;
}
