declare namespace API.Yw {
    export interface ReceiptOrderDetail {
        id: string;
        receiptOrderId: string;
        skuId: string;
        quantity: string;
        amount: string;
        batchNo: string;
        productionDate: Date;
        expirationDate: Date;
        remark: string;
        warehouseId: string;
        areaId: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    export interface ReceiptOrderDetailListParams {
        id?: string;
        receiptOrderId?: string;
        skuId?: string;
        quantity?: string;
        amount?: string;
        batchNo?: string;
        productionDate?: string;
        expirationDate?: string;
        remark?: string;
        warehouseId?: string;
        areaId?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    export interface ReceiptOrderDetailResult {
        code: number;
        msg: string;
        data: ReceiptOrderDetail;
    }

    export interface ReceiptOrderDetailPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ReceiptOrderDetail[];
    }
}