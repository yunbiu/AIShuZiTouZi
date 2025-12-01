package com.ruoyi.wms.domain.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.util.Date;

@Data
@TableName("crypto_portfolio_history")
public class PortfolioHistory {
    @TableId(type = IdType.AUTO)
    private Integer id;
    private Integer portfolioId;
    private String assetType;
    private Double percentage;
    private Double amount;
    private Double usdValue;
    private Date snapshotTime;

}
