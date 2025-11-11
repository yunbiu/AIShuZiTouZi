import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询往来单位列表
export async function listMerchant(params?: API.Yw.MerchantListParams) {
  return request<API.Yw.MerchantPageResult>('/api/wms/merchant/list', {
    method: 'GET',
    params
  });
}

// 查询往来单位列表（无分页）
export async function listMerchantNoPage(params?: API.Yw.MerchantListParams) {
  return request<API.Yw.MerchantResult>('/api/wms/merchant/listNoPage', {
    method: 'GET',
    params
  });
}

// 导出往来单位列表
export function exportMerchant(params?: API.Yw.MerchantListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/merchant/export`, { params }, `merchant_${new Date().getTime()}.xlsx`);
}

// 获取往来单位详细信息
export function getMerchant(id: string) {
  return request<API.Yw.MerchantResult>(`/api/wms/merchant/${id}`, {
    method: 'GET'
  });
}

// 新增往来单位
export async function addMerchant(params: API.Yw.Merchant) {
  return request<API.Result>('/api/wms/merchant', {
    method: 'POST',
    data: params
  });
}

// 修改往来单位
export async function updateMerchant(params: API.Yw.Merchant) {
  return request<API.Result>('/api/wms/merchant', {
    method: 'PUT',
    data: params
  });
}

// 删除往来单位
export async function delMerchant(id: string) {
  return request<API.Result>(`/api/wms/merchant/${id}`, {
    method: 'DELETE'
  });
}