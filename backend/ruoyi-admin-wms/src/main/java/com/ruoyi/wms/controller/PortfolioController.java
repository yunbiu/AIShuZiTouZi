package com.ruoyi.wms.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.ruoyi.wms.domain.entity.Portfolio;
import com.ruoyi.wms.domain.entity.PortfolioHistory;
import com.ruoyi.wms.domain.query.PortfolioQuery;
import com.ruoyi.wms.service.PortfolioHistoryService;
import com.ruoyi.wms.service.PortfolioService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
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
     * @param userId 用户id
     */
    @GetMapping("/userId/{userId}")
    @SaIgnore
    public R<List<PortfolioQuery>> getPortfolioList(@PathVariable Integer userId){
        return R.ok(portfolioService.getPortfolioList(userId));
    }
    /**
     * 查询历史持仓详情
     * @param portfolioId 持仓id
     */
    @GetMapping("/portfolioId/{portfolioId}")
    @SaIgnore
    public R<List<PortfolioHistory>> getPortfolioHistoryList(@PathVariable Integer portfolioId){
        return R.ok(portfolioHistoryService.getPortfolioHistoryList(portfolioId));
    }

    /**
     * 查询近7天历史持仓详情
     * @param historyId 持仓id
     */
    @GetMapping("/getRecentSevenDaysHistory/{historyId}")
    @SaIgnore
    public R<List<PortfolioHistory>> getRecentSevenDaysHistory(@PathVariable Integer historyId){
        List<PortfolioHistory> portfolioHistory = portfolioHistoryService.getRecentSevenDaysHistory(historyId);
        return R.ok(portfolioHistory);
    }



}
