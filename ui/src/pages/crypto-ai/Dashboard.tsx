import React from 'react';
import { history } from 'umi';
import { Card, Statistic, Row, Col, Button, Table, Space, Tag } from 'antd';
import { 
  BellOutlined, FileTextOutlined, DollarOutlined, 
  PieChartOutlined, DownloadOutlined, EyeOutlined 
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

// 模拟资产分布数据（匹配目标图环形样式）
const assetData = [
  { type: 'BTC', value: 55 },
  { type: 'ETH', value: 25 },
  { type: 'SOL', value: 10 },
  { type: 'USDT', value: 10 },
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
      return <Tag color="gold">待审核</Tag>;
    case '已通过':
      return <Tag color="green">已通过</Tag>;
    case '已驳回':
      return <Tag color="red">已驳回</Tag>;
    default:
      return <Tag>{status}</Tag>;
  }
};

const Dashboard = () => {
  // 饼图配置（环形图样式）
  const pieConfig = {
    data: assetData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5, // 内环半径，实现环形效果
    color: ['#1890ff', '#00b42a', '#fa8c16', '#f53f3f'], // 目标图配色
    label: false,
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 14,
        },
      },
    },
    tooltip: {
      formatter: (datum) => {
        return { name: datum.type, value: `${datum.value}%` };
      },
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
          <Button 
            type="link" 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => {
              console.log('查看报告详情');
              // 可添加报告详情跳转逻辑
              // history.push('/crypto-ai/report-detail');
            }}
            style={{ color: '#1890ff' }}
          >
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ 
      padding: 24, 
      height: '100vh', // 窗口高度自适应
      boxSizing: 'border-box', // 包含padding在高度计算内
      overflow: 'hidden', // 隐藏滚动条
      backgroundColor: '#f5f5f5' // 页面背景色
    }}>
      {/* 顶部统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={8} md={12} sm={24}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>未读消息</div>
                <div style={{ fontSize: 24, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <BellOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                  12
                </div>
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 8 }}>
                  3个新增 · 今日更新
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={8} md={12} sm={24}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>待审核报告数</div>
                <div style={{ fontSize: 24, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <FileTextOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  4
                </div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                  截止日期: 2024-12-15
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col lg={8} md={24} sm={24}>
          <Card bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>当前总资产价值</div>
                <div style={{ fontSize: 24, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                  <DollarOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  $10,285,600
                </div>
                <div style={{ fontSize: 12, color: '#52c41a', marginTop: 8, display: 'flex', alignItems: 'center' }}>
                  <span style={{ marginRight: 4 }}>↑2.86%</span>
                  <span>较昨日涨幅</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 快速入口 + 资产分布 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col lg={6} md={12} sm={24}>
          <Card title="快速入口" bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* 查看消息列表 - 可跳转 */}
              <Button
                type="default"
                icon={<BellOutlined />}
                block
                onClick={() => {
                  console.log('跳转至消息列表');
                  history.push('/crypto-ai/message-list'); // 路由跳转
                }}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer',
                  transition: 'all 0.2s' // hover效果过渡
                }}
                hoverStyle={{ borderColor: '#1890ff' }} //  hover时边框变色
              >
                查看消息列表
              </Button>

              {/* 查看持仓数据 - 可跳转 */}
              <Button 
                type="default" 
                icon={<PieChartOutlined />} 
                block 
                onClick={() => {
                  console.log('跳转至持仓数据');
                  history.push('/crypto-ai/portfolio-data'); // 路由跳转
                }}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                hoverStyle={{ borderColor: '#1890ff' }}
              >
                查看持仓数据
              </Button>

              {/* 审核建议报告 - 可跳转 */}
              <Button 
                type="default" 
                icon={<FileTextOutlined />} 
                block 
                onClick={() => {
                  console.log('跳转至审核报告');
                  history.push('/crypto-ai/suggestion-report'); // 路由跳转
                }}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                hoverStyle={{ borderColor: '#1890ff' }}
              >
                审核建议报告
              </Button>

              {/* 导出数据报表 - 假数据交互 */}
              <Button 
                type="default" 
                icon={<DownloadOutlined />} 
                block 
                onClick={() => {
                  console.log('执行导出报表');
                  alert('数据报表导出中（假数据）...'); // 假数据交互
                }}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                hoverStyle={{ borderColor: '#1890ff' }}
              >
                导出数据报表
              </Button>
            </Space>
          </Card>
        </Col>
        <Col lg={18} md={12} sm={24}>
          <Card 
            title="资产分布概览" 
            extra={<span>数据更新时间: 2024-12-10 08:00</span>} 
            bordered={false}
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
          >
            <div style={{ height: 300, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <Pie {...pieConfig} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 近期建议报告 */}
      <Card 
        title="近期建议报告" 
        extra={<Button type="link" onClick={() => {
          console.log('查看全部报告');
          // 可添加查看全部报告跳转逻辑
          // history.push('/crypto-ai/all-reports');
        }}>查看全部</Button>} 
        bordered={false}
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)', flexShrink: 0 }}
      >
        <Table
          dataSource={reportData}
          columns={reportColumns}
          pagination={false}
          rowKey="key"
          size="middle"
          style={{ borderTop: '1px solid #e8e8e8' }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;