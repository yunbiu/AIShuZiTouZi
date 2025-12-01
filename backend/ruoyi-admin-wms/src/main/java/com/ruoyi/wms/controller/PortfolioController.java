package com.ruoyi.wms.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ruoyi.wms.domain.entity.Portfolio;
import com.ruoyi.wms.domain.entity.PortfolioHistory;
import com.ruoyi.wms.service.PortfolioHistoryService;
import com.ruoyi.wms.service.PortfolioService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.ruoyi.common.core.domain.R;

import java.util.List;

/**
 * 持仓数据
 *
 * @author
 * @date 2025-12-1
 */

@RestController
@RequestMapping("/portfolio")
@SaIgnore
public class PortfolioController {
    @Resource
    private PortfolioService portfolioService;
    @Resource
    private PortfolioHistoryService portfolioHistoryService;

    /**
     * 查询持仓详情
     */
    @GetMapping("/getPortfolioList")
    @SaIgnore
    public R<List<Portfolio>> getPortfolioList(){
        List<Portfolio> portfolioList = portfolioService.getPortfolioList();
        return R.ok(portfolioList);
    }

    /**
     * 查询历史持仓详情
     */
    @GetMapping("/getPortfolioHistoryList")
    @SaIgnore
    public R<List<PortfolioHistory>> getPortfolioHistoryList(){
        List<PortfolioHistory> portfolioHistory = portfolioHistoryService.getPortfolioHistoryList();
        return R.ok(portfolioHistory);
    }

    /**
     * 查询近7天历史持仓详情
     */
    @GetMapping("/getRecentSevenDaysHistory")
    @SaIgnore
    public R<List<PortfolioHistory>> getRecentSevenDaysHistory(){
        List<PortfolioHistory> portfolioHistory = portfolioHistoryService.getRecentSevenDaysHistory();
        return R.ok(portfolioHistory);
    }



}
