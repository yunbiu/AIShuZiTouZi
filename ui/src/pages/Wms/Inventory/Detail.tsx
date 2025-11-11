import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess } from '@umijs/max';
import { Button, Card, Form, Radio, Select, Input, Table, Statistic, DatePicker, Checkbox, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { SearchOutlined, RedoOutlined } from '@ant-design/icons';
import { listInventoryDetail } from '@/services/yw/inventoryDetail';
import { listAreaNoPage } from '@/services/yw/area';
import { listWarehouseNoPage } from '@/services/yw/warehouse';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const InventoryDetail: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inventoryDetailList, setInventoryDetailList] = useState<API.Yw.InventoryDetail[]>([]);
  const [total, setTotal] = useState(0);
  const [queryType, setQueryType] = useState<'warehouse' | 'item'>('warehouse');
  const [warehouseList, setWarehouseList] = useState<API.Yw.Warehouse[]>([]);
  const [areaList, setAreaList] = useState<API.Yw.Area[]>([]);
  const { initialState } = useModel('@@initialState');
  const wmsStore = initialState?.wmsStore;

  const queryParams = useRef({
    pageNum: 1,
    pageSize: 10,
    itemName: '',
    itemCode: '',
    skuName: '',
    skuCode: '',
    areaId: undefined,
    warehouseId: undefined,
    batchNo: '',
    daysToExpires: undefined,
    createTimeRange: undefined,
  });

  useEffect(() => {
    fetchWarehouses();
    fetchAreas();
    getList();
  }, []);
  const fetchWarehouses = async () => {
    try {
      const res = await listWarehouseNoPage();
      console.log('warehouseList:', res);
      setWarehouseList(res.data);
    } catch (error) {
      message.error('获取仓库列表失败');
    }
  };

  const fetchAreas = async () => {
    try {
      const res = await listAreaNoPage();
      console.log('area:', res);
      setAreaList(res.data);
    } catch (error) {
      message.error('获取库区列表失败');
    }
  };
  const getList = async () => {
    const params = { ...queryParams.current };
    if (params.createTimeRange) {
      params.createStartTime = params.createTimeRange[0];
      params.createEndTime = params.createTimeRange[1];
    }

    setLoading(true);
    try {
      const res = await listInventoryDetail(params);
      
      const processedData = res.rows.map(item => {
        if (queryType === 'warehouse') {
          return {
            ...item,
            areaIdAndItemId: `${item.areaId}-${item.item?.id}`,
            areaIdAndSkuId: `${item.areaId}-${item.itemSku?.id}`
          };
        } else {
          return {
            ...item,
            itemId: item.item?.id,
            skuIdAndWarehouseId: `${item.itemSku?.id}-${item.warehouseId}`,
            skuIdAndAreaId: `${item.itemSku?.id}-${item.areaId}`
          };
        }
      });

      setInventoryDetailList(processedData);
      setTotal(res.total);
    } catch (error) {
      message.error('获取库存明细数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = () => {
    queryParams.current.pageNum = 1;
    getList();
  };

  const handleReset = () => {
    form.resetFields();
    queryParams.current = {
      pageNum: 1,
      pageSize: 10,
      itemName: '',
      itemCode: '',
      skuName: '',
      skuCode: '',
      areaId: undefined,
      warehouseId: undefined,
      batchNo: '',
      daysToExpires: undefined,
      createTimeRange: undefined,
    };
    handleQuery();
  };

  const handleQueryTypeChange = (e: any) => {
    setQueryType(e.target.value);
    queryParams.current.areaId = undefined;
    form.setFieldsValue({ areaId: undefined });
    queryParams.current.pageNum = 1;
  };
  useEffect(() => {
    getList();
  }, [queryType]);

  const handleWarehouseChange = (value: string) => {
    queryParams.current.warehouseId = value;
    queryParams.current.areaId = undefined;
    form.setFieldsValue({ areaId: undefined });
  };

  const handleTableChange = (pagination: any) => {
    queryParams.current.pageNum = pagination.current;
    queryParams.current.pageSize = pagination.pageSize;
    getList();
  };
  const getWarehouseName = (id: string) => {
    const warehouse = warehouseList.find(w => w.id === id) || wmsStore?.warehouseMap.get(id);
    return warehouse?.warehouseName || '';
  };

  const getAreaName = (id: string) => {
    const area = areaList.find(a => a.id === id) || wmsStore?.areaMap.get(id);
    return area?.areaName || '';
  };


  const formatDate = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD');
  };

  const formatDateTime = (date: string) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm');
  };

  const columns = queryType === 'warehouse'
    ? [
        {
          title: '仓库',
          dataIndex: 'warehouseId',
          render: (id: number) => <div>{getWarehouseName(id)}</div>
        },
        {
          title: '库区',
          dataIndex: 'areaId',
          render: (id: number) => <div>{getAreaName(id)}</div>
        },
        {
          title: '商品信息',
          dataIndex: 'areaIdAndItemId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.item?.itemName}</div>
              {record.item?.itemCode && <div>商品编号：{record.item.itemCode}</div>}
            </div>
          )
        },
        {
          title: '规格信息',
          dataIndex: 'areaIdAndSkuId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.itemSku?.skuName}</div>
              {record.itemSku?.skuCode && <div>规格编号：{record.itemSku.skuCode}</div>}
            </div>
          )
        },
        {
          title: '入库日期',
          dataIndex: 'createTime',
          render: (date: string) => <div>{formatDateTime(date)}</div>
        },
        {
          title: '库存',
          dataIndex: 'quantity',
          align: 'right',
          render: (value: number) => (
            <Statistic value={value} precision={0} valueStyle={{ fontSize: '14px' }} />
          )
        },
        {
          title: '批号',
          dataIndex: 'batchNo'
        },
        {
          title: '生产日期/过期日期',
          render: (_: any, record: any) => (
            <div>
              {record.productionDate && <div>生产日期：{formatDate(record.productionDate)}</div>}
              {record.expirationDate && <div>过期日期：{formatDate(record.expirationDate)}</div>}
            </div>
          )
        }
      ]
    : [
        {
          title: '商品信息',
          dataIndex: 'itemId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.item?.itemName}</div>
              {record.item?.itemCode && <div>商品编号：{record.item.itemCode}</div>}
            </div>
          )
        },
        {
          title: '规格信息',
          dataIndex: 'skuId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.itemSku?.skuName}</div>
              {record.itemSku?.skuCode && <div>规格编号：{record.itemSku.skuCode}</div>}
            </div>
          )
        },
        {
          title: '仓库',
          dataIndex: 'skuIdAndWarehouseId',
          render: (_: any, record: any) => <div>{getWarehouseName(record.warehouseId)}</div>
        },
        {
          title: '所属库区',
          dataIndex: 'skuIdAndAreaId',
          render: (_: any, record: any) => <div>{getAreaName(record.areaId)}</div>
        },
        {
          title: '入库日期',
          dataIndex: 'createTime',
          render: (date: string) => <div>{formatDateTime(date)}</div>
        },
        {
          title: '库存',
          dataIndex: 'quantity',
          align: 'right',
          render: (value: number) => (
            <Statistic value={value} precision={0} valueStyle={{ fontSize: '14px' }} />
          )
        },
        {
          title: '批号',
          dataIndex: 'batchNo'
        },
        {
          title: '生产日期/过期日期',
          render: (_: any, record: any) => (
            <div>
              {record.productionDate && <div>生产日期：{formatDate(record.productionDate)}</div>}
              {record.expirationDate && <div>过期日期：{formatDate(record.expirationDate)}</div>}
            </div>
          )
        }
      ];

  return (
    <PageContainer>
      <Card>
        <Form
          form={form}
          layout="inline"
          onValuesChange={(changedValues) => {
            Object.entries(changedValues).forEach(([key, value]) => {
              queryParams.current[key] = value;
            });
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="维度" name="queryType" initialValue={queryType}>
                <Radio.Group onChange={handleQueryTypeChange}>
                  <Radio.Button value="warehouse">仓库库区</Radio.Button>
                  <Radio.Button value="item">商品</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="仓库" name="warehouseId">
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择仓库"
                  onChange={handleWarehouseChange}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {wmsStore?.warehouseList.map(item => (
                    <Option key={item.id} value={item.id} label={item.warehouseName}>
                      {item.warehouseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="库区" name="areaId">
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择库区"
                  disabled={!queryParams.current.warehouseId || queryType === 'item'}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {wmsStore?.areaList
                    .filter(item => item.warehouseId === queryParams.current.warehouseId)
                    .map(item => (
                      <Option key={item.id} value={item.id} label={item.areaName}>
                        {item.areaName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="商品名称" name="itemName">
                <Input placeholder="商品名称" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="商品编号" name="itemCode">
                <Input placeholder="商品编号" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="规格名称" name="skuName">
                <Input placeholder="规格名称" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="规格编号" name="skuCode">
                <Input placeholder="规格编号" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="批号" name="batchNo">
                <Input placeholder="批号" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="过期" name="daysToExpires">
                <Select style={{ width: '100%' }} allowClear>
                  <Option value={30}>30天内</Option>
                  <Option value={60}>60天内</Option>
                  <Option value={90}>90天内</Option>
                  <Option value={120}>120天内</Option>
                  <Option value={180}>180天内</Option>
                  <Option value={365}>365天内</Option>
                </Select>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px' }}>
              <Form.Item label="入库日期" name="createTimeRange">
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                  placeholder={['开始日期', '结束日期']}
                />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 4)', padding: '8px', marginLeft: '32px' }}>
              <Form.Item>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
                  搜索
                </Button>
                <Button icon={<RedoOutlined />} onClick={handleReset} style={{ marginLeft: 8 }}>
                  重置
                </Button>
              </Form.Item>
            </div>
          </div>
        </Form>
      </Card>
      <Card style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ fontSize: 'large' }}>库存明细</div>
        </div>
        <Table
          dataSource={inventoryDetailList}
          columns={columns}
          rowKey={(record) => `${record.id}`}
          loading={loading}
          bordered
          pagination={{
            current: queryParams.current.pageNum,
            pageSize: queryParams.current.pageSize,
            total,
            showSizeChanger: true,
            onChange: handleTableChange
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </PageContainer>
  );
};

export default InventoryDetail;