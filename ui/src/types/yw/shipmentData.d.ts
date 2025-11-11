declare namespace API.Yw {
    // 引入已定义的 Inventory 和 InventoryDetail 接口
    import { Inventory } from './inventory';
    import { InventoryDetail } from './inventoryDetail';

    export interface ShipmentData {
        shipmentInventoryDetailList: InventoryDetail[];
        shipmentInventoryList: Inventory[];
    }
}