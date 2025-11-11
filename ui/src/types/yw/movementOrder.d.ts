declare namespace API.Yw {
    // 定义 MovementOrder 接口，包含 BaseEntity 和 MovementOrderBo 的属性
    export interface MovementOrder {
        id: string;
        movementOrderNo: string;
        sourceWarehouseId: string;
        sourceAreaId?: string;
        targetWarehouseId: string;
        targetAreaId?: string;
        movementOrderStatus: number;
        totalQuantity?: number;
        remark?: string;
        details: MovementOrderDetail[];
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 MovementOrder 列表查询参数接口
    export interface MovementOrderListParams {
        id?: string;
        movementOrderNo?: string;
        sourceWarehouseId?: string;
        sourceAreaId?: string;
        targetWarehouseId?: string;
        targetAreaId?: string;
        movementOrderStatus?: number;
        totalQuantity?: number;
        remark?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 MovementOrder 查询结果接口
    export interface MovementOrderResult {
        code: number;
        msg: string;
        data: MovementOrder;
    }

    // 定义 MovementOrder 分页查询结果接口
    export interface MovementOrderPageResult {
        code: number;
        msg: string;
        total: number;
        rows: MovementOrder[];
    }
}