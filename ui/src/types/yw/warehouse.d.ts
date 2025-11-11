declare namespace API.Yw {
    export interface Warehouse {
        id: string;
        warehouseCode: string;
        warehouseName: string;
        remark: string;
        orderNum: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    export interface WarehouseListParams {
        id?: string;
        warehouseCode?: string;
        warehouseName?: string;
        remark?: string;
        orderNum?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    export interface WarehouseResult {
        code: number;
        msg: string;
        data: Warehouse;
    }

    export interface WarehousePageResult {
        code: number;
        msg: string;
        total: number;
        rows: Warehouse[];
    }
}