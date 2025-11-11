import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询库存记录列表
export async function listInventoryHistory(params?: API.Yw.InventoryHistoryListParams) {
  return request<API.Yw.InventoryHistoryPageResult>('/api/wms/inventoryHistory/list', {
    method: 'GET',
    params
  });
}

// 导出库存记录列表
export function exportInventoryHistory(params?: API.Yw.InventoryHistoryListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/inventoryHistory/export`, { params }, `inventoryHistory_${new Date().getTime()}.xlsx`);
}

// 查询库存记录详细
export function getInventoryHistory(id: string) {
  return request<API.Yw.InventoryHistoryResult>(`/api/wms/inventoryHistory/${id}`, {
    method: 'GET'
  });
}

// 新增库存记录
export async function addInventoryHistory(params: API.Yw.InventoryHistory) {
  return request<API.Result>('/api/wms/inventoryHistory', {
    method: 'POST',
    data: params
  });
}

// 修改库存记录
export async function updateInventoryHistory(params: API.Yw.InventoryHistory) {
  return request<API.Result>('/api/wms/inventoryHistory', {
    method: 'PUT',
    data: params
  });
}

// 删除库存记录
export async function delInventoryHistory(ids: string) {
  return request<API.Result>(`/api/wms/inventoryHistory/${ids}`, {
    method: 'DELETE'
  });
}