package com.ruoyi.wms.service.impl;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ruoyi.wms.domain.entity.PortfolioHistory;
import com.ruoyi.wms.mapper.PortfolioHistoryMapper;
import com.ruoyi.wms.service.PortfolioHistoryService;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PortfolioHistoryServiceImpl extends ServiceImpl<PortfolioHistoryMapper, PortfolioHistory> implements PortfolioHistoryService {

    @Override
    public List<PortfolioHistory> getPortfolioHistoryList(Integer portfolioId) {
        return baseMapper.getPortfolioHistoryList(portfolioId);
    }


    @Override
    public List<PortfolioHistory> getRecentHistory(Integer historyId, Integer days) {
        int d = (days == null || days <= 0) ? 7 : days;
        LocalDateTime daysAgo = LocalDateTime.now().minusDays(d);
        QueryWrapper<PortfolioHistory> queryWrapper = new QueryWrapper<>();
        queryWrapper.lambda()
            .eq(PortfolioHistory::getPortfolioId, historyId)
            .ge(PortfolioHistory::getSnapshotTime, daysAgo)
            .orderByDesc(PortfolioHistory::getSnapshotTime);
        return this.list(queryWrapper);
    }


}
