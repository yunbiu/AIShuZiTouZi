package com.ruoyi.wms.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.ruoyi.common.satoken.utils.LoginHelper;
import com.ruoyi.wms.domain.entity.PortfolioHistory;
import com.ruoyi.wms.domain.query.PortfolioQuery;
import com.ruoyi.wms.service.PortfolioHistoryService;
import com.ruoyi.wms.service.PortfolioService;
import jakarta.annotation.Resource;
import org.springframework.web.bind.annotation.*;
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
     *
     */
    @GetMapping("/userId")
    public R<List<PortfolioQuery>> getPortfolioList(){
        Long userId = LoginHelper.getUserId();
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
     * 查询近N天历史持仓详情
     * @param historyId 持仓id
     * @param days 天数（默认7）
     */
    @GetMapping("/getRecentHistory/{historyId}")
    @SaIgnore
    public R<List<PortfolioHistory>> getRecentSevenDaysHistory(@PathVariable Integer historyId, @RequestParam(defaultValue = "7") Integer days){
        List<PortfolioHistory> portfolioHistory = portfolioHistoryService.getRecentHistory(historyId, days);
        return R.ok(portfolioHistory);
    }



}
