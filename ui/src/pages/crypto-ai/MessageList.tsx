import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Input, Button, Row, Col, Tag, Modal, Spin, message, Badge } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
import { request } from '@umijs/max';

// 定义接口类型 - 消息列表项
interface MessageItem {
  id: number;
  title: string;
  coin: string;
  sentiment: '利好' | '利空' | '中性';
  source: string;
  content: string;
  publish_time: string;
  status: 0 | 1; // 0: 未读, 1: 已读
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
  const [loading, setLoading] = useState<boolean>(false);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);
  const [messageList, setMessageList] = useState<MessageItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  
  // 筛选条件
  const [coinFilter, setCoinFilter] = useState<string>('all');
  const [sentimentFilter, setSentimentFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all'); // 状态筛选
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  
  // 详情弹窗状态
  const [detailVisible, setDetailVisible] = useState<boolean>(false);
  const [currentDetail, setCurrentDetail] = useState<MessageItem | null>(null);

  // 获取消息列表
  const fetchMessageList = async () => {
    setLoading(true);
    try {
      // 构造请求参数
      const params: any = {
        current: currentPage,
        size: pageSize,
      };

      // 添加筛选条件（如果未选择"全部"）
      if (coinFilter !== 'all') params.coin = coinFilter;
      if (sentimentFilter !== 'all') params.sentiment = sentimentFilter;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (searchKeyword) params.keyword = searchKeyword;

      const response = await request<MessageListResponse>('/api/message/list', { 
        method: 'GET',
        params
      });
      
      if (response.code === 200) {
        setMessageList(response.data.records);
        setTotal(response.data.total);
      } else {
        message.error(`加载失败: ${response.msg}`);
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
      const response = await request<MessageDetailResponse>(`/api/message/${id}`, {
        method: 'GET'
      });
      
      if (response.code === 200) {
        setCurrentDetail(response.data);
        setDetailVisible(true);
        
        // 查看详情后，将该消息标记为已读，并更新列表中的状态
        setMessageList(prevList => 
          prevList.map(item => 
            item.id === id ? { ...item, status: 1 } : item
          )
        );
      } else {
        message.error(`获取详情失败: ${response.msg}`);
      }
    } catch (error) {
      console.error('获取消息详情失败:', error);
      message.error('网络异常，获取详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 批量标记为已读
  const markAllAsRead = async () => {
    try {
      const unreadIds = messageList
        .filter(item => item.status === 0)
        .map(item => item.id);
      
      if (unreadIds.length === 0) {
        message.info('没有未读消息');
        return;
      }

      // 调用批量标记已读接口
      const response = await request('/api/message/mark-read', {
        method: 'POST',
        data: { ids: unreadIds }
      });

      if (response.code === 200) {
        message.success('已标记所有未读消息为已读');
        // 更新本地状态
        setMessageList(prevList => 
          prevList.map(item => ({ ...item, status: 1 }))
        );
      } else {
        message.error(`标记失败: ${response.msg}`);
      }
    } catch (error) {
      console.error('标记已读失败:', error);
      message.error('标记已读失败');
    }
  };

  // 组件挂载时加载数据
  useEffect(() => {
    fetchMessageList();
  }, [currentPage]);

  // 刷新数据
  const handleRefresh = () => {
    setCurrentPage(1);
    fetchMessageList();
  };

  // 分页变化处理
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 币种筛选变化
  const handleCoinChange = (value: string) => {
    setCoinFilter(value);
    setCurrentPage(1);
    setTimeout(() => fetchMessageList(), 0);
  };

  // 情感倾向筛选变化
  const handleSentimentChange = (value: string) => {
    setSentimentFilter(value);
    setCurrentPage(1);
    setTimeout(() => fetchMessageList(), 0);
  };

  // 状态筛选变化
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1);
    setTimeout(() => fetchMessageList(), 0);
  };

  // 搜索处理
  const handleSearch = (value: string) => {
    setSearchKeyword(value);
    setCurrentPage(1);
    setTimeout(() => fetchMessageList(), 0);
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

  // 渲染消息标题，包含未读红点
  const renderTitleWithBadge = (title: string, status: 0 | 1) => {
    if (status === 0) {
      return (
        <Badge dot color="red" offset={[-5, 5]}>
          <span style={{ fontWeight: 'bold' }}>{title}</span>
        </Badge>
      );
    }
    return <span>{title}</span>;
  };

  // 计算未读消息数量
  const unreadCount = messageList.filter(item => item.status === 0).length;

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
      width: 300,
      ellipsis: true,
      render: (text: string, record: MessageItem) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {renderTitleWithBadge(text, record.status)}
        </div>
      )
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
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      width: 80,
      render: (status: 0 | 1) => (
        status === 0 ? (
          <Badge status="error" text="未读" />
        ) : (
          <Badge status="success" text="已读" />
        )
      )
    },
    { 
      title: '发布时间', 
      dataIndex: 'publish_time',
      key: 'publish_time',
      width: 180
    },
    {
      title: '操作',
      key: 'actions',
      width: 100,
      render: (_: any, record: MessageItem) => (
        <Button type="link" onClick={() => handleViewDetail(record.id)}>
          查看详情
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 20 }}>
      {/* 筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择币种"
              value={coinFilter}
              onChange={handleCoinChange}
              options={[
                { value: 'all', label: '全部币种' },
                { value: 'BTC', label: '比特币(BTC)' },
                { value: 'ETH', label: '以太坊(ETH)' },
                { value: 'BNB', label: '币安币(BNB)' },
                { value: 'SOL', label: 'Solana(SOL)' },
                { value: 'XRP', label: '瑞波币(XRP)' },
                { value: 'USDC', label: '美元(USDC)' },
                { value: '无', label: '无' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择情感倾向"
              value={sentimentFilter}
              onChange={handleSentimentChange}
              options={[
                { value: 'all', label: '全部倾向' },
                { value: '利好', label: '利好' },
                { value: '利空', label: '利空' },
                { value: '中性', label: '中性' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={4}>
            <Select
              style={{ width: '100%' }}
              placeholder="请选择状态"
              value={statusFilter}
              onChange={handleStatusChange}
              options={[
                { value: 'all', label: '全部状态' },
                { value: '0', label: '未读' },
                { value: '1', label: '已读' },
              ]}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={6}>
            <Input.Search
              placeholder="请输入关键词搜索"
              allowClear
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col xs={24} sm={12} md={6} lg={3}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
              block
            >
              刷新
            </Button>
          </Col>
 
        </Row>
      </Card>

      {/* 列表区域 */}
      <Card>
        <Spin spinning={loading}>
          <Table
            rowKey="id"
            dataSource={messageList}
            columns={columns}
            loading={loading}
            pagination={{
              current: currentPage,
              pageSize: pageSize,
              total: total,
              onChange: handlePageChange,
              showSizeChanger: false,
              showQuickJumper: true,
              showTotal: (total, range) => {
                const unread = messageList.filter(item => item.status === 0).length;
                return (
                  <span>
                    共 {total} 条记录，其中 <span style={{ color: '#ff4d4f' }}>{unread} 条未读</span>
                  </span>
                );
              },
            }}
            rowClassName={(record) => record.status === 0 ? 'unread-row' : ''}
            scroll={{ y: 400 }}
            bordered
            size="middle"
            style={{ width: '100%' }}
          />
        </Spin>
      </Card>

      {/* 详情弹窗 */}
      <Modal
        title="消息详情"
        open={detailVisible}
        onCancel={handleDetailClose}
        footer={null}
        width={800}
      >
        {detailLoading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin tip="加载中..." />
          </div>
        ) : currentDetail ? (
          <div>
            <p><strong>消息标题：</strong>{currentDetail.title}</p>
            <p><strong>涉及币种：</strong>{currentDetail.coin}</p>
            <p><strong>情感倾向：</strong>{sentimentTag(currentDetail.sentiment)}</p>
            <p><strong>消息来源：</strong>{currentDetail.source}</p>
            <p><strong>状态：</strong>
              {currentDetail.status === 0 ? (
                <Badge status="error" text="未读" />
              ) : (
                <Badge status="success" text="已读" />
              )}
            </p>
            <p><strong>发布时间：</strong>{currentDetail.publish_time}</p>
            <p><strong>消息内容：</strong></p>
            <div style={{ 
              maxHeight: 300, 
              overflowY: 'auto', 
              border: '1px solid #f0f0f0', 
              padding: 12,
              backgroundColor: '#fafafa',
              borderRadius: 4
            }}>
              {currentDetail.content}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* 添加CSS样式 */}
      <style>{`
        .unread-row {
          background-color: #fffafa;
        }
        .unread-row:hover {
          background-color: #fff0f0;
        }
        .ant-badge-dot {
          box-shadow: 0 0 0 1px #fff;
        }
      `}</style>
    </div>
  );
};

export default MessageList;