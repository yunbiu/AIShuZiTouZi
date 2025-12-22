package com.ruoyi.wms.service;

import com.baomidou.mybatisplus.extension.service.IService;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.wms.domain.entity.Portfolio;
import com.ruoyi.wms.domain.query.PortfolioQuery;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface PortfolioService extends IService<Portfolio> {

    //查询当前持仓
    List<PortfolioQuery> getPortfolioList(Long userId);


}
