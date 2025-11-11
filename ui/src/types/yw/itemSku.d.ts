declare namespace API.Yw {
    // 定义 ItemSku 接口，包含 ItemSkuBo 和 BaseEntity 的属性
    export interface ItemSku {
        id: string;
        skuName: string;
        itemId: string;
        barcode: string;
        skuCode: string;
        length: number;
        width: number;
        height: number;
        grossWeight: number;
        netWeight: number;
        costPrice: number;
        sellingPrice: number;
        itemName: string;
        itemCode: string;
        itemCategory: string;
        itemBrand: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    // 定义 ItemSku 列表查询参数接口
    export interface ItemSkuListParams {
        id?: string;
        skuName?: string;
        itemId?: string;
        barcode?: string;
        skuCode?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 ItemSku 查询结果接口
    export interface ItemSkuResult {
        code: number;
        msg: string;
        data: ItemSku;
    }

    // 定义 ItemSku 分页查询结果接口
    export interface ItemSkuPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ItemSku[];
    }
}