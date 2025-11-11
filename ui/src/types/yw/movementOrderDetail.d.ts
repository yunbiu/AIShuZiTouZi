declare namespace API.Yw {
    // 定义 MovementOrderDetail 接口，包含 BaseEntity 和 MovementOrderDetailBo 的属性
    export interface MovementOrderDetail {
        id: string;
        movementOrderId: string;
        skuId: string;
        quantity: number;
        remark: string;
        batchNo?: string;
        productionDate?: Date;
        expirationDate?: Date;
        sourceWarehouseId: string;
        sourceAreaId: string;
        targetWarehouseId: string;
        targetAreaId: string;
        inventoryDetailId: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 MovementOrderDetail 列表查询参数接口
    export interface MovementOrderDetailListParams {
        id?: string;
        movementOrderId?: string;
        skuId?: string;
        quantity?: number;
        remark?: string;
        batchNo?: string;
        productionDate?: string;
        expirationDate?: string;
        sourceWarehouseId?: string;
        sourceAreaId?: string;
        targetWarehouseId?: string;
        targetAreaId?: string;
        inventoryDetailId?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 MovementOrderDetail 查询结果接口
    export interface MovementOrderDetailResult {
        code: number;
        msg: string;
        data: MovementOrderDetail;
    }

    // 定义 MovementOrderDetail 分页查询结果接口
    export interface MovementOrderDetailPageResult {
        code: number;
        msg: string;
        total: number;
        rows: MovementOrderDetail[];
    }
}