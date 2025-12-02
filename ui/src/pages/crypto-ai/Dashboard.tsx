import React, { useState } from 'react';
import { history } from 'umi';
import { Card, Statistic, Row, Col, Button, Table, Space, Tag, Modal, Typography } from 'antd';
import { 
  BellOutlined, FileTextOutlined, DollarOutlined, 
  PieChartOutlined, DownloadOutlined, EyeOutlined,
  ClockCircleOutlined, CheckCircleOutlined, CloseCircleOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

// 模拟资产分布数据
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
    details: '建议减持BTC 5%，增持ETH 3%，以平衡市场风险'
  },
  {
    key: '2',
    reportId: '#R2024120902',
    createTime: '2024-12-09 14:15',
    coins: 'SOL',
    type: '持仓维持',
    status: '已通过',
    details: 'SOL近期表现稳定，建议维持现有持仓比例不变'
  },
  {
    key: '3',
    reportId: '#R2024120801',
    createTime: '2024-12-08 10:45',
    coins: 'ETH, USDT',
    type: '资产配置优化',
    status: '已驳回',
    details: '建议将USDT转换为ETH的比例过高，存在流动性风险，已驳回'
  },
];

// 模拟未读消息数据
const unreadMessages = [
  { id: 1, content: 'BTC价格突破42000美元', time: '10:23' },
  { id: 2, content: 'ETH完成网络升级', time: '09:15' },
  { id: 3, content: '新的持仓建议报告已生成', time: '08:40' },
];

// 模拟待审核报告数据
const pendingReports = [
  { id: '#R2024121001', coin: 'BTC, ETH', type: '持仓调整', time: '09:30' },
  { id: '#R2024120903', coin: 'USDT', type: '流动性调整', time: '16:45' },
  { id: '#R2024120901', coin: 'SOL, BTC', type: '对冲策略', time: '11:20' },
  { id: '#R2024120802', coin: 'ETH', type: '质押建议', time: '15:10' },
];

// 模拟资产详情数据
const assetDetails = [
  { type: 'BTC', value: '$5,657,080', proportion: '55%', change: '+3.2%' },
  { type: 'ETH', value: '$2,571,400', proportion: '25%', change: '+1.8%' },
  { type: 'SOL', value: '$1,028,560', proportion: '10%', change: '-0.5%' },
  { type: 'USDT', value: '$1,028,560', proportion: '10%', change: '0%' },
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
  // 弹窗状态管理
  const [modalVisible, setModalVisible] = useState({
    unread: false,
    pending: false,
    asset: false,
    report: false
  });
  const [currentReport, setCurrentReport] = useState(null);

  // 饼图配置
  const pieConfig = {
    data: assetData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    color: ['#1890ff', '#00b42a', '#fa8c16', '#9370db'], // 匹配新的饼图颜色
    label: false,
    legend: {
      position: 'bottom',
      itemName: {
        style: {
          fontSize: 14,
        },
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
      render: (_, record) => (
        <Button 
          type="link" 
          icon={<EyeOutlined />} 
          size="small"
          onClick={() => {
            setCurrentReport(record);
            setModalVisible(prev => ({ ...prev, report: true }));
          }}
          style={{ color: '#1890ff' }}
        >
          查看
        </Button>
      ),
    },
  ];

  // 打开弹窗
  const openModal = (type) => {
    setModalVisible(prev => ({ ...prev, [type]: true }));
  };

  // 关闭弹窗
  const closeModal = (type) => {
    setModalVisible(prev => ({ ...prev, [type]: false }));
    if (type === 'report') {
      setCurrentReport(null);
    }
  };

  return (
    <div style={{ 
      padding: 24, 
      height: '100vh',
      boxSizing: 'border-box',
      overflow: 'hidden',
      backgroundColor: '#f5f5f5'
    }}>
      {/* 顶部统计卡片 - 可点击弹窗 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {/* 未读消息卡片 */}
        <Col lg={8} md={12} sm={24}>
          <Card 
            bordered={false} 
            style={{ 
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            hoverStyle={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            onClick={() => openModal('unread')}
          >
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

        {/* 待审核报告数卡片 */}
        <Col lg={8} md={12} sm={24}>
          <Card 
            bordered={false} 
            style={{ 
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            hoverStyle={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            onClick={() => openModal('pending')}
          >
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

        {/* 当前总资产价值卡片 */}
        <Col lg={8} md={24} sm={24}>
          <Card 
            bordered={false} 
            style={{ 
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            hoverStyle={{ boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}
            onClick={() => openModal('asset')}
          >
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
              <Button
                type="default"
                icon={<BellOutlined />}
                block
                onClick={() => history.push('/crypto-ai/message-list')}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer'
                }}
                hoverStyle={{ borderColor: '#1890ff' }}
              >
                查看消息列表
              </Button>
              <Button 
                type="default" 
                icon={<PieChartOutlined />} 
                block 
                onClick={() => history.push('/crypto-ai/portfolio-data')}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer'
                }}
                hoverStyle={{ borderColor: '#1890ff' }}
              >
                查看持仓数据
              </Button>
              <Button 
                type="default" 
                icon={<FileTextOutlined />} 
                block 
                onClick={() => history.push('/crypto-ai/suggestion-report')}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer'
                }}
                hoverStyle={{ borderColor: '#1890ff' }}
              >
                审核建议报告
              </Button>
              <Button 
                type="default" 
                icon={<DownloadOutlined />} 
                block 
                onClick={() => alert('数据报表导出中...')}
                style={{ 
                  justifyContent: 'flex-start', 
                  background: '#ffffff',
                  borderColor: '#e8e8e8',
                  cursor: 'pointer'
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
        extra={<Button type="link">查看全部</Button>} 
        bordered={false}
        style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
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

      {/* 未读消息弹窗 */}
      <Modal
        title="未读消息"
        open={modalVisible.unread}
        onCancel={() => closeModal('unread')}
        footer={[
          <Button key="close" onClick={() => closeModal('unread')}>关闭</Button>,
          <Button key="mark-all" type="primary" onClick={() => closeModal('unread')}>
            全部标为已读
          </Button>
        ]}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {unreadMessages.map(msg => (
            <div key={msg.id} style={{ 
              padding: 12, 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <Typography.Text strong>{msg.content}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {msg.time}
              </Typography.Text>
            </div>
          ))}
          {[...Array(9)].map((_, i) => (
            <div key={`more-${i}`} style={{ 
              padding: 12, 
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <div>
                <Typography.Text>系统自动消息通知 {i+4}</Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {`0${7-i}:${i*10+10}`}
              </Typography.Text>
            </div>
          ))}
        </div>
      </Modal>

      {/* 待审核报告弹窗 */}
      <Modal
        title="待审核报告"
        open={modalVisible.pending}
        onCancel={() => closeModal('pending')}
        footer={[
          <Button key="close" onClick={() => closeModal('pending')}>关闭</Button>
        ]}
        width={800}
      >
        <Table
          dataSource={pendingReports}
          columns={[
            { title: '报告ID', dataIndex: 'id', key: 'id' },
            { title: '涉及币种', dataIndex: 'coin', key: 'coin' },
            { title: '报告类型', dataIndex: 'type', key: 'type' },
            { title: '生成时间', dataIndex: 'time', key: 'time' },
            {
              title: '操作',
              key: 'action',
              render: (_, record) => (
                <Space>
                  <Button type="link" size="small">审核</Button>
                  <Button type="link" size="small">详情</Button>
                </Space>
              )
            }
          ]}
          pagination={false}
          rowKey="id"
        />
      </Modal>

      {/* 资产详情弹窗 */}
      <Modal
        title="资产价值详情"
        open={modalVisible.asset}
        onCancel={() => closeModal('asset')}
        footer={[
          <Button key="close" onClick={() => closeModal('asset')}>关闭</Button>
        ]}
        width={600}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Typography.Title level={3} style={{ margin: 0 }}>
            $10,285,600
          </Typography.Title>
          <Typography.Text type="success">↑2.86% 较昨日涨幅</Typography.Text>
        </div>
        
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong>资产分布明细</Typography.Text>
        </div>
        
        {assetDetails.map((item, index) => (
          <div key={index} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            padding: 10,
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: 12, 
                height: 12, 
                borderRadius: '50%', 
                marginRight: 8,
                backgroundColor: ['#1890ff', '#00b42a', '#fa8c16', '#9370db'][index]
              }}></div>
              <Typography.Text strong>{item.type}</Typography.Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Typography.Text strong>{item.value}</Typography.Text>
              <div style={{ fontSize: 12, color: '#666' }}>
                {item.proportion} · {item.change}
              </div>
            </div>
          </div>
        ))}
      </Modal>

      {/* 报告详情弹窗 */}
      <Modal
        title={`报告详情: ${currentReport?.reportId}`}
        open={modalVisible.report}
        onCancel={() => closeModal('report')}
        footer={[
          <Button key="close" onClick={() => closeModal('report')}>关闭</Button>
        ]}
        width={600}
      >
        {currentReport && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text>生成时间: {currentReport.createTime}</Typography.Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text>涉及币种: {currentReport.coins}</Typography.Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text>建议类型: {currentReport.type}</Typography.Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Typography.Text>
                状态: {statusTag(currentReport.status)}
              </Typography.Text>
            </div>
            <div>
              <Typography.Title level={5} style={{ marginBottom: 8 }}>建议详情</Typography.Title>
              <Typography.Paragraph>
                {currentReport.details}
              </Typography.Paragraph>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;