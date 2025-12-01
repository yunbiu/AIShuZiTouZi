package com.ruoyi.wms.domain.query;

import lombok.Data;

/**
 * 消息查询参数
 */
@Data
public class CryptoMessageQuery {

    /**
     * 币种筛选
     */
    private String coin;

    /**
     * 情感倾向
     */
    private String sentiment;

    /**
     * 关键词搜索
     */
    private String keyword;

    /**
     * 页码
     */
    private Integer pageNum = 1;

    /**
     * 每页大小
     */
    private Integer pageSize = 5;
}
