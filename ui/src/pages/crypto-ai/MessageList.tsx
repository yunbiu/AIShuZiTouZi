import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Input, Button, Row, Col, Tag, Modal, Spin, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';

// 定义接口类型 - 消息列表项
interface MessageItem {
  id: number;
  title: string;
  coin: string;
  sentiment: '利好' | '利空' | '中性';
  source: string;
  content: string;
  publishTime: string;
  updateTime: string;
}

// 定义接口类型 - 列表接口返回数据
interface MessageListResponse {
  code: number;
  msg: string;
  data: {
    records: MessageItem[];
    total: number;
    size: number;
    current: number;
    pages: number;
  };
}

// 定义接口类型 - 详情接口返回数据
interface MessageDetailResponse {
  code: number;
  msg: string;
  data: MessageItem;
}

// 情感倾向标签映射
const sentimentTag = (sentiment: '利好' | '利空' | '中性') => {
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

const MessageList: React.FC = () => {
  // 状态管理
  const [loading, setLoading] = useState<boolean>(false); // 列表加载状态
  const [detailLoading, setDetailLoading] = useState<boolean>(false); // 详情加载状态
  const [messageList, setMessageList] = useState<MessageItem[]>([]); // 消息列表数据
  const [total, setTotal] = useState<number>(0); // 总条数
  const [currentPage, setCurrentPage] = useState<number>(1); // 当前页码
  const [pageSize] = useState<number>(10); // 每页条数（和后端保持一致）
  
  // 筛选条件
  const [coinFilter, setCoinFilter] = useState<string>('all'); // 币种筛选
  const [sentimentFilter, setSentimentFilter] = useState<string>('all'); // 情感倾向筛选
  const [searchKeyword, setSearchKeyword] = useState<string>(''); // 搜索关键词
  
  // 详情弹窗状态
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentDetail, setCurrentDetail] = useState<MessageItem | null>(null);

  // 接口基础地址
  const baseUrl = 'http://localhost:8080/message';

  // 获取消息列表
  const fetchMessageList = async () => {
    setLoading(true);
    try {
      // 构造请求参数
      const params = {
        current: currentPage,
        size: pageSize,
        coin: coinFilter !== 'all' ? coinFilter : undefined,
        sentiment: sentimentFilter !== 'all' ? sentimentFilter : undefined,
        keyword: searchKeyword || undefined,
      };

      const response = await axios.get<MessageListResponse>(`${baseUrl}/list`, { params });
      if (response.data.code === 200) {
        setMessageList(response.data.data.records);
        setTotal(response.data.data.total);
        setCurrentPage(response.data.data.current);
        message.success('数据加载成功');
      } else {
        message.error(`加载失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取消息列表失败:', error);
      message.error('网络异常，获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取消息详情
  const fetchMessageDetail = async (id: number) => {
    setDetailLoading(true);
    try {
      const response = await axios.get<MessageDetailResponse>(`${baseUrl}/${id}`);
      if (response.data.code === 200) {
        setCurrentDetail(response.data.data);
        setDetailVisible(true);
      } else {
        message.error(`获取详情失败: ${response.data.msg}`);
      }
    } catch (error) {
      console.error('获取消息详情失败:', error);
      message.error('网络异常，获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchMessageList();
  }, [currentPage, coinFilter, sentimentFilter, searchKeyword]);

  // 刷新数据
  const handleRefresh = () => {
    fetchMessageList();
  };

  // 分页变化处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 币种筛选变化
  const handleCoinChange = (value: string) => {
    setCoinFilter(value);
    setCurrentPage(1); // 筛选后重置页码
  };

  // 情感倾向筛选变化
  const handleSentimentChange = (value: string) => {
    setSentimentFilter(value);
    setCurrentPage(1); // 筛选后重置页码
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1); // 搜索后重置页码
  };

  // 查看详情
  const handleViewDetail = (id: number) => {
    fetchMessageDetail(id);
  };

  // 关闭详情弹窗
  const handleDetailClose = () => {
    setDetailVisible(false);
    setCurrentDetail(null);
  };

  // 表格列配置
  const columns = [
    { 
      title: '#', 
      dataIndex: 'id', 
      key: 'id',
      width: 60
    },
    { 
      title: '消息标题', 
      dataIndex: 'title', 
      key: 'title',
      ellipsis: true // 标题过长省略
    },
    { 
      title: '涉及币种', 
      dataIndex: 'coin', 
      key: 'coin',
      width: 100
    },
    { 
      title: '情感倾向', 
      dataIndex: 'sentiment', 
      key: 'sentiment', 
      render: sentimentTag,
      width: 100
    },
    { 
      title: '消息来源', 
      dataIndex: 'source', 
      key: 'source',
      width: 120
    },
    { 
      title: '发布时间', 
      dataIndex: 'publishTime', 
      key: 'publishTime',
      width: 180
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_: any, record: MessageItem) => (
        <Button 
          type="link" 
          size="small" 
          onClick={() => handleViewDetail(record.id)}
        >
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Card bordered={false}>
        <div style={{ marginBottom: 16 }}>
          <h2>消息列表</h2>
          <p style={{ color: '#888' }}>已采集到 {total} 条市场消息，按时间倒序排列</p>
        </div>

        {/* 筛选区域 */}
        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col lg={4} md={8} sm={24}>
            <Select
              value={coinFilter}
              onChange={handleCoinChange}
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
              value={sentimentFilter}
              onChange={handleSentimentChange}
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
              onChange={(e) => setSearchKeyword(e.target.value)}
              onSearch={handleSearch}
              enterButton
            />
          </Col>
          <Col lg={4} md={8} sm={24}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              block 
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          </Col>
        </Row>

        {/* 消息表格 */}
        <Spin spinning={loading}>
          <Table
            dataSource={messageList}
            columns={columns}
            rowKey="id"
            size="middle"
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              showSizeChanger: true, // 允许调整每页条数
              showQuickJumper: true,
              pageSizeOptions: ['5', '10', '20'],
              onChange: handlePageChange,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
          />
        </Spin>
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="消息详情"
        open={detailVisible}
        onCancel={handleDetailClose}
        footer={[
          <Button key="close" onClick={handleDetailClose}>
            关闭
          </Button>,
        ]}
        width={800}
        destroyOnClose // 关闭时销毁内容
      >
        <Spin spinning={detailLoading}>
          {currentDetail && (
            <div style={{ lineHeight: 1.8 }}>
              <div style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #eee' }}>
                <h3 style={{ margin: 0, color: '#1f2937' }}>{currentDetail.title}</h3>
                <div style={{ marginTop: 8, display: 'flex', gap: 16 }}>
                  <span>
                    <strong>涉及币种：</strong>
                    {currentDetail.coin}
                  </span>
                  <span>
                    <strong>情感倾向：</strong>
                    {sentimentTag(currentDetail.sentiment)}
                  </span>
                  <span>
                    <strong>消息来源：</strong>
                    {currentDetail.source}
                  </span>
                  <span>
                    <strong>发布时间：</strong>
                    {currentDetail.publishTime}
                  </span>
                </div>
              </div>
              <div>
                <strong>消息内容：</strong>
                <div style={{ marginTop: 8, whiteSpace: 'pre-wrap' }}>
                  {currentDetail.content}
                </div>
              </div>
            </div>
          )}
        </Spin>
      </Modal>
    </div>
  );
};

export default MessageList;