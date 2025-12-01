package com.ruoyi.wms.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("portfolio")
public class Portfolio {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private String assetType;
    private Double percentage;
    private Double amount;
    private Double usdValue;
    private Date updateTime;


}
