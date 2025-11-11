import { request } from '@umijs/max';
import { downLoadXlsx } from '@/utils/downloadfile';

export async function getNoticeList(params?: API.System.NoticeListParams) {
  console.log("请求参数（修改后）：", params);  // 打印请求参数，便于调试

  // 兼容 page / limit 参数为 pageNum / pageSize
  const transformedParams = {
    ...params,
    pageNum: params?.page || 1,      // 将 page 转换为 pageNum
    pageSize: params?.limit || 10,   // 将 limit 转换为 pageSize
  };

  delete transformedParams.page;     // 删除原始的 page 参数，避免混淆
  delete transformedParams.limit;    // 删除原始的 limit 参数，避免混淆

  return request('/api/system/notice/list', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    params: transformedParams, 
  });
}


// export async function getDictTypeList(params?: API.DictTypeListParams) {
//   return request(`/api/system/dict/type/list`, {
//     method: 'GET',
//     headers: {
//       'Content-Type': 'application/json;charset=UTF-8',
//     },
//     params: params,
//   });
// }





// 查询通知公告详细
export function getNotice(noticeId: number) {
  return request<API.System.NoticeInfoResult>(`/api/system/notice/${noticeId}`, {
    method: 'GET'
  });
}

// 新增通知公告
export async function addNotice(params: API.System.Notice) {
  return request<API.Result>('/api/system/notice', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: params
  });
}

// 修改通知公告
export async function updateNotice(params: API.System.Notice) {
  return request<API.Result>('/api/system/notice', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    data: params
  });
}

// 删除通知公告
export async function removeNotice(ids: string) {
  return request<API.Result>(`/api/system/notice/${ids}`, {
    method: 'DELETE'
  });
}
