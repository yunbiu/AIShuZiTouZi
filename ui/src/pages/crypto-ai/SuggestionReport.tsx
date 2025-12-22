import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Button, Space, Select, DatePicker, Divider, Typography, Descriptions, message, Modal, Slider, Spin,Layout } from 'antd';
import { DownloadOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, PlusOutlined } from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import type { Dayjs } from 'dayjs';
import { getReportList, getReportDetail, approveReport, rejectReport, generateReport, type ReportItem, type ReportDetail } from '@/services/crypto/report';
import { history } from 'umi';
import {
  BellOutlined, FileTextOutlined, DollarOutlined,
  PieChartOutlined,
  HomeOutlined, MessageOutlined, BarChartOutlined,
  CheckOutlined
} from '@ant-design/icons';
const { Option } = Select;
const { RangePicker } = DatePicker;
const { Title, Paragraph, Text } = Typography;
const { Header } = Layout;
// 报告数据状态管理
const SuggestionReport: React.FC = () => {
  const [reportData, setReportData] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});

  const statusConfig = {
    pending: { color: 'orange', text: '待审核' },
    '待审': { color: 'orange', text: '待审核' },
    approved: { color: 'green', text: '已通过' },
    '已通过': { color: 'green', text: '已通过' },
    rejected: { color: 'red', text: '已驳回' },
    '已驳回': { color: 'red', text: '已驳回' },
  };

  const reportTypeOptions = ['持仓调整', '持仓维持', '资产配置优化', '减持建议', '增持建议', '全部类型'];
  const statusOptions = ['待审核', '已通过', '已驳回', '全部状态'];

  const [selectedReportType, setSelectedReportType] = useState('全部类型');
  const [selectedStatus, setSelectedStatus] = useState('全部状态');
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [confidenceThreshold, setConfidenceThreshold] = useState('70');
  // 新增生成对话框状态
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  // 新增生成参数状态
  const [generateParams, setGenerateParams] = useState({
    cryptoTypes: '',
    reportType: '持仓调整',
    confidenceLevel: 80,
  });

  // 加载报告列表数据
  const loadReportData = async () => {
    setLoading(true);
    try {
      const response = await getReportList();
      if (response.code === 200) {
        // 转换API返回的数据格式以匹配组件期望的字段
        const transformedData = response.data.records.map((item: any) => ({
          id: item.reportId,
          createTime: item.generationTime,
          cryptoTypes: item.involvedCurrencies,
          reportType: item.suggestionType,
          confidenceLevel: item.confidence,
          expectedROI: item.expectedReturn,
          status: item.status === '待审' ? 'pending' : item.status,
          analyst: item.analyst
        }));
        setReportData(transformedData);
      } else {
        message.error(`获取报告列表失败: ${response.msg}`);
        setReportData([]);
      }
    } catch (error) {
      message.error('获取报告列表失败，请检查网络连接');
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    loadReportData();
  }, []);

  const handleRefresh = () => {
    loadReportData();
  };

  const handleViewDetail = (id: string) => {
    setExpandedReport(expandedReport === id ? null : id);
  };

  const handleApprove = async (id: string) => {
    try {
      const response = await approveReport(id);
      if (response.code === 200) {
        message.success('报告审核通过');
        loadReportData(); // 刷新列表
      } else {
        message.error(`审核失败: ${response.msg}`);
      }
    } catch (error) {
      message.error('审核失败，请检查网络连接');
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await rejectReport(id);
      if (response.code === 200) {
        message.success('报告已驳回');
        loadReportData(); // 刷新列表
      } else {
        message.error(`驳回失败: ${response.msg}`);
      }
    } catch (error) {
      message.error('驳回失败，请检查网络连接');
    }
  };

  const handleDownload = (id: string) => {
    // 下载报告逻辑
    console.log(`下载报告 ${id}`);
  };

  // 新增：打开生成对话框
  const showGenerateModal = () => {
    setGenerateModalVisible(true);
  };

  // 新增：关闭生成对话框
  const closeGenerateModal = () => {
    setGenerateModalVisible(false);
  };

  // 新增：处理生成参数变化
  const handleParamChange = (field: string, value: any) => {
    setGenerateParams({
      ...generateParams,
      [field]: value
    });
  };

  // 新增：处理生成报告
  const handleGenerate = async () => {
    try {
      message.loading('正在生成报告...');
      
      const response = await generateReport({
        cryptoTypes: generateParams.cryptoTypes,
        reportType: generateParams.reportType,
        confidenceLevel: generateParams.confidenceLevel,
      });
      
      if (response.code === 200) {
        message.success('报告生成成功！');
        closeGenerateModal();
        loadReportData(); // 刷新列表
      } else {
        message.error(`报告生成失败: ${response.msg}`);
      }
    } catch (error) {
      message.error('报告生成失败，请检查网络连接');
    }
  };

  // 筛选数据函数
  const filterReportData = () => {
    return reportData.filter(item => {
      // 报告类型筛选 - 支持API返回的简化类型名称
      if (selectedReportType !== '全部类型') {
        const typeMap = {
          '增持建议': ['增持', '增持建议'],
          '减持建议': ['减持', '减持建议'],
          '持仓调整': ['持仓调整', '调整'],
          '持仓维持': ['持仓维持', '维持'],
          '资产配置优化': ['资产配置优化', '优化']
        };
        
        const targetTypes = typeMap[selectedReportType as keyof typeof typeMap] || [selectedReportType];
        if (!targetTypes.includes(item.reportType)) {
          return false;
        }
      }
      
      // 状态筛选
      if (selectedStatus !== '全部状态') {
        const statusMap = {
          '待审核': ['pending', '待审'],
          '已通过': ['approved', '已通过'],
          '已驳回': ['rejected', '已驳回']
        };
        const targetStatuses = statusMap[selectedStatus as keyof typeof statusMap];
        if (!targetStatuses.includes(item.status)) {
          return false;
        }
      }
      
      // 置信度筛选
      if (confidenceThreshold !== '70' && item.confidenceLevel < parseInt(confidenceThreshold)) {
        return false;
      }
      
      // 日期筛选
      if (dateRange && dateRange[0] && dateRange[1]) {
        const itemDate = new Date(item.createTime);
        const startDate = dateRange[0].toDate();
        const endDate = dateRange[1].toDate();
        
        if (itemDate < startDate || itemDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  };

  // 获取筛选后的数据
  const filteredData = filterReportData();

  // 获取报告详情数据
  const fetchReportDetail = async (id: string): Promise<ReportDetail | null> => {
    setDetailLoading(prev => ({ ...prev, [id]: true }));
    try {
      const response = await getReportDetail(id);
      if (response.code === 200) {
        return response.data;
      } else {
        message.error(`获取报告详情失败: ${response.msg}`);
        return null;
      }
    } catch (error) {
      message.error('获取报告详情失败，请检查网络连接');
      return null;
    } finally {
      setDetailLoading(prev => ({ ...prev, [id]: false }));
    }
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
    // {
    //   title: '置信度',
    //   dataIndex: 'confidenceLevel',
    //   key: 'confidenceLevel',
    //   render: (level: number) => (
    //     <Tag color={level >= 90 ? 'green' : level >= 75 ? 'blue' : 'orange'}>
    //       {level}%
    //     </Tag>
    //   ),
    // },
    // {
    //   title: '预期收益',
    //   dataIndex: 'expectedROI',
    //   key: 'expectedROI',
    //   render: (roi: number) => (
    //     <span style={{ color: roi >= 0 ? 'green' : 'red' }}>
    //       {roi >= 0 ? '+' : ''}{roi}%
    //     </span>
    //   ),
    // },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        if (!config) {
          return <Tag color="default">{status}</Tag>;
        }
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
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
          {/* <Button 
            type="link" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewDetail(record.id)}
          >
            详情
          </Button> */}
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
      <Card style={{ margin: 19 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 16, padding: 16 }}>
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
              icon={<PlusOutlined />} 
              onClick={showGenerateModal}
            >
              生成报告
            </Button>
            <Button 
              type="default" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
            >
              刷新
            </Button>
          </div>
        </div>
        
        <Table 
          columns={columns} 
         dataSource={filteredData} 
          pagination={{ pageSize: 10 }}
          rowKey="id"
          loading={loading}
          expandable={{
            expandedRowRender: (record) => {
              // 创建一个简单的详情组件
              const DetailComponent = () => {
                const [detail, setDetail] = useState<ReportDetail | null>(null);
                
                useEffect(() => {
                  if (expandedReport === record.id) {
                    fetchReportDetail(record.id).then(setDetail);
                  }
                }, [expandedReport, record.id]);
                
                if (detailLoading[record.id]) {
                  return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
                }
                
                if (!detail) {
                  return <div style={{ textAlign: 'center', padding: '20px' }}>加载失败</div>;
                }
                
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
                      {detail.rejectedBy && (
                        <Descriptions.Item label="驳回人">{detail.rejectedBy}</Descriptions.Item>
                      )}
                      {detail.rejectedTime && (
                        <Descriptions.Item label="驳回时间">{detail.rejectedTime}</Descriptions.Item>
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
              };
              
              return <DetailComponent />;
            },
            rowExpandable: (record) => record.id === expandedReport,
          }}
        />
      </Card>

      {/* 生成报告对话框 */}
      <Modal
        title="生成投资建议报告"
        open={generateModalVisible}
        onOk={handleGenerate}
        onCancel={closeGenerateModal}
        okText="生成"
        cancelText="取消"
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>涉及币种:</label>
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="请选择或输入币种（如BTC、ETH等）"
              value={generateParams.cryptoTypes.split(',').filter(Boolean)}
              onChange={(values) => handleParamChange('cryptoTypes', values.join(','))}
              tokenSeparators={[',']}
            >
              <Option value="BTC">BTC</Option>
              <Option value="ETH">ETH</Option>
              <Option value="SOL">SOL</Option>
              <Option value="USDT">USDT</Option>
              <Option value="BNB">BNB</Option>
            </Select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>报告类型:</label>
            <Select
              style={{ width: '100%' }}
              value={generateParams.reportType}
              onChange={(value) => handleParamChange('reportType', value)}
            >
              <Option value="持仓调整">持仓调整</Option>
              <Option value="持仓维持">持仓维持</Option>
              <Option value="资产配置优化">资产配置优化</Option>
              <Option value="减持建议">减持建议</Option>
              <Option value="增持建议">增持建议</Option>
            </Select>
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', marginBottom: 8 }}>最低置信度: {generateParams.confidenceLevel}%</label>
            <Slider
              min={70}
              max={95}
              step={5}
              value={generateParams.confidenceLevel}
              onChange={(value) => handleParamChange('confidenceLevel', value)}
              marks={{
                70: '70%',
                80: '80%',
                90: '90%',
                95: '95%'
              }}
            />
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default SuggestionReport;