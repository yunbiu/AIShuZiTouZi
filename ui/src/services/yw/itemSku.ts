import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询sku信息列表（分页）
export async function listItemSkuPage(query: API.Yw.ItemSkuListParams) {
  return request<API.Yw.ItemSkuPageResult>('/api/wms/itemSku/list', {
    method: 'GET',
    params: query
  });
}

// 查询sku信息列表（无分页）
export async function listItemSku(query: API.Yw.ItemSkuListParams) {
  return request<API.Yw.ItemSkuResult>('/api/wms/itemSku/listNoPage', {
    method: 'GET',
    params: query
  });
}

// 导出SKU信息列表
export function exportItemSku(params?: API.Yw.ItemSkuListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/itemSku/export`, { params }, `itemSku_${new Date().getTime()}.xlsx`);
}

// 查询sku信息详细
export function getItemSku(id: string) {
  return request<API.Yw.ItemSkuResult>(`/api/wms/itemSku/${id}`, {
    method: 'GET'
  });
}

// 新增sku信息
export async function addItemSku(data: API.Yw.ItemSku) {
  return request<API.Result>('/api/wms/itemSku', {
    method: 'POST',
    data
  });
}

// 修改sku信息
export async function updateItemSku(data: API.Yw.ItemSku) {
  return request<API.Result>('/api/wms/itemSku', {
    method: 'PUT',
    data
  });
}

// 删除sku信息
export async function delItemSku(id: string) {
  return request<API.Result>(`/api/wms/itemSku/${id}`, {
    method: 'DELETE'
  });
}