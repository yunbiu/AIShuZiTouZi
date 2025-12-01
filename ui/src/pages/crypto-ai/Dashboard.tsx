import React from 'react';
import { history } from 'umi';
import { Card, Statistic, Row, Col, Button, Table, Space, Tag } from 'antd';
import { BellOutlined, FileTextOutlined, PieChartOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

// 模拟资产分布数据
const assetData = [
  { type: 'BTC', value: 41.5 },
  { type: 'ETH', value: 33.2 },
  { type: 'SOL', value: 14.8 },
  { type: 'USDT', value: 10.5 },
];

// 模拟近期建议报告数据
const reportData = [
  {
    key: '1',
    reportId: '#R2024121001',
    createTime: '2024-12-10 09:30',
    coins: 'BTC, ETH',
    type: '持仓调整',
    status: '待审核',
  },
  {
    key: '2',
    reportId: '#R2024120902',
    createTime: '2024-12-09 14:15',
    coins: 'SOL',
    type: '持仓维持',
    status: '已通过',
  },
  {
    key: '3',
    reportId: '#R2024120801',
    createTime: '2024-12-08 10:45',
    coins: 'ETH, USDT',
    type: '资产配置优化',
    status: '已驳回',
  },
];

// 状态标签映射
const statusTag = (status: string) => {
  switch (status) {
    case '待审核':
      return <Tag color="yellow">待审核</Tag>;
    case '已通过':
      return <Tag color="green">已通过</Tag>;
    case '已驳回':
      return <Tag color="red">已驳回</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const Dashboard = () => {
  // 饼图配置
  const pieConfig = {
    data: assetData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'inner',
      offset: '-30%',
      // 使用内置的百分比格式化
      content: '{percentage}',
      style: {
        fontSize: 14,
        textAlign: 'center',
      },
    },
    legend: {
      position: 'bottom',
    },
  };

  // 报告表格列配置
  const reportColumns = [
    { title: '报告ID', dataIndex: 'reportId', key: 'reportId' },
    { title: '生成时间', dataIndex: 'createTime', key: 'createTime' },
    { title: '涉及币种', dataIndex: 'coins', key: 'coins' },
    { title: '建议类型', dataIndex: 'type', key: 'type' },
    { title: '状态', dataIndex: 'status', key: 'status', render: statusTag },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" icon={<EyeOutlined />} size="small">查看</Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={8} md={12} sm={24}>
          <Card bordered={false}>
            <Statistic
              title="未读消息"
              value={12}
              prefix={<BellOutlined style={{ color: '#1890ff' }} />}
              extra={<span style={{ color: 'green' }}>3个新增 · 今日更新</span>}
            />
          </Card>
        </Col>
        <Col lg={8} md={12} sm={24}>
          <Card bordered={false}>
            <Statistic
              title="待审核报告数"
              value={4}
              prefix={<FileTextOutlined style={{ color: '#fa8c16' }} />}
              extra={<span>截止日期: 2024-12-15</span>}
            />
          </Card>
        </Col>
        <Col lg={8} md={24} sm={24}>
          <Card bordered={false}>
            <Statistic
              title="当前总资产价值"
              value="$10,285,600"
              prefix={<PieChartOutlined style={{ color: '#52c41a' }} />}
              extra={<span style={{ color: 'green' }}>↑2.86% 较昨日涨幅</span>}
            />
          </Card>
        </Col>
      </Row>

      {/* 快速入口 + 资产分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={6} md={12} sm={24}>
          <Card title="快速入口" bordered={false}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button
                type="default"
                icon={<BellOutlined />}
                block
                onClick={() => history.push('/crypto-ai/message-list')}
              >查看消息列表</Button>
              <Button type="default" icon={<PieChartOutlined />} block onClick={() => history.push('/crypto-ai/portfolio-data')}>查看持仓数据</Button>
              <Button type="default" icon={<FileTextOutlined />} block onClick={() => history.push('/crypto-ai/suggestion-report')}>审核建议报告</Button>
              <Button type="default" icon={<DownloadOutlined />} block>导出数据报表</Button>
            </Space>
          </Card>
        </Col>
        <Col lg={18} md={12} sm={24}>
          <Card title="资产分布概览" extra={<span>数据更新时间: 2024-12-10 08:00</span>} bordered={false}>
            <div style={{ height: 300 }}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 近期建议报告 */}
      <Card title="近期建议报告" extra={<Button type="link">查看全部</Button>} bordered={false}>
        <Table
          dataSource={reportData}
          columns={reportColumns}
          pagination={false}
          rowKey="key"
          size="middle"
        />
      </Card>
    </div>
  );
};

export default Dashboard;