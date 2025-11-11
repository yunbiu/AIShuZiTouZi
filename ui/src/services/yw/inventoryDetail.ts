import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 分页查询库存详情列表
export async function listInventoryDetail(query?: API.Yw.InventoryDetailListParams) {
  return request<API.Yw.InventoryDetailPageResult>('/api/wms/inventoryDetail/list', {
    method: 'GET',
    params: query
  });
}

// 查询库存详情列表（无分页，盘库时需要）
export async function listInventoryDetailNoPage(query?: API.Yw.InventoryDetailListParams) {
  return request<API.Yw.InventoryDetailResult>('/api/wms/inventoryDetail/listNoPage', {
    method: 'GET',
    params: query
  });
}

// 导出库存详情列表
export function exportInventoryDetail(params?: API.Yw.InventoryDetailListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/inventoryDetail/export`, { params }, `inventoryDetail_${new Date().getTime()}.xlsx`);
}

// 查询库存详情详细
export function getInventoryDetail(id: string) {
  return request<API.Yw.InventoryDetailResult>(`/api/wms/inventoryDetail/${id}`, {
    method: 'GET'
  });
}

// 新增库存详情
export async function addInventoryDetail(data: API.Yw.InventoryDetail) {
  return request<API.Result>('/api/wms/inventoryDetail', {
    method: 'POST',
    data
  });
}

// 修改库存详情
export async function updateInventoryDetail(data: API.Yw.InventoryDetail) {
  return request<API.Result>('/api/wms/inventoryDetail', {
    method: 'PUT',
    data
  });
}

// 删除库存详情
export async function delInventoryDetail(ids: string) {
  return request<API.Result>(`/api/wms/inventoryDetail/${ids}`, {
    method: 'DELETE'
  });
}