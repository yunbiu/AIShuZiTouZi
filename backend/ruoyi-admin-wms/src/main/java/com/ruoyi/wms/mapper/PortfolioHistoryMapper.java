package com.ruoyi.wms.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ruoyi.wms.domain.entity.PortfolioHistory;
import com.ruoyi.wms.domain.query.PortfolioQuery;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PortfolioHistoryMapper extends BaseMapper<PortfolioHistory> {
    //查询历史持仓
    List<PortfolioHistory> getPortfolioHistoryList(@Param("portfolioId") Integer portfolioId);
}
