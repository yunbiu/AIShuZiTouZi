package com.ruoyi.wms.service.impl;

import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.wms.domain.entity.Portfolio;
import com.ruoyi.wms.mapper.PortfolioMapper;
import com.ruoyi.wms.service.PortfolioService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PortfolioServiceImpl extends ServiceImpl<PortfolioMapper, Portfolio> implements PortfolioService {

    @Override
    public List<Portfolio> getPortfolioList() {
        return this.list();
    }
}
