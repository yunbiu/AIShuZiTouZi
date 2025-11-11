import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询仓库列表（分页）
export async function listWarehouse(params?: API.Yw.WarehouseListParams) {
  return request<API.Yw.WarehousePageResult>('/api/wms/warehouse/list', {
    method: 'GET',
    params
  });
}

// 查询仓库列表（无分页）
export async function listWarehouseNoPage(params?: API.Yw.WarehouseListParams) {
  return request<API.Yw.WarehouseResult>('/api/wms/warehouse/listNoPage', {
    method: 'GET',
    params
  });
}

// 导出仓库列表
export function exportWarehouse(params?: API.Yw.WarehouseListParams) {
  return downLoadXlsx(`/api/wms/warehouse/export`, { params }, `warehouse_${new Date().getTime()}.xlsx`);
}

// 查询仓库详细
export function getWarehouse(id: string) {
  return request<API.Yw.WarehouseResult>(`/api/wms/warehouse/${id}`, {
    method: 'GET'
  });
}

// 新增仓库
export async function addWarehouse(params: API.Yw.Warehouse) {
  return request<API.Result>('/api/wms/warehouse', {
    method: 'POST',
    data: params
  });
}

// 修改仓库
export async function updateWarehouse(params: API.Yw.Warehouse) {
  return request<API.Result>('/api/wms/warehouse', {
    method: 'PUT',
    data: params
  });
}

// 删除仓库
export async function delWarehouse(id: string) {
  return request<API.Result>(`/api/wms/warehouse/${id}`, {
    method: 'DELETE'
  });
}

// 更新仓库排序号
export async function updateOrderNum(tree: any) {
  return request<API.Result>('/api/wms/warehouse/update/orderNum', {
    method: 'POST',
    data: tree
  });
}