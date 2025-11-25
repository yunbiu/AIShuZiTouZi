import React from 'react';
import { Card, Table, Select, Input, Button, Row, Col, Space, Tag } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';

// 模拟消息数据
const messageData = [
  {
    key: '1',
    index: 1,
    title: '美联储加息预期降温，比特币市场情绪回暖',
    coin: 'BTC',
    sentiment: '利好',
    source: 'CoinGecko',
    time: '2024-12-10 07:30',
  },
  {
    key: '2',
    index: 2,
    title: '以太坊2.0升级计划推迟，开发者社区引发讨论',
    coin: 'ETH',
    sentiment: '利空',
    source: 'Binance公告',
    time: '2024-12-10 06:15',
  },
  {
    key: '3',
    index: 3,
    title: 'Solana生态新增3个DeFi项目，链上活跃度提升',
    coin: 'SOL',
    sentiment: '利好',
    source: 'CoinDesk',
    time: '2024-12-09 18:45',
  },
  {
    key: '4',
    index: 4,
    title: 'USDT储备金审计报告发布，合规性符合标准',
    coin: 'USDT',
    sentiment: '中性',
    source: 'Tether官方',
    time: '2024-12-09 14:30',
  },
  {
    key: '5',
    index: 5,
    title: '比特币网络哈希率创历史新高，安全性提升',
    coin: 'BTC',
    sentiment: '利好',
    source: 'Blockchain.com',
    time: '2024-12-08 22:10',
  },
];

// 情感倾向标签映射
const sentimentTag = (sentiment: string) => {
  switch (sentiment) {
    case '利好':
      return <Tag color="green">利好</Tag>;
    case '利空':
      return <Tag color="red">利空</Tag>;
    case '中性':
      return <Tag color="gray">中性</Tag>;
    default:
      return <Tag>{sentiment}</Tag>;
  }
};

const MessageList = () => {
  // 表格列配置
  const columns = [
    { title: '#', dataIndex: 'index', key: 'index' },
    { title: '消息标题', dataIndex: 'title', key: 'title' },
    { title: '涉及币种', dataIndex: 'coin', key: 'coin' },
    { title: '情感倾向', dataIndex: 'sentiment', key: 'sentiment', render: sentimentTag },
    { title: '消息来源', dataIndex: 'source', key: 'source' },
    { title: '发布时间', dataIndex: 'time', key: 'time' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Button type="link" size="small">查看详情</Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <h2>消息列表</h2>
          <p style={{ color: '#888' }}>已采集到 128 条市场消息，按时间倒序排列</p>
        </div>

        {/* 筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col lg={4} md={8} sm={24}>
            <Select
              defaultValue="所有币种"
              options={[
                { value: 'all', label: '所有币种' },
                { value: 'BTC', label: 'BTC' },
                { value: 'ETH', label: 'ETH' },
                { value: 'SOL', label: 'SOL' },
                { value: 'USDT', label: 'USDT' },
              ]}
              style={{ width: '100%' }}
            />
          </Col>
          <Col lg={4} md={8} sm={24}>
            <Select
              defaultValue="所有情感倾向"
              options={[
                { value: 'all', label: '所有情感倾向' },
                { value: '利好', label: '利好' },
                { value: '利空', label: '利空' },
                { value: '中性', label: '中性' },
              ]}
              style={{ width: '100%' }}
            />
          </Col>
          <Col lg={12} md={16} sm={24}>
            <Input.Search
              placeholder="搜索消息关键词..."
              prefix={<SearchOutlined />}
              style={{ width: '100%' }}
            />
          </Col>
          <Col lg={4} md={8} sm={24}>
            <Button type="primary" icon={<ReloadOutlined />} block>刷新</Button>
          </Col>
        </Row>

        {/* 消息表格 */}
        <Table
          dataSource={messageData}
          columns={columns}
          rowKey="key"
          size="middle"
          pagination={{
            current: 1,
            pageSize: 5,
            total: 128,
            showSizeChanger: false,
            showQuickJumper: true,
            pageSizeOptions: ['5'],
            itemRender: (_, type, originalElement) => {
              if (type === 'prev' || type === 'next') {
                return <a>{originalElement}</a>;
              }
              return originalElement;
            },
          }}
        />
      </Card>
    </div>
  );
};

export default MessageList;