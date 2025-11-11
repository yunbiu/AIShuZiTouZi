import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询库存盘点单据列表（分页）
export async function listCheckOrder(params?: API.Yw.CheckOrderListParams) {
  return request<API.Yw.CheckOrderPageResult>('/api/wms/checkOrder/list', {
    method: 'GET',
    params
  });
}

// 导出库存盘点单据列表
export function exportCheckOrder(params?: API.Yw.CheckOrderListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/checkOrder/export`, { params }, `checkOrder_${new Date().getTime()}.xlsx`);
}

// 查询库存盘点单据详细
export function getCheckOrder(id: string) {
  return request<API.Yw.CheckOrderResult>(`/api/wms/checkOrder/${id}`, {
    method: 'GET'
  });
}

// 新增库存盘点单据
export async function addCheckOrder(params: API.Yw.CheckOrder) {
  return request<API.Result>('/api/wms/checkOrder', {
    method: 'POST',
    data: params
  });
}

// 修改库存盘点单据
export async function updateCheckOrder(params: API.Yw.CheckOrder) {
  return request<API.Result>('/api/wms/checkOrder', {
    method: 'PUT',
    data: params
  });
}

// 盘库结束
export async function check(params: API.Yw.CheckOrder) {
  return request<API.Result>('/api/wms/checkOrder/check', {
    method: 'POST',
    data: params
  });
}

// 删除库存盘点单据
export async function delCheckOrder(id: string) {
  return request<API.Result>(`/api/wms/checkOrder/${id}`, {
    method: 'DELETE'
  });
}