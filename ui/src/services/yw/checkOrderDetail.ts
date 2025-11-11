import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询库存盘点单据详情列表
export async function listCheckOrderDetail(query?: API.Yw.CheckOrderDetailListParams) {
  return request<API.Yw.CheckOrderDetailPageResult>('/api/wms/checkOrderDetail/list', {
    method: 'GET',
    params: query
  });
}

// 导出库存盘点单据详情列表
export function exportCheckOrderDetail(params?: API.Yw.CheckOrderDetailListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/checkOrderDetail/export`, { params }, `checkOrderDetail_${new Date().getTime()}.xlsx`);
}

// 查询库存盘点单据详情详细
export function getCheckOrderDetail(id: string) {
  return request<API.Yw.CheckOrderDetailResult>(`/api/wms/checkOrderDetail/${id}`, {
    method: 'GET'
  });
}

// 新增库存盘点单据详情
export async function addCheckOrderDetail(data: API.Yw.CheckOrderDetail) {
  return request<API.Result>('/api/wms/checkOrderDetail', {
    method: 'POST',
    data
  });
}

// 修改库存盘点单据详情
export async function updateCheckOrderDetail(data: API.Yw.CheckOrderDetail) {
  return request<API.Result>('/api/wms/checkOrderDetail', {
    method: 'PUT',
    data
  });
}

// 删除库存盘点单据详情
export async function delCheckOrderDetail(id: string) {
  return request<API.Result>(`/api/wms/checkOrderDetail/${id}`, {
    method: 'DELETE'
  });
}

// 根据盘库单id查询盘库单详情列表
export async function listByCheckOrderId(checkOrderId: string) {
  return request<API.Yw.CheckOrderDetailPageResult>(`/api/wms/checkOrderDetail/list/${checkOrderId}`, {
    method: 'GET'
  });
}