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
    public List<PortfolioHistory> getPortfolioHistoryList() {
        return this.list();
    }
    @Override
    public List<PortfolioHistory> getRecentSevenDaysHistory() {
        LocalDateTime sevenDaysAgo = LocalDateTime.now().minusDays(7);
        QueryWrapper<PortfolioHistory> queryWrapper = new QueryWrapper<>();
        queryWrapper.ge("snapshot_time", sevenDaysAgo);
        queryWrapper.orderByDesc("snapshot_time");

        return this.list(queryWrapper);
    }
}
