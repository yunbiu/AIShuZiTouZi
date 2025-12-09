package com.ruoyi.wms.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.ruoyi.wms.domain.entity.Portfolio;
import com.ruoyi.wms.domain.query.PortfolioQuery;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PortfolioMapper extends BaseMapper<Portfolio> {

    //查询当前持仓
    List<PortfolioQuery> getPortfolioList(@Param("userId") Integer userId);

}
