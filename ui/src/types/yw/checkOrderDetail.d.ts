declare namespace API.Yw {
    // 定义 CheckOrderDetail 接口，包含 BaseEntity 和 CheckOrderDetailBo 的属性
    export interface CheckOrderDetail {
        id: string;
        checkOrderId: string;
        skuId: string;
        quantity: number;
        checkQuantity: number;
        profitAndLoss?: number;
        warehouseId: string;
        areaId: string;
        batchNo?: string;
        productionDate?: Date;
        expirationDate?: Date;
        receiptTime?: Date;
        inventoryDetailId: string;
        remark: string;
        haveProfitAndLoss?: boolean;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 CheckOrderDetail 列表查询参数接口
    export interface CheckOrderDetailListParams {
        id?: string;
        checkOrderId?: string;
        skuId?: string;
        quantity?: number;
        checkQuantity?: number;
        profitAndLoss?: number;
        warehouseId?: string;
        areaId?: string;
        batchNo?: string;
        productionDate?: string;
        expirationDate?: string;
        receiptTime?: string;
        inventoryDetailId?: string;
        remark?: string;
        haveProfitAndLoss?: boolean;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 CheckOrderDetail 查询结果接口
    export interface CheckOrderDetailResult {
        code: number;
        msg: string;
        data: CheckOrderDetail;
    }

    // 定义 CheckOrderDetail 分页查询结果接口
    export interface CheckOrderDetailPageResult {
        code: number;
        msg: string;
        total: number;
        rows: CheckOrderDetail[];
    }
}