import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询物料列表
export async function listItemPage(query?: API.Yw.ItemListParams) {
  return request<API.Yw.ItemPageResult>('/api/wms/item/list', {
    method: 'GET',
    params: query
  });
}

// 查询物料列表（无分页）
export async function listItem(query?: API.Yw.ItemListParams) {
  return request<API.Yw.ItemResult>('/api/wms/item/listNoPage', {
    method: 'GET',
    params: query
  });
}

// 查询物料列表 以sku为维度
export async function listItemGroupBySku(query?: API.Yw.ItemListParams) {
  return request<API.Yw.ItemPageResult>('/api/wms/itemSku/selectList', {
    method: 'GET',
    params: query
  });
}

// 导出物料列表
export function exportItem(params?: API.Yw.ItemListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/item/export`, { params }, `item_${new Date().getTime()}.xlsx`);
}

// 查询物料详细
export function getItem(id: string) {
  return request<API.Yw.ItemResult>(`/api/wms/item/${id}`, {
    method: 'GET'
  });
}

// 新增物料
export async function addItem(data: API.Yw.Item) {
  return request<API.Result>('/api/wms/item', {
    method: 'POST',
    data: data
  });
}

// 修改物料
export async function updateItem(data: API.Yw.Item) {
  return request<API.Result>('/api/wms/item', {
    method: 'PUT',
    data: data
  });
}

// 删除物料
export async function delItem(id: string) {
  return request<API.Result>(`/api/wms/item/${id}`, {
    method: 'DELETE'
  });
}