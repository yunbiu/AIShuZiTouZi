import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询物料类型列表（分页）
export async function listItemCategoryPage(query?: API.Yw.ItemCategoryListParams) {
  return request<API.Yw.ItemCategoryPageResult>('/api/wms/itemCategory/list', {
    method: 'GET',
    params: query
  });
}

// 查询物料类型列表（无分页）
export async function listItemCategory(query?: API.Yw.ItemCategoryListParams) {
  return request<API.Yw.ItemCategoryResult>('/api/wms/itemCategory/listNoPage', {
    method: 'GET',
    params: query
  });
}

// 获取物料类型下拉树列表
export async function treeSelectItemCategory(query?: API.Yw.ItemCategoryListParams) {
  return request<any>('/api/wms/itemCategory/treeselect', {
    method: 'GET',
    params: query
  });
}

// 导出物料类型列表
export function exportItemCategory(params?: API.Yw.ItemCategoryListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/itemCategory/export`, { params }, `itemCategory_${new Date().getTime()}.xlsx`);
}

// 获取物料类型详细信息
export function getItemCategory(id: string) {
  return request<API.Yw.ItemCategoryResult>(`/api/wms/itemCategory/${id}`, {
    method: 'GET'
  });
}

// 新增物料类型
export async function addItemCategory(data: API.Yw.ItemCategory) {
  return request<API.Result>('/api/wms/itemCategory', {
    method: 'POST',
    data
  });
}

// 修改物料类型
export async function updateItemCategory(data: API.Yw.ItemCategory) {
  return request<API.Result>('/api/wms/itemCategory', {
    method: 'PUT',
    data
  });
}

// 删除物料类型
export async function delItemCategory(id: string) {
  return request<API.Result>(`/api/wms/itemCategory/${id}`, {
    method: 'DELETE'
  });
}

// 更新物料类型排序号
export async function updateOrderNum(tree: any[]) {
  return request<API.Result>('/api/wms/itemCategory/update/orderNum', {
    method: 'POST',
    data: tree
  });
}