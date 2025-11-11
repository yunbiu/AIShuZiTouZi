import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询商品品牌列表
export async function listItemBrandPage(params?: API.Yw.ItemBrandListParams) {
  return request<API.Yw.ItemBrandPageResult>('/api/wms/itemBrand/list', {
    method: 'GET',
    params
  });
}

// 查询商品品牌列表（无分页）
export async function listItemBrand(params?: API.Yw.ItemBrandListParams) {
  return request<API.Yw.ItemBrandResult>('/api/wms/itemBrand/listNoPage', {
    method: 'GET',
    params
  });
}

// 导出商品品牌列表
export function exportItemBrand(params?: API.Yw.ItemBrandListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/itemBrand/export`, { params }, `itemBrand_${new Date().getTime()}.xlsx`);
}

// 查询商品品牌详细
export function getItemBrand(id: string) {
  return request<API.Yw.ItemBrandResult>(`/api/yw/itemBrand/${id}`, {
    method: 'GET'
  });
}

// 新增商品品牌
export async function addItemBrand(data: API.Yw.ItemBrand) {
  return request<API.Result>('/api/wms/itemBrand', {
    method: 'POST',
    data
  });
}

// 修改商品品牌
export async function updateItemBrand(data: API.Yw.ItemBrand) {
  return request<API.Result>('/api/wms/itemBrand', {
    method: 'PUT',
    data
  });
}

// 删除商品品牌
export async function delItemBrand(ids: string) {
  return request<API.Result>(`/api/wms/itemBrand/${ids}`, {
    method: 'DELETE'
  });
}