import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess } from '@umijs/max';
import { Button, Card, Form, Radio, Select, Input, Table, Statistic, Checkbox, message } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { SearchOutlined, RedoOutlined } from '@ant-design/icons';
import { listInventoryBoard } from '@/services/yw/inventory';
import { listAreaNoPage } from '@/services/yw/area';
import { listWarehouseNoPage } from '@/services/yw/warehouse';
import { useModel } from '@umijs/max';

const { Option } = Select;

const InventoryStatistic: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inventoryList, setInventoryList] = useState<any[]>([]);
  const [warehouseList, setWarehouseList] = useState<API.Yw.Warehouse[]>([]);
  const [areaList, setAreaList] = useState<API.Yw.Area[]>([]);
  const [total, setTotal] = useState(0);
  const [queryType, setQueryType] = useState<'warehouse' | 'area' | 'item'>('warehouse');
  const [filterZero, setFilterZero] = useState(false);
  const [mergedCells, setMergedCells] = useState<Record<string, number>>({});
  const { initialState } = useModel('@@initialState');
  const wmsStore = initialState?.wmsStore;

  const queryParams = useRef({
    pageNum: 1,
    pageSize: 10,
    skuId: undefined,
    warehouseId: undefined,
    areaId: undefined,
    itemName: undefined,
    itemCode: undefined,
    skuName: undefined,
    skuCode: undefined,
    minQuantity: undefined
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
    if (filterZero) {
      params.minQuantity = 1;
    } else {
      params.minQuantity = undefined;
    }

    setLoading(true);
    try {
      console.log('getList queryType:', queryType);
      const res = await listInventoryBoard(params, queryType);
      
      // Process data for merged cells
      const processedData = res.rows.map(item => {
        
        if (queryType === 'warehouse') {
          return {
            ...item,
            warehouseIdAndItemId: `${item.warehouseId}-${item.itemSku.itemId}`
          };
        } else if (queryType === 'area') {
          return {
            ...item,
            areaIdAndItemId: `${item.areaId}-${item.itemSku.itemId}`
          };
        } else {
          return {
            ...item,
            itemId: item.itemSku.itemId,
            skuIdAndWarehouseId: `${item.skuId}-${item.warehouseId}`
          };
        }
      });
      console.log('processedData:', processedData);
      setInventoryList(processedData);
      setTotal(res.total);
      calculateMergedCells(processedData);
    } catch (error) {
      message.error('获取库存数据失败');
    } finally {
      setLoading(false);
    }
  };

  const calculateMergedCells = (data: any[]) => {
    const mergeMap: Record<string, number> = {};
    
    if (queryType === 'warehouse') {
      // Calculate merged cells for warehouse view
      let prevWarehouse = '';
      let count = 1;
      
      data.forEach((item, index) => {
        if (item.warehouseId === prevWarehouse) {
          count++;
        } else {
          if (index > 0) {
            mergeMap[`${index - count}-0`] = count;
          }
          prevWarehouse = item.warehouseId;
          count = 1;
        }
      });
      
      // Add the last group
      if (data.length > 0) {
        mergeMap[`${data.length - count}-0`] = count;
      }
    } 
    // Similar logic can be added for other query types
    
    setMergedCells(mergeMap);
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
      skuId: undefined,
      warehouseId: undefined,
      areaId: undefined,
      itemName: undefined,
      itemCode: undefined,
      skuName: undefined,
      skuCode: undefined,
      minQuantity: undefined
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

  const handleFilterZeroChange = (e: any) => {
    setFilterZero(e.target.checked);
    queryParams.current.pageNum = 1;
    getList();
  };

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
    console.log('warehouse:', warehouse);
    console.log('warehouseName:',  warehouse?.warehouseName || '');
    return warehouse?.warehouseName || '';
  };

  const getAreaName = (id: string) => {
    console.log('getAreaName id:', id);
    const area = areaList.find(a => a.id === id) || wmsStore?.areaMap.get(id);
    console.log('area:', area);
    console.log((area?.areaName || ''));
    return area?.areaName || '';
  };

  const columns = queryType === 'warehouse' || queryType === 'area' 
    ? [
        {
          title: '仓库',
          dataIndex: 'warehouseId',
          render: (id: string) => <div>{getWarehouseName(id)}</div>,
          onCell: (record: any, rowIndex: number) => {
            return {
              rowSpan: mergedCells[`${rowIndex}-0`] || 0
            };
          }
        },
        // 当查询类型为 'area' 时，增加 '库区' 列
        ...(queryType === 'area' ? [{
          title: '库区',
          dataIndex: 'areaId',
          // 检查渲染逻辑
          render: (id: string, record: any) => {
            const areaName = getAreaName(id);
            return <div>{areaName}</div>;
          }
        }] : []),
        {
          title: '商品信息',
          dataIndex: queryType === 'warehouse' ? 'warehouseIdAndItemId' : 'areaIdAndItemId',
          render: (_: any, record: any) => {
            console.log('商品信息 queryType:', queryType);
            return <div>
              <div>{record.item.itemName}</div>
              {record.item.itemCode && <div>商品编号：{record.item.itemCode}</div>}
            </div>
            }
          
        },
        {
          title: '规格信息',
          dataIndex: 'skuId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.itemSku.skuName}</div>
              {record.itemSku.skuCode && <div>规格编号：{record.itemSku.skuCode}</div>}
            </div>
          )
        },
        {
          title: '库存',
          dataIndex: 'quantity',
          align: 'right',
          render: (value: number) => (
            <Statistic value={value} precision={0} valueStyle={{ fontSize: '14px' }} />
          )
        }
      ]
    : [
        {
          title: '商品信息',
          dataIndex: 'itemId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.item.itemName}</div>
              {record.item.itemCode && <div>商品编号：{record.item.itemCode}</div>}
            </div>
          )
        },
        {
          title: '规格信息',
          dataIndex: 'skuId',
          render: (_: any, record: any) => (
            <div>
              <div>{record.itemSku.skuName}</div>
              {record.itemSku.skuCode && <div>规格编号：{record.itemSku.skuCode}</div>}
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
          dataIndex: 'areaName',
          render: (_: any, record: any) => <div>{getAreaName(record.areaId)}</div>
        },
        {
          title: '库存',
          dataIndex: 'quantity',
          align: 'right',
          render: (value: number) => (
            <Statistic value={value} precision={0} valueStyle={{ fontSize: '14px' }} />
          )
        }
      ];
      console.log('columns:', columns);
  return (
    <PageContainer>
      <Card>
        <Form
          form={form}
          // 修改为内联布局
          layout="inline" 
          onValuesChange={(changedValues) => {
            Object.entries(changedValues).forEach(([key, value]) => {
              queryParams.current[key] = value;
            });
          }}
        >
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="维度" name="queryType" initialValue={queryType}>
                <Radio.Group onChange={handleQueryTypeChange}>
                  <Radio.Button value="warehouse">仓库</Radio.Button>
                  <Radio.Button value="area">库区</Radio.Button>
                  <Radio.Button value="item">商品</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="仓库" name="warehouseId">
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择仓库"
                  onChange={handleWarehouseChange}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {warehouseList.map(item => (
                    <Option key={item.id} value={item.id} label={item.warehouseName}>
                      {item.warehouseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="库区" name="areaId">
                <Select
                  style={{ width: '100%' }}
                  placeholder="请选择库区"
                  disabled={!queryParams.current.warehouseId || queryType === 'item'}
                  allowClear
                  showSearch
                  optionFilterProp="label"
                >
                  {areaList
                    .filter(item => item.warehouseId === queryParams.current.warehouseId)
                    .map(item => (
                      <Option key={item.id} value={item.id} label={item.areaName}>
                        {item.areaName}
                      </Option>
                    ))}
                </Select>
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="商品名称" name="itemName">
                <Input placeholder="商品名称" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="商品编号" name="itemCode">
                <Input placeholder="商品编号" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="规格名称" name="skuName">
                <Input placeholder="规格名称" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
              <Form.Item label="规格编号" name="skuCode">
                <Input placeholder="规格编号" allowClear />
              </Form.Item>
            </div>
            <div style={{ width: 'calc(100% / 3)', padding: '8px' }}>
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
          <div style={{ fontSize: 'large' }}>库存统计</div>
          <Checkbox checked={filterZero} onChange={handleFilterZeroChange}>
            过滤掉库存为0的商品
          </Checkbox>
        </div>
        <Table
          dataSource={inventoryList}
          columns={columns}
          rowKey={(record) => `${record.skuId}-${record.warehouseId}-${record.areaId || ''}`}
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

export default InventoryStatistic;