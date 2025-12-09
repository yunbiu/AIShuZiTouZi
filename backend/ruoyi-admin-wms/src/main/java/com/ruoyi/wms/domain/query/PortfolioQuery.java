package com.ruoyi.wms.domain.query;

import lombok.Data;

import java.util.Date;

@Data
public class PortfolioQuery {
    private Integer id;
    private String assetType;
    private Double percentage;
    private Double amount;
    private Double usdValue;
    private Date updateTime;
    private Integer userId;
    private String userName;
}
