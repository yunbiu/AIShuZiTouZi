import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询入库单列表
export async function listReceiptOrder(params?: API.Yw.ReceiptOrderListParams) {
  return request<API.Yw.ReceiptOrderPageResult>('/api/wms/receiptOrder/list', {
    method: 'GET',
    params
  });
}

// 导出入库单列表
export function exportReceiptOrder(params?: API.Yw.ReceiptOrderListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/receiptOrder/export`, { params }, `receiptOrder_${new Date().getTime()}.xlsx`);
}

// 查询入库单详细
export function getReceiptOrder(id: string) {
  return request<API.Yw.ReceiptOrderResult>(`/api/wms/receiptOrder/${id}`, {
    method: 'GET'
  });
}

// 新增入库单
export async function addReceiptOrder(params: API.Yw.ReceiptOrder) {
  return request<API.Result>('/api/wms/receiptOrder', {
    method: 'POST',
    data: params
  });
}

// 执行入库
export async function warehousing(params: API.Yw.ReceiptOrder) {
  return request<API.Result>('/api/wms/receiptOrder/warehousing', {
    method: 'POST',
    data: params
  });
}

// 修改入库单
export async function updateReceiptOrder(params: API.Yw.ReceiptOrder) {
  return request<API.Result>('/api/wms/receiptOrder', {
    method: 'PUT',
    data: params
  });
}

// 删除入库单
export async function delReceiptOrder(id: string) {
  return request<API.Result>(`/api/wms/receiptOrder/${id}`, {
    method: 'DELETE'
  });
}

// 生成入库单号
export async function generateReceiptOrderNo() {
  return request<API.Result>('/api/wms/receiptOrder/generate/no', {
    method: 'GET'
  });
}