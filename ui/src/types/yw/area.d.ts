declare namespace API.Yw {
    // 定义 Area 接口，包含 AreaBo 和 BaseEntity 的属性
    export interface Area {
        id: string;
        areaCode: string;
        areaName: string;
        warehouseId: string;
        remark: string;
        searchValue?: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 Area 列表查询参数接口
    export interface AreaListParams {
        id?: string;
        areaCode?: string;
        areaName?: string;
        warehouseId?: string;
        remark?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 Area 查询结果接口
    export interface AreaResult {
        code: number;
        msg: string;
        data: Area;
    }

    // 定义 Area 分页查询结果接口
    export interface AreaPageResult {
        code: number;
        msg: string;
        total: number;
        rows: Area[];
    }
}