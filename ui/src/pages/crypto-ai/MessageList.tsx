import React, { useState, useEffect } from 'react';
import { Card, Table, Select, Input, Button, Row, Col, Tag, Modal, Spin, message } from 'antd';
import { ReloadOutlined, SearchOutlined } from '@ant-design/icons';
// 删除原来的axios导入，改用项目提供的request
import { request } from '@umijs/max';

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

      // 使用项目提供的request方法，并通过代理路径/api/message/list访问
      const response = await request<MessageListResponse>('/api/message/list', { 
        method: 'GET',
        params
      });
      
      if (response.code === 200) {
        setMessageList(response.data.records);
        setTotal(response.data.total);
        setCurrentPage(response.data.current);
        message.success('数据加载成功');
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
      // 使用项目提供的request方法，并通过代理路径/api/message访问
      const response = await request<MessageDetailResponse>(`/api/message/${id}`, {
        method: 'GET'
      });
      
      if (response.code === 200) {
        setCurrentDetail(response.data);
        setDetailVisible(true);
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
          <Col span={5}>
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
              ]}
            />
          </Col>
          <Col span={5}>
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
          <Col span={6}>
            <Input.Search
              placeholder="请输入关键词搜索"
              allowClear
              onSearch={handleSearch}
              enterButton={<SearchOutlined />}
            />
          </Col>
          <Col span={4}>
            <Button 
              type="primary" 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              刷新数据
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
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ y: 400 }} // 垂直滚动
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
            <p><strong>发布时间：</strong>{currentDetail.publishTime}</p>
            <p><strong>更新时间：</strong>{currentDetail.updateTime}</p>
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
    </div>
  );
};

export default MessageList;