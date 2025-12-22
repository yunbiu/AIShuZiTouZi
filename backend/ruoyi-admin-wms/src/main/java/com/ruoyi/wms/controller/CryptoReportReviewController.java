package com.ruoyi.wms.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.common.satoken.utils.LoginHelper;
import com.ruoyi.wms.domain.entity.CryptoReport;
import com.ruoyi.wms.domain.entity.CryptoReportReview;
import com.ruoyi.wms.service.CryptoReportReviewService;
import com.ruoyi.wms.service.CryptoReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * 加密投资报告审核接口
 *
 * 功能：
 * - 报告列表（含最新审核状态、重合度、预期收益、分析师）
 * - 报告详情与最新审核详情查询
 * - 审核通过/驳回记录写入（保留历史）
 */
@RestController
@SaIgnore
@RequestMapping("/crypto/report")
@RequiredArgsConstructor
public class CryptoReportReviewController {

    private final CryptoReportService reportService;
    private final CryptoReportReviewService reviewService;

    /**
     * 报告列表（含最新审核状态）
     *
     * 可筛选：
     * - status：状态（待审/已通过/已驳回）
     * - userId：用户ID（为空则取当前登录用户）
     *
     * 返回分页记录字段：
     * - reportId、generationTime、involvedCurrencies、suggestionType
     * - confidence、expectedReturn、status、analyst
     *
     * @param pageNum 页码
     * @param pageSize 每页大小
     * @param status 状态筛选
     * @param userId 用户筛选
     * @return 包含报告及最新审核信息的分页数据
     */
    @GetMapping("/list")
    @SaIgnore
    public R<Page<Map<String, Object>>> list(
        @RequestParam(defaultValue = "1") Integer pageNum,
        @RequestParam(defaultValue = "10") Integer pageSize,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) Long userId
    ) {
        Long uid = userId != null ? userId : LoginHelper.getUserId();
        LambdaQueryWrapper<CryptoReport> reportQuery = new LambdaQueryWrapper<>();
        if (uid != null) {
            reportQuery.eq(CryptoReport::getUserId, uid);
        }
        Page<CryptoReport> reportPage = reportService.page(new Page<>(pageNum, pageSize), reportQuery.orderByDesc(CryptoReport::getGenerationTime));
        List<String> reportIds = reportPage.getRecords().stream().map(CryptoReport::getId).collect(Collectors.toList());
        Map<String, CryptoReportReview> latestMap = new HashMap<>();
        if (!reportIds.isEmpty()) {
            LambdaQueryWrapper<CryptoReportReview> reviewQuery = new LambdaQueryWrapper<>();
            reviewQuery.in(CryptoReportReview::getReportId, reportIds).orderByDesc(CryptoReportReview::getDecisionTime).orderByDesc(CryptoReportReview::getCreateTime);
            List<CryptoReportReview> reviews = reviewService.list(reviewQuery);
            for (CryptoReportReview r : reviews) {
                latestMap.putIfAbsent(r.getReportId(), r);
            }
        }
        Page<Map<String, Object>> page = new Page<>(pageNum, pageSize);
        List<Map<String, Object>> records = new ArrayList<>();
        for (CryptoReport rp : reportPage.getRecords()) {
            CryptoReportReview rv = latestMap.get(rp.getId());
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("reportId", rp.getId());
            row.put("generationTime", rp.getGenerationTime());
            row.put("involvedCurrencies", rp.getInvolvedCurrencies());
            row.put("suggestionType", rp.getSuggestionType());
            row.put("confidence", rv != null ? rv.getConfidence() : null);
            row.put("expectedReturn", rv != null ? rv.getExpectedReturn() : null);
            row.put("status", rv != null ? rv.getStatus() : "待审");
            row.put("analyst", "Ai分析师");
            records.add(row);
        }
        if (status != null && !"".equals(status)) {
            records = records.stream().filter(m -> status.equals(m.get("status"))).collect(Collectors.toList());
        }
        page.setTotal(reportPage.getTotal());
        page.setRecords(records);
        return R.ok(page);
    }

    /**
     * 报告详情
     *
     * @param id 报告ID
     * @return 报告基础信息
     */
    @GetMapping("/{id}")
    @SaIgnore
    public R<CryptoReport> detail(@PathVariable String id) {
        CryptoReport report = reportService.getById(id);
        if (report == null) {
            return R.fail("报告不存在");
        }
        return R.ok(report);
    }

    /**
     * 报告最新审核详情
     *
     * @param id 报告ID
     * @return 最新审核记录（若无则返回 null）
     */
    @GetMapping("/{id}/review/latest")
    @SaIgnore
    public R<CryptoReportReview> latestReview(@PathVariable String id) {
        LambdaQueryWrapper<CryptoReportReview> query = new LambdaQueryWrapper<>();
        query.eq(CryptoReportReview::getReportId, id).orderByDesc(CryptoReportReview::getDecisionTime).orderByDesc(CryptoReportReview::getCreateTime).last("limit 1");
        List<CryptoReportReview> list = reviewService.list(query);
        return R.ok(list.isEmpty() ? null : list.get(0));
    }

    /**
     * 审核通过
     *
     * 记录当前登录人为审核人，并保留历史审核记录。
     *
     * @param reportId 报告ID
     * @param confidence 重合度（百分比）
     * @param expectedReturn 预期收益（百分比）
     * @param analyst 分析师或系统标识
     * @param comment 审核意见
     * @return 是否保存成功
     */
    @PostMapping("/review/{reportId}/approve")
    @SaIgnore
    public R<Boolean> approve(
        @PathVariable String reportId,
        @RequestParam(required = false) String reportIdParam,
        @RequestParam(required = false, name = "reportId") String reportIdQuery,
        @RequestParam(required = false, name = "id") String idParam,
        @RequestBody(required = false) Map<String, Object> body,
        @RequestParam(required = false) BigDecimal confidence,
        @RequestParam(required = false) BigDecimal expectedReturn,
        @RequestParam(required = false) String analyst,
        @RequestParam(required = false) String comment
    ) {
        String targetId = resolveReportId(reportId, reportIdParam, reportIdQuery, idParam, body);
        CryptoReport report = reportService.getById(targetId);
        if (report == null) {
            return R.fail("报告不存在: " + targetId);
        }
        Long reviewerId = LoginHelper.getUserId();
        CryptoReportReview rv = new CryptoReportReview();
        rv.setReportId(report.getId());
        rv.setReviewerId(reviewerId);
        rv.setStatus("已通过");
        rv.setConfidence(confidence);
        rv.setExpectedReturn(expectedReturn);
        rv.setAnalyst(analyst);
        rv.setComment(comment);
        rv.setDecisionTime(LocalDateTime.now());
        boolean ok = reviewService.save(rv);
        return ok ? R.ok(true) : R.fail("审核保存失败");
    }

    /**
     * 审核驳回
     *
     * 记录当前登录人为审核人，并保留历史审核记录。
     *
     * @param reportId 报告ID
     * @param confidence 重合度（百分比）
     * @param expectedReturn 预期收益（百分比）
     * @param analyst 分析师或系统标识
     * @param comment 审核意见
     * @return 是否保存成功
     */
    @PostMapping("/review/{reportId}/reject")
    @SaIgnore
    public R<Boolean> reject(
        @PathVariable String reportId,
        @RequestParam(required = false) String reportIdParam,
        @RequestParam(required = false, name = "reportId") String reportIdQuery,
        @RequestParam(required = false, name = "id") String idParam,
        @RequestBody(required = false) Map<String, Object> body,
        @RequestParam(required = false) BigDecimal confidence,
        @RequestParam(required = false) BigDecimal expectedReturn,
        @RequestParam(required = false) String analyst,
        @RequestParam(required = false) String comment
    ) {
        String targetId = resolveReportId(reportId, reportIdParam, reportIdQuery, idParam, body);
        CryptoReport report = reportService.getById(targetId);
        if (report == null) {
            return R.fail("报告不存在: " + targetId);
        }
        Long reviewerId = LoginHelper.getUserId();
        CryptoReportReview rv = new CryptoReportReview();
        rv.setReportId(report.getId());
        rv.setReviewerId(reviewerId);
        rv.setStatus("已驳回");
        rv.setConfidence(confidence);
        rv.setExpectedReturn(expectedReturn);
        rv.setAnalyst(analyst);
        rv.setComment(comment);
        rv.setDecisionTime(LocalDateTime.now());
        boolean ok = reviewService.save(rv);
        return ok ? R.ok(true) : R.fail("审核保存失败");
    }

    private String resolveReportId(String reportIdPath, String reportIdParam, String reportIdQuery, String idParam, Map<String, Object> body) {
        String bodyId = null;
        if (body != null) {
            Object v = body.get("id");
            if (v == null) v = body.get("reportId");
            if (v != null) bodyId = String.valueOf(v);
        }
        String incoming = firstNonEmpty(reportIdParam, reportIdQuery, idParam, bodyId, reportIdPath);
        if (incoming == null) return null;
        String s = incoming.trim();
        if (s.startsWith(":")) {
            s = s.substring(1);
        }
        if (s.startsWith("{") && s.endsWith("}")) {
            s = s.substring(1, s.length() - 1);
        }
        if ("reportId".equalsIgnoreCase(s) || "id".equalsIgnoreCase(s)) {
            return firstNonEmpty(reportIdParam, reportIdQuery, idParam, bodyId);
        }
        return s;
    }
    private String firstNonEmpty(String... arr) {
        if (arr == null) return null;
        for (String a : arr) {
            if (a != null && !a.trim().isEmpty()) return a;
        }
        return null;
    }
}
