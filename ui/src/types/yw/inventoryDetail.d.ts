declare namespace API.Yw {
    // 定义 InventoryDetail 接口，继承自 BaseEntity 的字段
    export interface InventoryDetail {
        id: number;
        receiptOrderId: number;
        receiptOrderType: string;
        orderNo: string;
        type: number;
        skuId: number;
        warehouseId: number;
        areaId: number;
        quantity: number;
        batchNo?: string;
        productionDate?: Date;
        expirationDate: Date;
        amount: number;
        remark: string;
        remainQuantity: number;
        shipmentQuantity?: number;
        itemName?: string;
        itemCode?: string;
        skuName?: string;
        skuCode?: string;
        itemId?: number;
        createStartTime?: Date;
        createEndTime?: Date;
        daysToExpires?: number;
        expirationStartTime?: Date;
        expirationEndTime?: Date;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 InventoryDetail 列表查询参数接口
    export interface InventoryDetailListParams {
        id?: number;
        receiptOrderId?: number;
        receiptOrderType?: string;
        orderNo?: string;
        type?: number;
        skuId?: number;
        warehouseId?: number;
        areaId?: number;
        quantity?: number;
        batchNo?: string;
        productionDate?: string;
        expirationDate?: string;
        amount?: number;
        remark?: string;
        remainQuantity?: number;
        shipmentQuantity?: number;
        itemName?: string;
        itemCode?: string;
        skuName?: string;
        skuCode?: string;
        itemId?: number;
        createStartTime?: string;
        createEndTime?: string;
        daysToExpires?: number;
        expirationStartTime?: string;
        expirationEndTime?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 InventoryDetail 查询结果接口
    export interface InventoryDetailResult {
        code: number;
        msg: string;
        data: InventoryDetail;
    }

    // 定义 InventoryDetail 分页查询结果接口
    export interface InventoryDetailPageResult {
        code: number;
        msg: string;
        total: number;
        rows: InventoryDetail[];
    }
}