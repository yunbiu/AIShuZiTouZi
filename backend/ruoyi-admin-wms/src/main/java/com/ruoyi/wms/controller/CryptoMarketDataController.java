package com.ruoyi.wms.controller;

import cn.dev33.satoken.annotation.SaIgnore;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.ruoyi.common.core.domain.R;
import com.ruoyi.common.satoken.utils.LoginHelper;
import com.ruoyi.wms.domain.entity.CryptoMarketData;
import com.ruoyi.wms.service.CryptoMarketDataService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@SaIgnore
@RequestMapping("/crypto/market")
@RequiredArgsConstructor
@CrossOrigin
public class CryptoMarketDataController {

    private final CryptoMarketDataService marketDataService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /*
    *  请求智能体分析报告
    */
    @PostMapping("/dify/chat-messages")
    public String chatMessages() {
        Long userId = LoginHelper.getUserId();
        String Dify_API_KEY = "app-XCDiEV00OOooKcksPQbz6Y69";
        String url = "http://127.0.0.1/v1/workflows/run";

        try {
            URL workflowUrl = new URL(url);
            HttpURLConnection connection = (HttpURLConnection) workflowUrl.openConnection();

            connection.setRequestMethod("POST");
            connection.setRequestProperty("Authorization", "Bearer " + Dify_API_KEY);
            connection.setRequestProperty("Content-Type", "application/json");
            connection.setDoOutput(true);
            Map<String, Object> requestBody = new HashMap<>();
            Map<String, Object> inputs = new HashMap<>();
            inputs.put("id", userId != null ? userId : 0);
            requestBody.put("inputs", inputs);
            requestBody.put("user", userId != null ? "user-" + userId : "anonymous");
            requestBody.put("response_mode", "streaming");

            String jsonBody = objectMapper.writeValueAsString(requestBody);
            System.out.println("Sending request: " + jsonBody);

            try (OutputStream os = connection.getOutputStream()) {
                byte[] input = jsonBody.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }

            int responseCode = connection.getResponseCode();
            System.out.println("Response Code: " + responseCode);

            if (responseCode != 200) {
                InputStream errorStream = connection.getErrorStream();
                if (errorStream != null) {
                    try (BufferedReader br = new BufferedReader(new InputStreamReader(errorStream, StandardCharsets.UTF_8))) {
                        StringBuilder errorResponse = new StringBuilder();
                        String line;
                        while ((line = br.readLine()) != null) {
                            errorResponse.append(line);
                        }
                        System.err.println("Error Response: " + errorResponse.toString());
                        return "{\"error\":\"HTTP " + responseCode + ": " + errorResponse.toString() + "\"}";
                    }
                }
            }

            try (BufferedReader br = new BufferedReader(
                new InputStreamReader(connection.getInputStream(), StandardCharsets.UTF_8))) {
                StringBuilder response = new StringBuilder();
                String responseLine;
                while ((responseLine = br.readLine()) != null) {
                    response.append(responseLine.trim());
                }
                return response.toString();
            }
        } catch (Exception e) {
            e.printStackTrace();
            return "{\"error\":\"" + e.getMessage() + "\"}";
        }
    }
    /*
    * 导入网页爬取内容
    */
    @PostMapping("/import")
    @SaIgnore
    public R<Integer> importData(@RequestBody String body) {
        try {
            List<CryptoMarketData> items;
            String trimmed = body == null ? "" : body.trim();
            if (trimmed.startsWith("[")) {
                items = objectMapper.readValue(trimmed, new TypeReference<List<CryptoMarketData>>() {});
            } else {
                Map<String, Object> obj = objectMapper.readValue(trimmed, new TypeReference<Map<String, Object>>() {});
                Object test = obj.get("test");
                if (test == null) {
                    return R.fail("参数不能为空，需直接传数组或对象中包含test字段");
                }
                String payload = (test instanceof String) ? (String) test : objectMapper.writeValueAsString(test);
                items = objectMapper.readValue(payload, new TypeReference<List<CryptoMarketData>>() {});
            }
            LocalDateTime now = LocalDateTime.now();
            List<CryptoMarketData> toSave = items.stream().peek(i -> i.setCreateTime(now)).collect(Collectors.toList());
            boolean ok = marketDataService.saveBatch(toSave);
            if (!ok) {
                return R.fail("保存失败");
            }
            return R.ok(toSave.size());
        } catch (Exception e) {
            return R.fail("解析或保存失败: " + e.getMessage());
        }
    }
}
