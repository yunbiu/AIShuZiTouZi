package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.wms.domain.entity.PortfolioHistory;

import java.util.List;

public interface PortfolioHistoryService extends IService<PortfolioHistory> {
    //查询历史持仓
    List<PortfolioHistory> getPortfolioHistoryList(Integer portfolioId);
    // 添加获取近7天记录的方法
    List<PortfolioHistory> getRecentSevenDaysHistory(Integer historyId);
}

