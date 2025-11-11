declare namespace API.Yw {
    export interface ReceiptOrder {
        id: string;
        receiptOrderNo: string;
        receiptOrderType: string;
        merchantId: string;
        orderNo: string;
        totalQuantity: string;
        payableAmount: string;
        receiptOrderStatus: string;
        warehouseId: string;
        areaId: string;
        remark: string;
        details: ReceiptOrderDetail[];
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    export interface ReceiptOrderListParams {
        id?: string;
        receiptOrderNo?: string;
        receiptOrderType?: string;
        merchantId?: string;
        orderNo?: string;
        totalQuantity?: string;
        payableAmount?: string;
        receiptOrderStatus?: string;
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

    export interface ReceiptOrderResult {
        code: number;
        msg: string;
        data: ReceiptOrder;
    }

    export interface ReceiptOrderPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ReceiptOrder[];
    }
}