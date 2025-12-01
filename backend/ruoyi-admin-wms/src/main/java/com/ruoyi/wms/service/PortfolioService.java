package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.wms.domain.entity.Portfolio;

import java.util.List;

public interface PortfolioService extends IService<Portfolio> {

    //查询当前持仓
    List<Portfolio> getPortfolioList();

}
