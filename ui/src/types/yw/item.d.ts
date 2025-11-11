declare namespace API.Yw {
    // 定义 Item 接口，继承自 ManagerCenter 中的通用字段
    export interface Item {
        id: string;
        itemCode: string;
        itemName: string;
        itemCategory: string;
        unit: string;
        itemBrand: string;
        remark: string;
        sku: ItemSku[];
        // 继承自 BaseEntity 的字段
        searchValue: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 ItemSku 接口，这里暂时只做占位，你可以根据实际情况补充
    export interface ItemSku {
        // 待补充具体属性
    }

    // 定义 Item 列表查询参数接口
    export interface ItemListParams {
        id?: string;
        itemCode?: string;
        itemName?: string;
        itemCategory?: string;
        unit?: string;
        itemBrand?: string;
        remark?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 Item 查询结果接口
    export interface ItemResult {
        code: number;
        msg: string;
        data: Item;
    }

    // 定义 Item 分页查询结果接口
    export interface ItemPageResult {
        code: number;
        msg: string;
        total: number;
        rows: Item[];
    }
}