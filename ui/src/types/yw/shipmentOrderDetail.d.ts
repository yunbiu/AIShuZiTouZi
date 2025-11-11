declare namespace API.Yw {
    export interface ShipmentOrderDetail {
        id: string;
        shipmentOrderId: string;
        skuId: string;
        quantity: string;
        amount: string;
        warehouseId: string;
        areaId: string;
        batchNo: string;
        productionDate: Date;
        expirationDate: Date;
        inventoryDetailId: string;
        remark: string;
        createBy: string;
        createTime: Date;
        updateBy: string;
        updateTime: Date;
    }

    export interface ShipmentOrderDetailListParams {
        id?: string;
        shipmentOrderId?: string;
        skuId?: string;
        quantity?: string;
        amount?: string;
        warehouseId?: string;
        areaId?: string;
        batchNo?: string;
        productionDate?: string;
        expirationDate?: string;
        inventoryDetailId?: string;
        remark?: string;
        searchValue?: string;
        createBy?: string;
        createTime?: string;
        updateBy?: string;
        updateTime?: string;
        pageSize?: string;
        current?: string;
    }

    export interface ShipmentOrderDetailResult {
        code: number;
        msg: string;
        data: ShipmentOrderDetail;
    }

    export interface ShipmentOrderDetailPageResult {
        code: number;
        msg: string;
        total: number;
        rows: ShipmentOrderDetail[];
    }
}