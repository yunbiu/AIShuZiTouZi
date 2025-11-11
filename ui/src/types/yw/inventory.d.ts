declare namespace API.Yw {
    // 定义 Inventory 接口，继承自 BaseEntity 的字段
    export interface Inventory {
        id: number;
        skuId: number;
        warehouseId: number;
        areaId: number;
        quantity: number;
        remark?: string;
        minQuantity?: number;
        itemName?: string;
        itemCode?: string;
        skuName?: string;
        skuCode?: string;
        itemId?: number;
        itemCategory?: number;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 Inventory 列表查询参数接口
    export interface InventoryListParams {
        id?: number;
        skuId?: number;
        warehouseId?: number;
        areaId?: number;
        quantity?: number;
        remark?: string;
        minQuantity?: number;
        itemName?: string;
        itemCode?: string;
        skuName?: string;
        skuCode?: string;
        itemId?: number;
        itemCategory?: number;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 Inventory 查询结果接口
    export interface InventoryResult {
        code: number;
        msg: string;
        data: Inventory;
    }

    // 定义 Inventory 分页查询结果接口
    export interface InventoryPageResult {
        code: number;
        msg: string;
        total: number;
        rows: Inventory[];
    }
}