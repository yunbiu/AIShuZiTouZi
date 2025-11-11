import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

// 查询库区列表
export async function listArea(query?: API.Yw.AreaListParams) {
  return request<API.Yw.AreaPageResult>('/api/wms/area/list', {
    method: 'GET',
    params: query
  });
}

// 查询库区列表（无分页）
export async function listAreaNoPage(query?: API.Yw.AreaListParams) {
  return request<API.Yw.AreaResult>('/api/wms/area/listNoPage', {
    method: 'GET',
    params: query
  });
}

// 导出库区列表
export function exportArea(params?: API.Yw.AreaListParams, options?: { [key: string]: any }) {
  return downLoadXlsx(`/api/wms/area/export`, { params }, `area_${new Date().getTime()}.xlsx`);
}

// 查询库区详细
export function getArea(id: string) {
  return request<API.Yw.AreaResult>(`/api/wms/area/${id}`, {
    method: 'GET'
  });
}

// 新增库区
export async function addArea(data: API.Yw.Area) {
  return request<API.Result>('/api/wms/area', {
    method: 'POST',
    data
  });
}

// 修改库区
export async function updateArea(data: API.Yw.Area) {
  return request<API.Result>('/api/wms/area', {
    method: 'PUT',
    data
  });
}

// 删除库区
export async function delArea(id: string) {
  return request<API.Result>(`/api/wms/area/${id}`, {
    method: 'DELETE'
  });
}