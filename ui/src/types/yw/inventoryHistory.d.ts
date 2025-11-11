declare namespace API.Yw {
    // 定义 InventoryHistory 接口，继承自 BaseEntity 的字段
    export interface InventoryHistory {
        id: number;
        orderId: number;
        orderNo: string;
        orderType: number;
        skuId: number;
        batchNo?: string;
        productionDate?: Date;
        expirationDate?: Date;
        amount?: number;
        quantity: number;
        remark: string;
        warehouseId: number;
        areaId: number;
        itemName?: string;
        itemCode?: string;
        skuName?: string;
        skuCode?: string;
        startTime?: string;
        endTime?: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 InventoryHistory 列表查询参数接口
    export interface InventoryHistoryListParams {
        id?: number;
        orderId?: number;
        orderNo?: string;
        orderType?: number;
        skuId?: number;
        batchNo?: string;
        productionDate?: string;
        expirationDate?: string;
        amount?: number;
        quantity?: number;
        remark?: string;
        warehouseId?: number;
        areaId?: number;
        itemName?: string;
        itemCode?: string;
        skuName?: string;
        skuCode?: string;
        startTime?: string;
        endTime?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 InventoryHistory 查询结果接口
    export interface InventoryHistoryResult {
        code: number;
        msg: string;
        data: InventoryHistory;
    }

    // 定义 InventoryHistory 分页查询结果接口
    export interface InventoryHistoryPageResult {
        code: number;
        msg: string;
        total: number;
        rows: InventoryHistory[];
    }
}