import { request } from '@umijs/max';

// 定义报告列表项接口
export interface ReportItem {
  id: string;
  createTime: string;
  cryptoTypes: string;
  reportType: string;
  confidenceLevel: number;
  status: 'pending' | 'approved' | 'rejected';
  expectedROI: number;
  analyst: string;
  approvedBy?: string;
  approvedTime?: string;
  rejectedBy?: string;
  rejectedTime?: string;
  rejectionReason?: string;
}

// 定义报告详情接口
export interface ReportDetail extends ReportItem {
  summary: string;
  marketAnalysis: string;
  technicalIndicators: Array<{
    name: string;
    value: string | number;
    analysis: string;
  }>;
  recommendedActions: string[];
}

// 定义报告列表响应接口
export interface ReportListResponse {
  code: number;
  msg: string;
  data: {
    records: ReportItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };
}

// 定义报告详情响应接口
export interface ReportDetailResponse {
  code: number;
  msg: string;
  data: ReportDetail;
}

// 获取报告列表
// GET http://localhost:8080/crypto/report/list
export async function getReportList(params?: {
  current?: number;
  size?: number;
  reportType?: string;
  status?: string;
}) {
  return request<ReportListResponse>('http://localhost:8080/crypto/report/list', {
    method: 'GET',
    params,
  });
}

// 获取报告详情
// 假设接口为 GET http://localhost:8080/crypto/report/detail/{id}
export async function getReportDetail(id: string) {
  return request<ReportDetailResponse>(`http://localhost:8080/crypto/report/detail/${id}`, {
    method: 'GET',
  });
}

// 审核通过报告
// POST http://localhost:8080/crypto/report/review/{reportId}/approve
export async function approveReport(id: string) {
  return request<{ code: number; msg: string }>(`http://localhost:8080/crypto/report/review/${id}/approve`, {
    method: 'POST',
  });
}

// 审核驳回报告
// POST http://localhost:8080/crypto/report/review/{reportId}/reject
export async function rejectReport(id: string) {
  return request<{ code: number; msg: string }>(`http://localhost:8080/crypto/report/review/${id}/reject`, {
    method: 'POST',
  });
}

// 生成报告
// 假设接口为 POST http://localhost:8080/crypto/report/generate
export async function generateReport(params: {
  cryptoTypes: string;
  reportType: string;
  confidenceLevel: number;
}) {
  return request<{ code: number; msg: string; data: { id: string } }>('http://localhost:8080/crypto/report/generate', {
    method: 'POST',
    data: params,
  });
}