import React, { useState, useEffect } from 'react';
import { history } from 'umi';
import { Card, Statistic, Row, Col, Button, Table, Space, Tag, Modal, Typography, Layout, Select, Descriptions, Divider, message } from 'antd';
import {
  BellOutlined, FileTextOutlined, DollarOutlined,
  PieChartOutlined, DownloadOutlined, EyeOutlined,
  HomeOutlined, MessageOutlined, BarChartOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { Pie } from '@ant-design/plots';

const { Header } = Layout;
const { Option } = Select;
const { Text, Title, Paragraph } = Typography;

// 模拟数据（保留非消息相关的原有数据）
const assetData = [
  { type: 'BTC', value: 55 },
  { type: 'ETH', value: 25 },
  { type: 'SOL', value: 10 },
  { type: 'USDT', value: 10 },
];
const reportData = [
  {
    key: '1',
    reportId: '#R2024121001',
    createTime: '2024-12-10 09:30',
    coins: 'BTC, ETH',
    type: '持仓调整',
    status: '待审核',
    details: '建议减持BTC 5%，增持ETH 3%，以平衡市场风险',
    analyst: 'AI-System-A',
    confidence: '92%',
    expectedReturn: '+8.5%',
    riskLevel: '中等',
    recommendation: '建议在未来3天内逐步调整仓位，注意市场波动',
    marketOutlook: '短期内市场可能出现回调，但长期趋势仍然向好'
  },
  {
    key: '2',
    reportId: '#R2024120902',
    createTime: '2024-12-09 14:15',
    coins: 'SOL',
    type: '持仓维持',
    status: '已通过',
    details: 'SOL近期表现稳定，建议维持现有持仓比例不变',
    analyst: 'AI-System-B',
    confidence: '86%',
    expectedReturn: '+4.2%',
    riskLevel: '低',
    recommendation: '继续持有现有仓位，关注项目进展',
    marketOutlook: '项目基本面良好，预计未来一个月将有正面催化剂'
  },
  {
    key: '3',
    reportId: '#R2024120801',
    createTime: '2024-12-08 10:45',
    coins: 'ETH, USDT',
    type: '资产配置优化',
    status: '已驳回',
    details: '建议将USDT转换为ETH的比例过高，存在流动性风险，已驳回',
    analyst: 'AI-System-C',
    confidence: '78%',
    expectedReturn: '+6.3%',
    riskLevel: '高',
    recommendation: '建议降低ETH增持比例，保持一定现金储备',
    marketOutlook: '市场不确定性较高，建议采取保守策略'
  },
];
const pendingReports = [
  { id: '#R2024121001', coin: 'BTC, ETH', type: '持仓调整', time: '09:30' },
  { id: '#R2024120903', coin: 'USDT', type: '流动性调整', time: '16:45' },
  { id: '#R2024120901', coin: 'SOL, BTC', type: '对冲策略', time: '11:20' },
  { id: '#R2024120802', coin: 'ETH', type: '质押建议', time: '15:10' },
];
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
  // 弹窗状态
  const [modalVisible, setModalVisible] = useState({
    unread: false,
    pending: false,
    asset: false,
    report: false
  });
  const [currentReport, setCurrentReport] = useState(null);
  const [selectedReportId, setSelectedReportId] = useState<string | undefined>(undefined);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 3,
    total: reportData.length
  });

  // 新增：存储真实接口数据的状态
  const [unreadCount, setUnreadCount] = useState(0); // 未读消息数量
  const [realUnreadMessages, setRealUnreadMessages] = useState([]); // 未读消息列表
  const [loading, setLoading] = useState(true); // 接口加载状态

  // 封装：获取未读消息数量
  const fetchUnreadCount = async () => {
    try {
      const response = await fetch('http://localhost:8080/message/unread/count');
      const result = await response.json();
      if (result.code === 200) {
        setUnreadCount(result.data);
      } else {
        message.error('获取未读消息数量失败：' + result.msg);
      }
    } catch (error) {
      console.error('未读消息数量请求异常：', error);
      message.error('获取未读消息数量失败，请检查接口连接');
    }
  };

  // 封装：获取未读消息列表
  const fetchUnreadMessageList = async () => {
    try {
      const response = await fetch('http://localhost:8080/message/unread/list');
      const result = await response.json();
      if (result.code === 200) {
        setRealUnreadMessages(result.data);
      } else {
        message.error('获取未读消息列表失败：' + result.msg);
      }
    } catch (error) {
      console.error('未读消息列表请求异常：', error);
      message.error('获取未读消息列表失败，请检查接口连接');
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时发起接口请求
  useEffect(() => {
    fetchUnreadCount();
    fetchUnreadMessageList();
    //  eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 分页变化处理
  const handlePaginationChange = (page: number, pageSize: number) => {
    setPagination(prev => ({
      ...prev,
      current: page,
      pageSize
    }));
  };

  // 饼图配置（匹配目标图颜色）
  const pieConfig = {
    data: assetData,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.5,
    color: ['#1890ff', '#00b42a', '#fa8c16', '#f53f3f'],
    label: false,
    legend: {
      position: 'bottom',
      itemName: { style: { fontSize: 14 } },
    },
  };

  // 报告表格列
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
        <Space>
          <Button
            type="link"
            icon={<CheckOutlined />}
            size="small"
            onClick={() => {
              setCurrentReport(record);
              setModalVisible(prev => ({ ...prev, report: true }));
            }}
            style={{ color: '#00b42a' }}
          >
            审核
          </Button>
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
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 弹窗控制
  const openModal = (type) => setModalVisible(prev => ({ ...prev, [type]: true }));
  const closeModal = (type) => {
    setModalVisible(prev => ({ ...prev, [type]: false }));
    if (type === 'report') setCurrentReport(null);
  };

  // 处理报告选择变化
  const handleReportChange = (value: string) => {
    setSelectedReportId(value);
    const selectedReport = reportData.find(report => report.reportId === value);
    if (selectedReport) {
      setCurrentReport(selectedReport);
      setModalVisible(prev => ({ ...prev, report: true }));
    }
  };

  return (
    <Layout style={{ height: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
          AI数字货币投资辅助系统
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => history.push('/crypto-ai/dashboard')}
            style={{ color: '#1890ff', fontWeight: 500 }}
          >
            系统概览
          </Button>
          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={() => history.push('/crypto-ai/message-list')}
            style={{ color: '#666', fontWeight: 500 }}
          >
            消息列表
          </Button>
          <Button
            type="text"
            icon={<BarChartOutlined />}
            onClick={() => history.push('/crypto-ai/portfolio-data')}
            style={{ color: '#666', fontWeight: 500 }}
          >
            持仓数据
          </Button>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => history.push('/crypto-ai/suggestion-report')}
            style={{ color: '#666', fontWeight: 500 }}
          >
            建议报告
          </Button>
        </div>
      </Header>

      {/* 主内容区 */}
      <div style={{
        padding: 24,
        height: 'calc(100vh - 64px)',
        boxSizing: 'border-box',
        overflow: 'hidden',
        backgroundColor: '#f5f5f5'
      }}>
        {/* 顶部统计卡片 - 替换未读消息数为接口数据 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col lg={8} md={12} sm={24}>
            <Card
              bordered={false}
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer' }}
              onClick={() => openModal('unread')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>未读消息数</div>
                  <div style={{ fontSize: 24, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
                    <BellOutlined style={{ color: '#1890ff', marginRight: 8 }} />
                    {loading ? '加载中...' : unreadCount}
                  </div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>
                    点击查看
                  </div>
                </div>
              </div>
            </Card>
          </Col>
          <Col lg={8} md={12} sm={24}>
            <Card
              bordered={false}
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer' }}
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
          <Col lg={8} md={24} sm={24}>
            <Card
              bordered={false}
              style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)', cursor: 'pointer' }}
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
          <Col lg={8} md={12} sm={24}>
            <Card title="快速入口" bordered={false} style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)', padding: 24 }}>
              <Space direction="vertical" style={{ width: '100%', gap: 16 }}>
                <Button
                  type="default"
                  icon={<MessageOutlined />}
                  block
                  size="large"
                  onClick={() => history.push('/crypto-ai/message-list')}
                  style={{ justifyContent: 'flex-start', background: '#fff', borderColor: '#e8e8e8', height: 48, fontSize: 16 }}
                >
                  查看消息列表
                </Button>
                <Button
                  type="default"
                  icon={<BarChartOutlined />}
                  block
                  size="large"
                  onClick={() => history.push('/crypto-ai/portfolio-data')}
                  style={{ justifyContent: 'flex-start', background: '#fff', borderColor: '#e8e8e8', height: 48, fontSize: 16 }}
                >
                  查看持仓数据
                </Button>
                <Button
                  type="default"
                  icon={<FileTextOutlined />}
                  block
                  size="large"
                  onClick={() => history.push('/crypto-ai/suggestion-report')}
                  style={{ justifyContent: 'flex-start', background: '#fff', borderColor: '#e8e8e8', height: 48, fontSize: 16 }}
                >
                  审核建议报告
                </Button>
                <Button
                  type="default"
                  icon={<DownloadOutlined />}
                  block
                  size="large"
                  onClick={() => alert('数据报表导出中...')}
                  style={{ justifyContent: 'flex-start', background: '#fff', borderColor: '#e8e8e8', height: 48, fontSize: 16 }}
                >
                  导出数据报表
                </Button>
              </Space>
            </Card>
          </Col>
          <Col lg={16} md={12} sm={24}>
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
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
              <span>近期建议报告</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 14 }}>选择报告:</span>
                <Select
                  style={{
                    width: { xs: '100%', sm: 200 },
                    maxWidth: 280,
                    borderColor: '#d9d9d9',
                    borderRadius: 4,
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
                  }}
                  placeholder="请选择报告ID"
                  value={selectedReportId}
                  onChange={handleReportChange}
                  allowClear
                  showSearch
                  dropdownStyle={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)' }}
                >
                  {reportData.map(report => (
                    <Option key={report.key} value={report.reportId}>
                      {report.reportId} - {report.type}
                    </Option>
                  ))}
                </Select>
              </div>
            </div>
          }
          extra={<Button type="link" onClick={() => history.push('/crypto-ai/suggestion-report')}>查看全部</Button>}
          bordered={false}
          style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.1)' }}
        >
          {/* 计算当前页显示的数据 */}
          {(() => {
            const { current, pageSize } = pagination;
            const startIndex = (current - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            const currentPageData = reportData.slice(startIndex, endIndex);

            return (
              <Table
                dataSource={currentPageData}
                columns={reportColumns}
                pagination={{
                  ...pagination,
                  onChange: handlePaginationChange,
                  showSizeChanger: true,
                  showTotal: (total) => `共 ${total} 条记录`,
                  pageSizeOptions: ['3', '5', '10'],
                  style: { marginBottom: 0 }
                }}
                rowKey="key"
                size="middle"
                style={{ borderTop: '1px solid #e8e8e8' }}
                expandable={{
                  expandedRowRender: (record) => (
                    <div style={{ padding: '16px 0' }}>
                      <Descriptions column={2} size="small">
                        <Descriptions.Item label="分析师">{record.analyst}</Descriptions.Item>
                        <Descriptions.Item label="置信度">{record.confidence}</Descriptions.Item>
                        <Descriptions.Item label="预期收益率">{record.expectedReturn}</Descriptions.Item>
                        <Descriptions.Item label="风险等级">{record.riskLevel}</Descriptions.Item>
                      </Descriptions>

                      <Divider style={{ margin: '12px 0' }} />

                      <div>
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>建议详情:</div>
                        <div>{record.details}</div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>建议操作:</div>
                        <div>{record.recommendation}</div>
                      </div>

                      <div style={{ marginTop: 8 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: 8 }}>市场展望:</div>
                        <div>{record.marketOutlook}</div>
                      </div>
                    </div>
                  ),
                  rowExpandable: (record) => true,
                }}
              />
            );
          })()}
        </Card>
      </div>

      {/* 弹窗 - 替换未读消息为接口数据（展示title） */}
      <Modal
        title="未读消息"
        open={modalVisible.unread}
        onCancel={() => closeModal('unread')}
        footer={[
          <Button key="close" onClick={() => closeModal('unread')}>关闭</Button>,
        ]}
        width={600}
      >
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>加载未读消息中...</div>
          ) : realUnreadMessages.length > 0 ? (
            realUnreadMessages.map(msg => (
              <div key={msg.id} style={{ padding: 12, borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between' }}>
                <Text strong>{msg.title}</Text> {/* 展示接口返回的title */}
                <Text type="secondary" style={{ fontSize: 12 }}>{msg.publish_time}</Text> {/* 展示发布时间 */}
              </div>
            ))
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#666' }}>暂无未读消息</div>
          )}
        </div>
      </Modal>

      <Modal
        title="待审核报告"
        open={modalVisible.pending}
        onCancel={() => closeModal('pending')}
        footer={[<Button key="close" onClick={() => closeModal('pending')}>关闭</Button>]}
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
                  <Button
                    type="link"
                    icon={<CheckOutlined />}
                    size="small"
                    onClick={() => {
                      Modal.confirm({
                        title: '审核报告',
                        content: `确定要审核报告 ${record.id} 吗？`,
                        okText: '通过',
                        okType: 'primary',
                        cancelText: '拒绝',
                        onOk: () => {
                          message.success('审核通过');
                          console.log('审核通过报告:', record.id);
                        },
                        onCancel: () => {
                          message.info('审核已拒绝');
                          console.log('拒绝审核报告:', record.id);
                        },
                      });
                    }}
                    style={{ color: '#00b42a' }}
                  >
                    审核
                  </Button>
                  <Button
                    type="link"
                    icon={<EyeOutlined />}
                    size="small"
                    onClick={() => {
                      const fullReport = reportData.find(report => report.reportId === record.id);
                      if (fullReport) {
                        setCurrentReport(fullReport);
                        setModalVisible(prev => ({ ...prev, report: true }));
                      }
                    }}
                    style={{ color: '#1890ff' }}
                  >
                    详情
                  </Button>
                </Space>
              )
            }
          ]}
          pagination={false}
          rowKey="id"
        />
      </Modal>

      <Modal
        title="资产价值详情"
        open={modalVisible.asset}
        onCancel={() => closeModal('asset')}
        footer={[<Button key="close" onClick={() => closeModal('asset')}>关闭</Button>]}
        width={600}
      >
        <div style={{ marginBottom: 20, textAlign: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>$10,285,600</Title>
          <Text type="success">↑2.86% 较昨日涨幅</Text>
        </div>
        <Text strong>资产分布明细</Text>
        {assetDetails.map((item, index) => (
          <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: 10, borderBottom: '1px solid #f0f0f0' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', marginRight: 8, backgroundColor: ['#1890ff', '#00b42a', '#fa8c16', '#f53f3f'][index] }}></div>
              <Text strong>{item.type}</Text>
            </div>
            <div style={{ textAlign: 'right' }}>
              <Text strong>{item.value}</Text>
              <div style={{ fontSize: 12, color: '#666' }}>{item.proportion} · {item.change}</div>
            </div>
          </div>
        ))}
      </Modal>

      <Modal
        title={`报告详情: ${currentReport?.reportId}`}
        open={modalVisible.report}
        onCancel={() => closeModal('report')}
        footer={[<Button key="close" onClick={() => closeModal('report')}>关闭</Button>]}
        width={600}
      >
        {currentReport && (
          <div>
            <div style={{ marginBottom: 16 }}><Text>生成时间: {currentReport.createTime}</Text></div>
            <div style={{ marginBottom: 16 }}><Text>涉及币种: {currentReport.coins}</Text></div>
            <div style={{ marginBottom: 16 }}><Text>建议类型: {currentReport.type}</Text></div>
            <div style={{ marginBottom: 16 }}><Text>状态: {statusTag(currentReport.status)}</Text></div>
            <Title level={5} style={{ marginBottom: 8 }}>建议详情</Title>
            <Paragraph>{currentReport.details}</Paragraph>

            <Divider>详细信息</Divider>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="分析师">{currentReport.analyst}</Descriptions.Item>
              <Descriptions.Item label="置信度">{currentReport.confidence}</Descriptions.Item>
              <Descriptions.Item label="预期收益率">{currentReport.expectedReturn}</Descriptions.Item>
              <Descriptions.Item label="风险等级">{currentReport.riskLevel}</Descriptions.Item>
              <Descriptions.Item label="建议操作">{currentReport.recommendation}</Descriptions.Item>
              <Descriptions.Item label="市场展望">{currentReport.marketOutlook}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default Dashboard;