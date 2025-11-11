import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询入库单详情列表
export async function listReceiptOrderDetail(params?: API.Yw.ReceiptOrderDetailListParams) {
  return request<API.Yw.ReceiptOrderDetailPageResult>('/api/wms/receiptOrderDetail/list', {
    method: 'GET',
    params
  });
}

// 导出入库单详情列表
export function exportReceiptOrderDetail(params?: API.Yw.ReceiptOrderDetailListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/receiptOrderDetail/export`, { params }, `receiptOrderDetail_${new Date().getTime()}.xlsx`);
}

// 查询入库单详情详细
export function getReceiptOrderDetail(id: string) {
  return request<API.Yw.ReceiptOrderDetailResult>(`/api/wms/receiptOrderDetail/${id}`, {
    method: 'GET'
  });
}

// 新增入库单详情
export async function addReceiptOrderDetail(params: API.Yw.ReceiptOrderDetail) {
  return request<API.Result>('/api/wms/receiptOrderDetail', {
    method: 'POST',
    data: params
  });
}

// 修改入库单详情
export async function updateReceiptOrderDetail(params: API.Yw.ReceiptOrderDetail) {
  return request<API.Result>('/api/wms/receiptOrderDetail', {
    method: 'PUT',
    data: params
  });
}

// 删除入库单详情
export async function delReceiptOrderDetail(ids: string) {
  return request<API.Result>(`/api/wms/receiptOrderDetail/${ids}`, {
    method: 'DELETE'
  });
}

// 根据入库单id查询入库单详情列表
export async function listByReceiptOrderId(receiptOrderId: string) {
  return request<any>(`/api/wms/receiptOrderDetail/list/${receiptOrderId}`, {
    method: 'GET'
  });
}