package com.ruoyi.wms.domain.query;

import lombok.Data;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.RequestParam;

import java.time.LocalDateTime;

/**
 * 消息查询条件封装类
 */
@Data
public class CryptoMessageQuery {
    // 分页参数

    private Integer pageNum = 1;

    private Integer pageSize = 100;

    // 筛选参数
    private String coin; // required=false默认生效，无需额外注解
    private String sentiment;
    private String keyword;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss") // 时间格式转换
    private LocalDateTime startTime;

    private Integer status;
}
