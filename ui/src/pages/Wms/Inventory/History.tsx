import React, { useState, useEffect, useRef } from 'react';
import { useIntl, FormattedMessage, useAccess } from '@umijs/max';
import { Card, Col, Row, Space, Button, Input, Radio, DatePicker, Table, Statistic, message } from 'antd';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { listInventoryHistory } from '@/services/yw/inventoryHistory';
import { getDictValueEnum } from '@/services/system/dict'; // 新增导入
import WarehouseCascader from './components/WarehouseCascader';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Search } = Input;

/**
 * 库存记录页面
 */
const InventoryHistory: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [loading, setLoading] = useState<boolean>(false);
  const [inventoryHistoryList, setInventoryHistoryList] = useState<API.Yw.InventoryHistory[]>([]);
  const [total, setTotal] = useState<number>(0);
  const actionRef = useRef<any>();
  
  const [queryParams, setQueryParams] = useState<API.Yw.InventoryHistoryListParams>({
    pageSize: 10,
    current: 1,
    orderType: -1,
  });

  const [wms_inventory_history_type, setWmsInventoryHistoryType] = useState<any[]>([]); // 新增状态

  // 新增 useEffect 来获取字典值枚举
  useEffect(() => {
    getDictValueEnum('wms_inventory_history_type').then((data) => {
      setWmsInventoryHistoryType(data);
    });
  }, []);
  
  /** 查询库存记录列表 */
  const getList = async () => {
    try {
      setLoading(true);
      const params = { ...queryParams };
      
      if (params.orderType === -1) {
        params.orderType = undefined;
      }
      
      if (params.place?.length) {
        params.warehouseId = params.place[0];
        params.areaId = params.place[1];
      }
      
      const res = await listInventoryHistory(params);
      setInventoryHistoryList(res.rows);
      setTotal(res.total);
    } catch (error) {
      messageApi.error('获取库存记录失败');
    } finally {
      setLoading(false);
    }
  };

  /** 搜索按钮操作 */
  const handleQuery = () => {
    setQueryParams(prev => ({ ...prev, current: 1 }));
    getList(); 
  };
  useEffect(() => {
     getList();                 
  }, [queryParams.orderType]);
  /** 重置按钮操作 */
  const resetQuery = () => {
    setQueryParams({
      pageSize: 10,
      current: 1,
      orderType: -1,
    });
    handleQuery();
  };

  useEffect(() => {
    getList();
  }, [queryParams.current, queryParams.pageSize]);

  const columns: ProColumns<API.Yw.InventoryHistory>[] = [
    {
      title: '操作单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
    },
    {
      title: '商品信息',
      key: 'itemInfo',
      render: (_, record) => {
        return (
          <div>
            <div>{record.item.itemName}</div>
            {record.item.itemCode && <div>商品编号：{record.item.itemCode}</div>}
          </div>
        );
        
      },
    },
    {
      title: '规格信息',
      key: 'skuInfo',
      render: (_, record) => (
        <div>
          <div>{record.itemSku.skuName}</div>
          {record.itemSku.skuCode && <div>规格编号：{record.itemSku.skuCode}</div>}
        </div>
      ),
    },
    {
      title: '操作类型',
      key: 'orderType',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <span>
          {/* 修改此处，通过键来获取对应的值 */}
          {wms_inventory_history_type?.[record.orderType]?.label}
        </span>
      ),
    },
    {
      title: '仓库/库区',
      key: 'warehouseInfo',
      render: (_, record) => (
        <div>
          <div>仓库：{record.warehouseName}</div>
          <div>库区：{record.areaName}</div>
        </div>
      ),
    },
    {
      title: '数量/价格(元)',
      key: 'quantityAmount',
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>数量：</div>
            <Statistic value={Number(record.quantity)} precision={0} />
          </div>
          {(record.amount || record.amount === 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>价格：</div>
              <Statistic value={Number(record.amount)} precision={2} />
            </div>
          )}
        </div>
      ),
    },
    {
      title: '批号',
      dataIndex: 'batchNo',
      key: 'batchNo',
    },
    {
      title: '生产日期/过期日期',
      key: 'dateInfo',
      render: (_, record) => (
        <div>
          {record.productionDate && (
            <div>生产日期：{dayjs(record.productionDate).format('YYYY-MM-DD')}</div>
          )}
          {record.expirationDate && (
            <div>过期日期：{dayjs(record.expirationDate).format('YYYY-MM-DD')}</div>
          )}
        </div>
      ),
    },
    {
      title: '操作时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  return (
    <PageContainer>
      {contextHolder}
      <Card>
        <Row gutter={16}>
          <Col span={24}>
            <Space size="middle" direction="vertical" style={{ width: '100%' }}>
              <div>
                <span style={{ marginRight: 8 }}>操作类型:</span>
                <Radio.Group
                  value={queryParams.orderType}
                  onChange={(e) => {
                    setQueryParams(prev => ({ ...prev, orderType: e.target.value }));
                  }}
                >
                  <Radio.Button key="-1" value={-1}>全部</Radio.Button>
                  {/* 将对象转换为数组后使用 map 方法 */}
                  {Object.values(wms_inventory_history_type)?.map((item) => (
                    <Radio.Button key={item.value} value={item.value}>
                      {item.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </div>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Search
                    placeholder="请输入操作单号"
                    value={queryParams.orderNo}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, orderNo: e.target.value }))}
                    onSearch={handleQuery}
                  />
                </Col>
                <Col span={6}>
                  <WarehouseCascader
                    value={queryParams.place}
                    onChange={(value) => setQueryParams(prev => ({ ...prev, place: value }))}
                  />
                </Col>
                <Col span={6}>
                  <Search
                    placeholder="请输入商品名称"
                    value={queryParams.itemName}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, itemName: e.target.value }))}
                    onSearch={handleQuery}
                  />
                </Col>
                <Col span={6}>
                  <Search
                    placeholder="请输入商品编号"
                    value={queryParams.itemCode}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, itemCode: e.target.value }))}
                    onSearch={handleQuery}
                  />
                </Col>
              </Row>
              
              <Row gutter={16}>
                <Col span={6}>
                  <Search
                    placeholder="请输入规格名称"
                    value={queryParams.skuName}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, skuName: e.target.value }))}
                    onSearch={handleQuery}
                  />
                </Col>
                <Col span={6}>
                  <Search
                    placeholder="请输入规格编号"
                    value={queryParams.skuCode}
                    onChange={(e) => setQueryParams(prev => ({ ...prev, skuCode: e.target.value }))}
                    onSearch={handleQuery}
                  />
                </Col>
                <Col span={8}>
                  <RangePicker
                    showTime
                    style={{ width: '100%' }}
                    value={queryParams.createTimeRange}
                    onChange={(dates) => setQueryParams(prev => ({
                      ...prev,
                      createTimeRange: dates,
                      startTime: dates?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
                      endTime: dates?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
                    }))}
                  />
                </Col>
                <Col span={4}>
                  <Space>
                    <Button type="primary" onClick={handleQuery}>
                      搜索
                    </Button>
                    <Button onClick={resetQuery}>
                      重置
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Space>
          </Col>
        </Row>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16, fontSize: 'large' }}>库存记录</div>
        <ProTable
          loading={loading}
          columns={columns}
          dataSource={inventoryHistoryList}
          rowKey="id"
          pagination={{
            total,
            current: queryParams.current,
            pageSize: queryParams.pageSize,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({
                ...prev,
                current: page,
                pageSize,
              }));
            },
          }}
          options={false}
          search={false}
        />
      </Card>
    </PageContainer>
  );
};

export default InventoryHistory;