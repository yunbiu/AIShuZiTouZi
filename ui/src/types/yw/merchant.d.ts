declare namespace API.Yw {
    // 定义 Merchant 接口，包含 MerchantBo 和 BaseEntity 的属性
    export interface Merchant {
        id: string;
        merchantCode: string;
        merchantName: string;
        merchantType: number;
        merchantLevel: string;
        bankName: string;
        bankAccount: string;
        address: string;
        mobile: string;
        tel: string;
        contactPerson: string;
        email: string;
        remark: string;
        createBy: string;
        createTime: string;
        updateBy: string;
        updateTime: string;
    }

    // 定义 Merchant 列表查询参数接口
    export interface MerchantListParams {
        id?: string;
        merchantCode?: string;
        merchantName?: string;
        merchantType?: number;
        merchantLevel?: string;
        bankName?: string;
        bankAccount?: string;
        address?: string;
        mobile?: string;
        tel?: string;
        contactPerson?: string;
        email?: string;
        remark?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        searchValue?: string;
        pageSize?: string;
        current?: string;
    }

    // 定义单个 Merchant 查询结果接口
    export interface MerchantResult {
        code: number;
        msg: string;
        data: Merchant;
    }

    // 定义 Merchant 分页查询结果接口
    export interface MerchantPageResult {
        code: number;
        msg: string;
        total: number;
        rows: Merchant[];
    }
}