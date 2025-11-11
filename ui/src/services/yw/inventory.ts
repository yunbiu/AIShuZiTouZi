import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询库存列表
export async function listInventory(params?: API.Yw.InventoryListParams) {
  return request<API.Yw.InventoryPageResult>('/api/wms/inventory/list', {
    method: 'GET',
    params
  });
}

// 查询库存看板仓库维度列表
export async function listInventoryBoard(params?: API.Yw.InventoryListParams, type: string) {
  return request<API.Yw.InventoryPageResult>(`/api/wms/inventory/boardList/${type}`, {
    method: 'GET',
    params
  });
}

// 查询库存详细
export function getInventory(id: string) {
  return request<API.Yw.InventoryResult>(`/api/wms/inventory/${id}`, {
    method: 'GET'
  });
}

// 新增库存
export async function addInventory(params: API.Yw.Inventory) {
  return request<API.Result>('/api/wms/inventory', {
    method: 'POST',
    data: params
  });
}

// 修改库存
export async function updateInventory(params: API.Yw.Inventory) {
  return request<API.Result>('/api/wms/inventory', {
    method: 'PUT',
    data: params
  });
}

// 删除库存
export async function delInventory(ids: string) {
  return request<API.Result>(`/api/wms/inventory/${ids}`, {
    method: 'DELETE'
  });
}

// 导出库存列表
export function exportInventory(params?: API.Yw.InventoryListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/inventory/export`, { params }, `inventory_${new Date().getTime()}.xlsx`);
}