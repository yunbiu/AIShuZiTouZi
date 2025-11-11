declare namespace API.Yw {
    // 定义 CheckOrder 接口，包含 BaseEntity 和 CheckOrderBo 的属性
    export interface CheckOrder {
        id: string;
        checkOrderNo: string;
        checkOrderStatus: number;
        checkOrderTotal: number;
        warehouseId: string;
        areaId?: string;
        remark?: string;
        details: CheckOrderDetail[];
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 CheckOrder 列表查询参数接口
    export interface CheckOrderListParams {
        id?: string;
        checkOrderNo?: string;
        checkOrderStatus?: number;
        checkOrderTotal?: number;
        warehouseId?: string;
        areaId?: string;
        remark?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 CheckOrder 查询结果接口
    export interface CheckOrderResult {
        code: number;
        msg: string;
        data: CheckOrder;
    }

    // 定义 CheckOrder 分页查询结果接口
    export interface CheckOrderPageResult {
        code: number;
        msg: string;
        total: number;
        rows: CheckOrder[];
    }
}