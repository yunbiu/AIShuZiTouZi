import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询库存移动详情列表
export async function listMovementOrderDetail(params?: API.Yw.MovementOrderDetailListParams) {
  return request<API.Yw.MovementOrderDetailPageResult>('/api/wms/movementOrderDetail/list', {
    method: 'GET',
    params
  });
}

// 导出库存移动详情列表
export function exportMovementOrderDetail(params?: API.Yw.MovementOrderDetailListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/movementOrderDetail/export`, { params }, `movementOrderDetail_${new Date().getTime()}.xlsx`);
}

// 查询库存移动详情详细
export function getMovementOrderDetail(id: string) {
  return request<API.Yw.MovementOrderDetailResult>(`/api/wms/movementOrderDetail/${id}`, {
    method: 'GET'
  });
}

// 新增库存移动详情
export async function addMovementOrderDetail(params: API.Yw.MovementOrderDetail) {
  return request<API.Result>('/api/wms/movementOrderDetail', {
    method: 'POST',
    data: params
  });
}

// 修改库存移动详情
export async function updateMovementOrderDetail(params: API.Yw.MovementOrderDetail) {
  return request<API.Result>('/api/wms/movementOrderDetail', {
    method: 'PUT',
    data: params
  });
}

// 删除库存移动详情
export async function delMovementOrderDetail(ids: string) {
  return request<API.Result>(`/api/wms/movementOrderDetail/${ids}`, {
    method: 'DELETE'
  });
}

// 查询移库单详情列表
export async function listByMovementOrderId(movementOrderId: string) {
  return request<any>(`/api/wms/movementOrderDetail/list/${movementOrderId}`, {
    method: 'GET'
  });
}