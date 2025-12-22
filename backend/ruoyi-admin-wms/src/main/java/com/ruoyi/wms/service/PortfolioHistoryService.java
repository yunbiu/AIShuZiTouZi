package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.wms.domain.entity.PortfolioHistory;

import java.util.List;

public interface PortfolioHistoryService extends IService<PortfolioHistory> {
    //查询历史持仓
    List<PortfolioHistory> getPortfolioHistoryList(Integer portfolioId);
    // 查询近N天记录
    List<PortfolioHistory> getRecentHistory(Integer historyId, Integer days);
}

