package com.ruoyi.wms.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("crypto_market_data")
public class CryptoMarketData {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private String price;
    private String dayIncrease;
    private String weeksIncrease;
    @JsonProperty("Suggestion")
    private Integer suggestion;
    private LocalDateTime createTime;
}

