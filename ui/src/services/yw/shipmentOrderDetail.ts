import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询出库单详情列表
export async function listShipmentOrderDetail(params?: API.Yw.ShipmentOrderDetailListParams) {
  return request<API.Yw.ShipmentOrderDetailPageResult>('/api/wms/shipmentOrderDetail/list', {
    method: 'GET',
    params
  });
}

// 导出出库单详情列表
export function exportShipmentOrderDetail(params?: API.Yw.ShipmentOrderDetailListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/shipmentOrderDetail/export`, { params }, `shipmentOrderDetail_${new Date().getTime()}.xlsx`);
}

// 查询出库单详情详细
export function getShipmentOrderDetail(id: string) {
  return request<API.Yw.ShipmentOrderDetailResult>(`/api/wms/shipmentOrderDetail/${id}`, {
    method: 'GET'
  });
}

// 新增出库单详情
export async function addShipmentOrderDetail(params: API.Yw.ShipmentOrderDetail) {
  return request<API.Result>('/api/wms/shipmentOrderDetail', {
    method: 'POST',
    data: params
  });
}

// 修改出库单详情
export async function updateShipmentOrderDetail(params: API.Yw.ShipmentOrderDetail) {
  return request<API.Result>('/api/wms/shipmentOrderDetail', {
    method: 'PUT',
    data: params
  });
}

// 删除出库单详情
export async function delShipmentOrderDetail(ids: string) {
  return request<API.Result>(`/api/wms/shipmentOrderDetail/${ids}`, {
    method: 'DELETE'
  });
}

// 根据出库单id查询出库单详情列表
export async function listByShipmentOrderId(shipmentOrderId: string) {
  return request<any>(`/api/wms/shipmentOrderDetail/list/${shipmentOrderId}`, {
    method: 'GET'
  });
}