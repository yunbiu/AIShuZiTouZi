import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询移库单列表
export async function listMovementOrder(params?: API.Yw.MovementOrderListParams) {
  return request<API.Yw.MovementOrderPageResult>('/api/wms/movementOrder/list', {
    method: 'GET',
    params
  });
}

// 导出移库单列表
export function exportMovementOrder(params?: API.Yw.MovementOrderListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/movementOrder/export`, { params }, `movementOrder_${new Date().getTime()}.xlsx`);
}

// 查询移库单详细
export function getMovementOrder(id: string) {
  return request<API.Yw.MovementOrderResult>(`/api/wms/movementOrder/${id}`, {
    method: 'GET'
  });
}

// 新增移库单
export async function addMovementOrder(params: API.Yw.MovementOrder) {
  return request<API.Result>('/api/wms/movementOrder', {
    method: 'POST',
    data: params
  });
}

// 修改移库单
export async function updateMovementOrder(params: API.Yw.MovementOrder) {
  return request<API.Result>('/api/wms/movementOrder', {
    method: 'PUT',
    data: params
  });
}

// 移库
export async function movement(params: API.Yw.MovementOrder) {
  return request<API.Result>('/api/wms/movementOrder/move', {
    method: 'POST',
    data: params
  });
}

// 删除移库单
export async function delMovementOrder(id: string) {
  return request<API.Result>(`/api/wms/movementOrder/${id}`, {
    method: 'DELETE'
  });
}