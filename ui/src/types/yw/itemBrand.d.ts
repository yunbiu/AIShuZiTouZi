declare namespace API.Yw {
    // 定义 ItemBrand 接口，包含 ItemBrandBo 和 BaseEntity 的属性
    export interface ItemBrand {
        id: string;
        brandName: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 ItemBrand 列表查询参数接口
    export interface ItemBrandListParams {
        id?: string;
        brandName?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 ItemBrand 查询结果接口
    export interface ItemBrandResult {
        code: number;
        msg: string;
        data: ItemBrand;
    }

    // 定义 ItemBrand 分页查询结果接口
    export interface ItemBrandPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ItemBrand[];
    }
}