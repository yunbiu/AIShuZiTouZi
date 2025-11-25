import React, { useState } from 'react';
import { Card, Table, Tag, Button, Space, Select, DatePicker, Divider, Typography, Descriptions } from 'antd';
import { DownloadOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { Dayjs } from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;

// 模拟报告数据
const reportData = [
  {
    id: 'R2024121001',
    createTime: '2024-12-10 09:30',
    cryptoTypes: 'BTC, ETH',
    reportType: '持仓调整',
    confidenceLevel: 92,
    status: 'pending',
    expectedROI: 8.5,
    analyst: 'AI-System-A',
  },
  {
    id: 'R2024120902',
    createTime: '2024-12-09 14:15',
    cryptoTypes: 'SOL',
    reportType: '持仓维持',
    confidenceLevel: 86,
    status: 'approved',
    expectedROI: 4.2,
    analyst: 'AI-System-B',
    approvedBy: 'Zhang Wei',
    approvedTime: '2024-12-09 16:20',
  },
  {
    id: 'R2024120801',
    createTime: '2024-12-08 10:45',
    cryptoTypes: 'ETH, USDT',
    reportType: '资产配置优化',
    confidenceLevel: 78,
    status: 'rejected',
    expectedROI: 6.3,
    analyst: 'AI-System-C',
    rejectedBy: 'Li Ming',
    rejectedTime: '2024-12-08 11:30',
    rejectionReason: '市场时机不成熟，建议暂缓调整',
  },
  {
    id: 'R2024120703',
    createTime: '2024-12-07 16:20',
    cryptoTypes: 'BTC',
    reportType: '减持建议',
    confidenceLevel: 89,
    status: 'approved',
    expectedROI: -2.5,
    analyst: 'AI-System-A',
    approvedBy: 'Wang Hong',
    approvedTime: '2024-12-07 17:45',
  },
  {
    id: 'R2024120601',
    createTime: '2024-12-06 11:40',
    cryptoTypes: 'ETH',
    reportType: '增持建议',
    confidenceLevel: 84,
    status: 'approved',
    expectedROI: 9.7,
    analyst: 'AI-System-B',
    approvedBy: 'Zhang Wei',
    approvedTime: '2024-12-06 13:10',
  },
];

const statusConfig = {
  pending: { color: 'orange', text: '待审核' },
  approved: { color: 'green', text: '已通过' },
  rejected: { color: 'red', text: '已驳回' },
};

const reportTypeOptions = ['持仓调整', '持仓维持', '资产配置优化', '减持建议', '增持建议', '全部类型'];
const statusOptions = ['待审核', '已通过', '已驳回', '全部状态'];

const SuggestionReport: React.FC = () => {
  const [selectedReportType, setSelectedReportType] = useState('全部类型');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState('70');

  const handleRefresh = () => {
    // 刷新报告列表
    console.log('刷新报告列表');
  };

  const handleViewDetail = (id: string) => {
    setExpandedReport(expandedReport === id ? null : id);
  };

  const handleApprove = (id: string) => {
    // 审核通过逻辑
    console.log(`审核通过报告 ${id}`);
  };

  const handleReject = (id: string) => {
    // 审核驳回逻辑
    console.log(`审核驳回报告 ${id}`);
  };

  const handleDownload = (id: string) => {
    // 下载报告逻辑
    console.log(`下载报告 ${id}`);
  };

  // 模拟获取报告详情数据
  const getReportDetail = (id: string) => {
    const report = reportData.find(r => r.id === id);
    return {
      ...report,
      summary: '基于市场数据分析和技术指标评估，当前BTC和ETH价格处于上升通道，但存在短期回调风险。建议保持BTC持仓比例，适度增加ETH配置比例以优化组合风险收益比。',
      marketAnalysis: '比特币近期受美联储政策影响呈现震荡上行趋势，以太坊受益于DeFi生态发展持续走强。整体市场情绪偏乐观，但交易量有所萎缩，需警惕短期回调风险。',
      technicalIndicators: [
        { name: 'RSI', value: 68, analysis: '处于中性偏强区间' },
        { name: 'MACD', value: '金叉', analysis: '短期动能向上' },
        { name: '移动平均线', value: '多头排列', analysis: '中期趋势向好' },
      ],
      recommendedActions: [
        '保持BTC当前持仓不变',
        '将ETH配置比例从25%提高到30%',
        '设置10%止损位保护收益',
        '建议在回调5%时加仓ETH',
      ],
    };
  };

  const columns = [
    {
      title: '报告ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => `#${id}`,
    },
    {
      title: '生成时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '涉及币种',
      dataIndex: 'cryptoTypes',
      key: 'cryptoTypes',
    },
    {
      title: '建议类型',
      dataIndex: 'reportType',
      key: 'reportType',
    },
    {
      title: '置信度',
      dataIndex: 'confidenceLevel',
      key: 'confidenceLevel',
      render: (level: number) => (
        <Tag color={level >= 90 ? 'green' : level >= 75 ? 'blue' : 'orange'}>
          {level}%
        </Tag>
      ),
    },
    {
      title: '预期收益',
      dataIndex: 'expectedROI',
      key: 'expectedROI',
      render: (roi: number) => (
        <span style={{ color: roi >= 0 ? 'green' : 'red' }}>
          {roi >= 0 ? '+' : ''}{roi}%
        </span>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={statusConfig[status as keyof typeof statusConfig].color}>
          {statusConfig[status as keyof typeof statusConfig].text}
        </Tag>
      ),
    },
    {
      title: '分析师',
      dataIndex: 'analyst',
      key: 'analyst',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button>
          <Button 
            type="link" 
            icon={<DownloadOutlined />} 
            onClick={() => handleDownload(record.id)}
          >
            下载
          </Button>
          {record.status === 'pending' && (
            <>
              <Button 
                type="link" 
                icon={<CheckCircleOutlined />} 
                onClick={() => handleApprove(record.id)}
                style={{ color: 'green' }}
              >
                通过
              </Button>
              <Button 
                type="link" 
                icon={<CloseCircleOutlined />} 
                onClick={() => handleReject(record.id)}
                style={{ color: 'red' }}
              >
                驳回
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="建议报告">
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <Select 
              style={{ width: 150 }} 
              value={selectedReportType}
              onChange={setSelectedReportType}
            >
              {reportTypeOptions.map((type) => (
                <Option key={type} value={type}>{type}</Option>
              ))}
            </Select>
            
            <Select 
              style={{ width: 120 }} 
              value={selectedStatus}
              onChange={setSelectedStatus}
            >
              {statusOptions.map((status) => (
                <Option key={status} value={status}>{status}</Option>
              ))}
            </Select>
            
            <Select 
              style={{ width: 120 }} 
              value={confidenceThreshold}
              onChange={setConfidenceThreshold}
            >
              <Option value="70">置信度 ≥70%</Option>
              <Option value="80">置信度 ≥80%</Option>
              <Option value="90">置信度 ≥90%</Option>
            </Select>
          </div>
          
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <RangePicker onChange={(dates) => setDateRange(dates)} />
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </div>
        </div>
        
        <Table 
          columns={columns} 
          dataSource={reportData} 
          pagination={{ pageSize: 10 }}
          rowKey="id"
          expandable={{
            expandedRowRender: (record) => {
              const detail = getReportDetail(record.id);
              return (
                <Card title="报告详情" size="small">
                  <Descriptions column={2} size="small">
                    <Descriptions.Item label="报告ID">#{detail.id}</Descriptions.Item>
                    <Descriptions.Item label="生成时间">{detail.createTime}</Descriptions.Item>
                    <Descriptions.Item label="涉及币种">{detail.cryptoTypes}</Descriptions.Item>
                    <Descriptions.Item label="建议类型">{detail.reportType}</Descriptions.Item>
                    <Descriptions.Item label="置信度">
                      <Tag color={detail.confidenceLevel >= 90 ? 'green' : detail.confidenceLevel >= 75 ? 'blue' : 'orange'}>
                        {detail.confidenceLevel}%
                      </Tag>
                    </Descriptions.Item>
                    <Descriptions.Item label="预期收益">
                      <span style={{ color: detail.expectedROI >= 0 ? 'green' : 'red' }}>
                        {detail.expectedROI >= 0 ? '+' : ''}{detail.expectedROI}%
                      </span>
                    </Descriptions.Item>
                    <Descriptions.Item label="分析师">{detail.analyst}</Descriptions.Item>
                    {detail.approvedBy && (
                      <Descriptions.Item label="审核人">{detail.approvedBy}</Descriptions.Item>
                    )}
                    {detail.approvedTime && (
                      <Descriptions.Item label="审核时间">{detail.approvedTime}</Descriptions.Item>
                    )}
                    {detail.rejectionReason && (
                      <Descriptions.Item label="驳回原因" span={2}>{detail.rejectionReason}</Descriptions.Item>
                    )}
                  </Descriptions>
                  
                  <Divider orientation="left">摘要</Divider>
                  <Paragraph>{detail.summary}</Paragraph>
                  
                  <Divider orientation="left">市场分析</Divider>
                  <Paragraph>{detail.marketAnalysis}</Paragraph>
                  
                  <Divider orientation="left">技术指标</Divider>
                  <Table 
                    dataSource={detail.technicalIndicators} 
                    pagination={false}
                    columns={[
                      { title: '指标', dataIndex: 'name' },
                      { title: '数值', dataIndex: 'value' },
                      { title: '分析', dataIndex: 'analysis' },
                    ]}
                    size="small"
                  />
                  
                  <Divider orientation="left">建议操作</Divider>
                  <ul>
                    {detail.recommendedActions.map((action, index) => (
                      <li key={index} style={{ marginBottom: 8 }}>{action}</li>
                    ))}
                  </ul>
                </Card>
              );
            },
            rowExpandable: (record) => record.id === expandedReport,
          }}
        />
      </Card>
    </PageContainer>
  );
};

export default SuggestionReport;