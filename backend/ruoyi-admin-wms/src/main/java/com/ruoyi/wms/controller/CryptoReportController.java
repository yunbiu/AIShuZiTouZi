package com.ruoyi.wms.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.wms.domain.entity.CryptoReport;
import com.ruoyi.wms.service.CryptoReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * 加密投资报告接口
 *
 * 功能：
 * - 导入报告数据
 * - 通过 MyBatis-Plus 批量入库到 crypto_report 表
 */
@RestController
@SaIgnore
@RequestMapping("/crypto/report")
@RequiredArgsConstructor
public class CryptoReportController {

    private final CryptoReportService reportService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 导入报告数据
     *
     */
    @PostMapping("/import")
    @SaIgnore
    public R<Integer> importReports(@RequestBody String body) {
        try {
            String trimmed = body == null ? "" : body.trim();
            List<Map<String, Object>> items;
            if (trimmed.startsWith("[")) {
                items = objectMapper.readValue(trimmed, new TypeReference<List<Map<String, Object>>>() {});
            } else {
                Map<String, Object> obj = objectMapper.readValue(trimmed, new TypeReference<Map<String, Object>>() {});
                Object data = obj.get("data");
                if (data == null) {
                    data = obj.get("test");
                }
                if (data == null) {
                    return R.fail("参数不能为空，需直接传数组或对象中包含data或test字段");
                }
                String payload = (data instanceof String) ? (String) data : objectMapper.writeValueAsString(data);
                items = objectMapper.readValue(payload, new TypeReference<List<Map<String, Object>>>() {});
            }
            List<CryptoReport> toSave = new ArrayList<>();
            for (Map<String, Object> m : items) {
                CryptoReport r = new CryptoReport();
                Object id = m.get("id");
                if (id == null) {
                    id = m.get("ID");
                }
                r.setId(id == null ? null : String.valueOf(id));
                Object gt = m.get("Generation_Time");
                if (gt == null) {
                    gt = m.get("generation_time");
                }
                if (gt != null) {
                    r.setGenerationTime(LocalDateTime.parse(String.valueOf(gt)));
                }
                Object ic = m.get("Involved_Currencies");
                if (ic == null) {
                    ic = m.get("involved_currencies");
                }
                r.setInvolvedCurrencies(ic == null ? null : String.valueOf(ic));
                Object st = m.get("Suggestion_Type");
                if (st == null) {
                    st = m.get("suggestion_type");
                }
                r.setSuggestionType(st == null ? null : String.valueOf(st));
                Object s = m.get("Suggestions");
                if (s == null) {
                    s = m.get("suggestions");
                }
                r.setSuggestions(s == null ? null : String.valueOf(s));
                Object uid = m.get("user_id");
                if (uid == null) {
                    uid = m.get("userId");
                }
                r.setUserId(uid == null ? null : Long.valueOf(String.valueOf(uid)));
                toSave.add(r);
            }
            boolean ok = reportService.saveBatch(toSave);
            if (!ok) {
                return R.fail("保存失败");
            }
            return R.ok(toSave.size());
        } catch (Exception e) {
            return R.fail("解析或保存失败: " + e.getMessage());
        }
    }
}
