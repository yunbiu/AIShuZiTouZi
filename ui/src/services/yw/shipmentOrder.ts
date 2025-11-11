import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询出库单列表
export async function listShipmentOrder(params?: API.Yw.ShipmentOrderListParams) {
  return request<API.Yw.ShipmentOrderPageResult>('/api/wms/shipmentOrder/list', {
    method: 'GET',
    params
  });
}

// 导出出库单列表
export function exportShipmentOrder(params?: API.Yw.ShipmentOrderListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/shipmentOrder/export`, { params }, `shipmentOrder_${new Date().getTime()}.xlsx`);
}

// 查询出库单详细
export function getShipmentOrder(id: string) {
  return request<API.Yw.ShipmentOrderResult>(`/api/wms/shipmentOrder/${id}`, {
    method: 'GET'
  });
}

// 新增出库单
export async function addShipmentOrder(params: API.Yw.ShipmentOrder) {
  return request<API.Result>('/api/wms/shipmentOrder', {
    method: 'POST',
    data: params
  });
}

// 修改出库单
export async function updateShipmentOrder(params: API.Yw.ShipmentOrder) {
  return request<API.Result>('/api/wms/shipmentOrder', {
    method: 'PUT',
    data: params
  });
}

// 出库
export async function shipment(params: API.Yw.ShipmentOrder) {
  return request<API.Result>('/api/wms/shipmentOrder/shipment', {
    method: 'PUT',
    data: params
  });
}

// 删除出库单
export async function delShipmentOrder(id: string) {
  return request<API.Result>(`/api/wms/shipmentOrder/${id}`, {
    method: 'DELETE'
  });
}