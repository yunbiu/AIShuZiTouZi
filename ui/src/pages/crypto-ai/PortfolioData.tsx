import React from 'react';
import { Card, Row, Col, Table, Button, DatePicker, Space } from 'antd';
import { DownloadOutlined } from '@ant-design/icons';
import { Pie, Line } from '@ant-design/plots';

// 模拟资产占比数据
const assetRatioData = [
  { type: 'BTC', value: 41.5, amount: '12.35 BTC', valueNum: '$4,268,524' },
  { type: 'ETH', value: 33.2, amount: '245.82 ETH', valueNum: '$3,414,819' },
  { type: 'SOL', value: 14.8, amount: '3,842.5 SOL', valueNum: '$1,522,269' },
  { type: 'USDT', value: 10.5, amount: '1,080,000 USDT', valueNum: '$1,080,000' },
];

// 模拟近7日持仓变化数据
const trendData = [
  { date: '12/04', BTC: 40, ETH: 34, SOL: 15, USDT: 11 },
  { date: '12/05', BTC: 40.5, ETH: 33.8, SOL: 14.9, USDT: 10.8 },
  { date: '12/06', BTC: 41, ETH: 33.5, SOL: 14.8, USDT: 10.7 },
  { date: '12/07', BTC: 41.2, ETH: 33.3, SOL: 14.8, USDT: 10.7 },
  { date: '12/08', BTC: 41.3, ETH: 33.2, SOL: 14.8, USDT: 10.7 },
  { date: '12/09', BTC: 41.4, ETH: 33.2, SOL: 14.8, USDT: 10.6 },
  { date: '12/10', BTC: 41.5, ETH: 33.2, SOL: 14.8, USDT: 10.5 },
];

// 模拟持仓历史记录
const historyData = [
  {
    key: '1',
    date: '2024-12-09',
    type: 'AI建议调整',
    btc: '41.5%',
    eth: '33.2%',
    sol: '14.8%',
    usdt: '10.5%',
    reason: '市场利好消息影响',
    operator: '管理员A',
  },
  {
    key: '2',
    date: '2024-12-05',
    type: 'AI建议调整',
    btc: '40.0%',
    eth: '35.0%',
    sol: '15.0%',
    usdt: '10.0%',
    reason: '维持原有持仓结构',
    operator: '管理员B',
  },
  {
    key: '3',
    date: '2024-12-01',
    type: '初始配置',
    btc: '40.0%',
    eth: '35.0%',
    sol: '15.0%',
    usdt: '10.0%',
    reason: '系统初始化配置',
    operator: '系统管理员',
  },
];

const PortfolioData = () => {
  // 饼图配置
  const pieConfig = {
    data: assetRatioData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      formatter: (datum: any) => `${datum.type}: ${datum.value}%`,
    },
    legend: {
      position: 'right',
    },
  };

  // 折线图配置
  const lineConfig = {
    data: trendData,
    xField: 'date',
    yField: 'BTC', // 默认只显示BTC
    yAxis: {
      min: 0,
      max: 50,
      label: {
        formatter: (v: number) => `${v}%`,
      },
    },
    line: {
      size: 2,
      shape: 'smooth',
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        stroke: '#fff',
        strokeWidth: 2,
      },
    },
    color: '#1890ff',
    legend: {
      position: 'top',
    },
  };

  // 持仓历史表格列
  const historyColumns = [
    { title: '调整日期', dataIndex: 'date', key: 'date' },
    { title: '调整类型', dataIndex: 'type', key: 'type' },
    { title: 'BTC占比', dataIndex: 'btc', key: 'btc' },
    { title: 'ETH占比', dataIndex: 'eth', key: 'eth' },
    { title: 'SOL占比', dataIndex: 'sol', key: 'sol' },
    { title: 'USDT占比', dataIndex: 'usdt', key: 'usdt' },
    { title: '调整原因', dataIndex: 'reason', key: 'reason' },
    { title: '操作人', dataIndex: 'operator', key: 'operator' },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>持仓数据</h2>
          <p style={{ color: '#888' }}>总资产规模: <span style={{ color: '#1890ff' }}>$10,285,600</span> (基于实时汇率计算)</p>
        </div>
        <Space>
          <DatePicker.RangePicker placeholder={['开始日期', '结束日期']} />
          <Button type="primary" icon={<DownloadOutlined />}>导出Excel</Button>
        </Space>
      </div>

      {/* 资产占比 + 持仓趋势 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={12} md={24} sm={24}>
          <Card title="当前资产占比" bordered={false}>
            <Row gutter={[16, 16]}>
              <Col lg={12} sm={24}>
                <div style={{ height: 280 }}>
                  <Pie {...pieConfig} />
                </div>
              </Col>
              <Col lg={12} sm={24}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 20 }}>
                  {assetRatioData.map((item) => (
                    <div key={item.type} style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>{item.type}</span>
                      <div style={{ textAlign: 'right' }}>
                        <p>{item.value}%</p>
                        <p style={{ fontSize: 12, color: '#888' }}>价值: {item.valueNum} | 数量: {item.amount}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col lg={12} md={24} sm={24}>
          <Card title="近7日持仓变化" bordered={false}>
            <div style={{ height: 320 }}>
              <Line {...lineConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 持仓历史记录 */}
      <Card title="持仓历史记录" extra={<span>数据更新时间: 2024-12-10 08:00</span>} bordered={false}>
        <Table
          dataSource={historyData}
          columns={historyColumns}
          rowKey="key"
          size="middle"
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default PortfolioData;