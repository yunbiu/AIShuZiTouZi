declare namespace API.Yw {
    export interface ShipmentOrder {
        id: string;
        shipmentOrderNo: string;
        shipmentOrderType: string;
        orderNo: string;
        merchantId: string;
        receivableAmount: string;
        totalQuantity: string;
        shipmentOrderStatus: string;
        warehouseId: string;
        areaId: string;
        remark: string;
        details: ShipmentOrderDetail[];
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    export interface ShipmentOrderListParams {
        id?: string;
        shipmentOrderNo?: string;
        shipmentOrderType?: string;
        orderNo?: string;
        merchantId?: string;
        receivableAmount?: string;
        totalQuantity?: string;
        shipmentOrderStatus?: string;
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

    export interface ShipmentOrderResult {
        code: number;
        msg: string;
        data: ShipmentOrder;
    }

    export interface ShipmentOrderPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ShipmentOrder[];
    }
}