declare namespace API.Yw {
    // 定义 ItemCategory 接口，包含 ItemCategoryBo 和 BaseEntity 的属性
    export interface ItemCategory {
        id: string;
        parentId: string; // 注意在 Java 里是 Long，这里用 string 表示
        categoryName: string;
        orderNum: string; // 注意在 Java 里是 Long，这里用 string 表示
        status: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 ItemCategory 列表查询参数接口
    export interface ItemCategoryListParams {
        id?: string;
        parentId?: string;
        categoryName?: string;
        orderNum?: string;
        status?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 ItemCategory 查询结果接口
    export interface ItemCategoryResult {
        code: number;
        msg: string;
        data: ItemCategory;
    }

    // 定义 ItemCategory 分页查询结果接口
    export interface ItemCategoryPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ItemCategory[];
    }
}