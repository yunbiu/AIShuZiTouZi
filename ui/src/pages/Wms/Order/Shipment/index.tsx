import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  Radio, 
  Table, 
  message, 
  Modal, 
  Statistic,
  Popover,
  Tag,
  Space,
  Typography
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  ReloadOutlined,
  PrinterOutlined,
  DeleteOutlined,
  EditOutlined
} from '@ant-design/icons';
import { PageContainer } from '@ant-design/pro-components';
import { 
  listShipmentOrder, 
  delShipmentOrder, 
  getShipmentOrder 
} from '@/services/yw/shipmentOrder';
import { listByShipmentOrderId } from '@/services/yw/shipmentOrderDetail';
import { useModel, history } from '@umijs/max';
import { getDictValueEnum } from '@/services/system/dict';
import dayjs from 'dayjs';
import ShipmentOrderEdit from './edit';
import ShipmentPrintComponent from './ShipmentPrintComponent';

const { Text } = Typography;

const ShipmentOrderList: React.FC = () => {
  const { warehouseMap, areaMap, merchantMap } = useModel('wms');
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [shipmentOrderList, setShipmentOrderList] = useState<API.Yw.ShipmentOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  const [wmsShipmentStatus, setWmsShipmentStatus] = useState<any[]>([]);
  const [wmsShipmentType, setWmsShipmentType] = useState<any[]>([]);
  const [printData, setPrintData] = useState<any>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<API.Yw.ShipmentOrder | null>(null);

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    shipmentOrderNo: undefined,
    shipmentOrderType: -1,
    merchantId: undefined,
    orderNo: undefined,
    receivableAmount: undefined,
    shipmentOrderStatus: -2,
  });
   // 在组件状态中添加modal控制
   const [modalState, setModalState] = useState({
    visible: false,
    currentOrder: null as API.Yw.ReceiptOrder | null,
  });
  useEffect(() => {
    Promise.all([
      getDictValueEnum('wms_shipment_status'),
      getDictValueEnum('wms_shipment_type')
    ]).then(([statusData, typeData]) => {
      setWmsShipmentStatus(Object.values(statusData));
      setWmsShipmentType(Object.values(typeData));
    });
    getList();
  }, [queryParams.pageNum, queryParams.pageSize]);

  useEffect(() => {
    getList();
  }, [queryParams.shipmentOrderStatus]);

  const getList = async () => {
    setLoading(true);
    try {
      const query = { ...queryParams };
      if (query.shipmentOrderStatus === -2) {
        query.shipmentOrderStatus = undefined;
      }
      if (query.shipmentOrderType === -1) {
        query.shipmentOrderType = undefined;
      }
      
      const res = await listShipmentOrder(query);
      setShipmentOrderList(res.rows);
      setTotal(res.total);
      setExpandedRowKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = () => {
    setQueryParams(prev => ({ ...prev, pageNum: 1 }));
  };

  const resetQuery = () => {
    form.resetFields();
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      shipmentOrderNo: undefined,
      shipmentOrderType: -1,
      merchantId: undefined,
      orderNo: undefined,
      receivableAmount: undefined,
      shipmentOrderStatus: -2,
    });
  };

  const handleAdd = () => {
    setModalState({
        visible: true,
        currentOrder: null,
      });
  };

  const handleDelete = async (row: API.Yw.ShipmentOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除出库单【${row.shipmentOrderNo}】吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          await delShipmentOrder(row.id);
          message.success('删除成功');
          getList();
        } catch (e) {
          if (e === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>出库单【{row.shipmentOrderNo}】已出库，不能删除！</div>
                  <div>请联系管理员处理！</div>
                </div>
              ),
            });
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleUpdate = (row: API.Yw.ShipmentOrder) => {
    setCurrentOrder(row);
    setEditModalVisible(true);
  };

  const handleGoDetail = (row: API.Yw.ShipmentOrder) => {
    const index = expandedRowKeys.indexOf(row.id);
    if (index !== -1) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== row.id));
    } else {
      setExpandedRowKeys([...expandedRowKeys, row.id]);
      loadShipmentOrderDetail(row);
    }
  };

  const loadShipmentOrderDetail = async (row: API.Yw.ShipmentOrder) => {
    setDetailLoading(prev => ({ ...prev, [row.id]: true }));
    try {
      const res = await listByShipmentOrderId(row.id);
      if (res.data?.length) {
        const details = res.data.map(it => ({
          ...it,
          warehouseName: warehouseMap.get(it.warehouseId)?.warehouseName,
          areaName: areaMap.get(it.areaId)?.areaName
        }));
        
        setShipmentOrderList(prev => 
          prev.map(item => 
            item.id === row.id ? { ...item, details } : item
          )
        );
      }
    } finally {
      setDetailLoading(prev => ({ ...prev, [row.id]: false }));
    }
  };

  const handlePrint = async (row: API.Yw.ShipmentOrder) => {
    setLoading(true);
    try {
      const [orderRes, detailsRes] = await Promise.all([
        getShipmentOrder(row.id),
        listByShipmentOrderId(row.id)
      ]);

      const tableData = detailsRes.data.map(detail => ({
        itemName: detail.itemSku?.item?.itemName || '-',
        skuName: detail.itemSku?.skuName || '-',
        areaName: areaMap.get(detail.areaId)?.areaName || '-',
        quantity: Number(detail.quantity).toFixed(0),
        amount: detail.amount ? Number(detail.amount).toFixed(2) : '-',
        batchNo: detail.batchNo || '-',
        productionDate: detail.productionDate 
          ? dayjs(detail.productionDate).format('YYYY-MM-DD')
          : '-',
        expirationDate: detail.expirationDate
          ? dayjs(detail.expirationDate).format('YYYY-MM-DD')
          : '-'
      }));

      setPrintData({
        shipmentOrderNo: orderRes.data.shipmentOrderNo,
        shipmentOrderType: wmsShipmentType.find(item => item.value == orderRes.data.shipmentOrderType)?.label,
        shipmentOrderStatus: wmsShipmentStatus.find(item => item.value == orderRes.data.shipmentOrderStatus)?.label,
        merchantName: merchantMap.get(orderRes.data.merchantId)?.merchantName || '-',
        orderNo: orderRes.data.orderNo || '-',
        warehouseName: warehouseMap.get(orderRes.data.warehouseId)?.warehouseName || '-',
        areaName: areaMap.get(orderRes.data.areaId)?.areaName || '-',
        totalQuantity: Number(orderRes.data.totalQuantity).toFixed(0),
        receivableAmount: orderRes.data.receivableAmount ? `${orderRes.data.receivableAmount}元` : '',
        createBy: orderRes.data.createBy,
        createTime: dayjs(orderRes.data.createTime).format('MM-DD HH:mm'),
        updateBy: orderRes.data.updateBy,
        updateTime: orderRes.data.updateTime
          ? dayjs(orderRes.data.updateTime).format('MM-DD HH:mm')
          : '-',
        remark: orderRes.data.remark,
        table: tableData
      });
    } catch (error) {
      message.error('获取打印数据失败');
      console.error('Print error:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: '单号/订单号',
      dataIndex: 'shipmentOrderNo',
      render: (text: string, record: API.Yw.ShipmentOrder) => (
        <div>
          <div>单号：{text}</div>
          {record.orderNo && <div>订单号：{record.orderNo}</div>}
        </div>
      ),
    },
    {
      title: '出库类型',
      dataIndex: 'shipmentOrderType',
      render: (value: string) => (
        <Tag color="blue">
          {wmsShipmentType.find(item => item.value == value)?.label}
        </Tag>
      ),
    },
    {
      title: '客户',
      dataIndex: 'merchantId',
      render: (value: string) => (
        <div>{merchantMap.get(value)?.merchantName}</div>
      ),
    },
    {
      title: '仓库/库区',
      render: (record: API.Yw.ShipmentOrder) => (
        <div>
          <div>仓库：{warehouseMap.get(record.warehouseId)?.warehouseName}</div>
          {record.areaId && <div>库区：{areaMap.get(record.areaId)?.areaName}</div>}
        </div>
      ),
    },
    {
      title: '出库状态',
      dataIndex: 'shipmentOrderStatus',
      render: (value: string) => (
        <Tag 
          color={value === '1' ? 'success' : value == '-1' ? 'error' : 'processing'}
        >
          {wmsShipmentStatus.find(item => item.value == value)?.label}
        </Tag>
      ),
    },
    {
      title: '数量/金额(元)',
      render: (record: API.Yw.ShipmentOrder) => (
        <div>
          <Space>
            <Text>数量：</Text>
            <Statistic value={Number(record.totalQuantity)} precision={0} />
          </Space>
          {(record.receivableAmount || record.receivableAmount === 0) && (
            <Space>
              <Text>金额：</Text>
              <Statistic value={Number(record.receivableAmount)} precision={2} />
            </Space>
          )}
        </div>
      ),
    },
    {
      title: '创建/操作',
      render: (record: API.Yw.ShipmentOrder) => (
        <div>
          <div>创建：{record.createBy}</div>
          {record.updateBy && <div>操作：{record.updateBy}</div>}
        </div>
      ),
    },
    {
      title: '创建时间/操作时间',
      render: (record: API.Yw.ShipmentOrder) => (
        <div>
          <div>创建：{dayjs(record.createTime).format('MM-DD HH:mm')}</div>
          <div>操作：{record.updateTime ? dayjs(record.updateTime).format('MM-DD HH:mm') : '-'}</div>
        </div>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
    },
    {
      title: '操作',
      render: (record: API.Yw.ShipmentOrder) => (
        <Space direction="vertical">
          <Space>
            <Popover
              content={`出库单【${record.shipmentOrderNo}】已${record.shipmentOrderStatus == '1' ? '出库' : '作废'}，无法修改！`}
              trigger="hover"
              disabled={record.shipmentOrderStatus == '0'}
            >
              <Button 
                type="link" 
                icon={<EditOutlined />}
                onClick={() => handleUpdate(record)}
                disabled={[-1, 1].includes(record.shipmentOrderStatus)}
              >
                修改
              </Button>
            </Popover>
            <Button 
                type="link" 
                onClick={() => handleGoDetail(record)}
              >
                {expandedRowKeys.includes(record.id) ? '收起' : '查看'}
              </Button>
          </Space>
          <Space>
            <Popover
              content={`出库单【${record.shipmentOrderNo}】已出库，无法删除！`}
              trigger="hover"
              disabled={[-1, 0].includes(record.shipmentOrderStatus)}
            >
              <Button 
                type="link" 
                danger 
                icon={<DeleteOutlined />}
                onClick={() => handleDelete(record)}
                disabled={record.shipmentOrderStatus === 1}
              >
                删除
              </Button>
            </Popover>
            <Button 
              type="link" 
              icon={<PrinterOutlined />}
              onClick={() => handlePrint(record)}
            >
              打印
            </Button>
          </Space>
        </Space>
      ),
    },
  ];
 
  return (
    <PageContainer>
      <Card loading={loading}>
        <Card>
          <Form form={form} layout="inline">
            <Form.Item label="出库状态" name="shipmentOrderStatus">
              <Radio.Group 
                value={queryParams.shipmentOrderStatus}
                onChange={e => setQueryParams({...queryParams, shipmentOrderStatus: e.target.value})}
              >
                <Radio.Button value={-2}>全部</Radio.Button>
                {wmsShipmentStatus.map(item => (
                  <Radio.Button key={item.value} value={item.value}>
                    {item.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item label="出库类型" name="shipmentOrderType">
              <Radio.Group 
                value={queryParams.shipmentOrderType}
                onChange={e => setQueryParams({...queryParams, shipmentOrderType: e.target.value})}
              >
                <Radio.Button value={-1}>全部</Radio.Button>
                {wmsShipmentType.map(item => (
                  <Radio.Button key={item.value} value={item.value}>
                    {item.label}
                  </Radio.Button>
                ))}
              </Radio.Group>
            </Form.Item>
            <Form.Item label="出库单号" name="shipmentOrderNo">
              <Input 
                placeholder="请输入出库单号" 
                value={queryParams.shipmentOrderNo}
                onChange={e => setQueryParams({...queryParams, shipmentOrderNo: e.target.value})}
              />
            </Form.Item>
            <Form.Item label="订单号" name="orderNo">
              <Input 
                placeholder="请输入订单号" 
                value={queryParams.orderNo}
                onChange={e => setQueryParams({...queryParams, orderNo: e.target.value})}
              />
            </Form.Item>
            <Form.Item>
              <Button 
                type="primary" 
                icon={<SearchOutlined />} 
                onClick={handleQuery}
              >
                搜索
              </Button>
              <Button 
                icon={<ReloadOutlined />} 
                onClick={resetQuery}
                style={{ marginLeft: 8 }}
              >
                重置
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card style={{ marginTop: 20 }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            marginBottom: 16 
          }}>
            <Typography.Title level={4} style={{ margin: 0 }}>出库单</Typography.Title>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleAdd}
            >
              新增
            </Button>
          </div>

          <Table
            columns={columns}
            dataSource={shipmentOrderList}
            rowKey="id"
            bordered
            loading={loading}
            expandable={{
              expandedRowKeys,
              onExpand: (expanded, record) => {
                if (expanded) {
                  setExpandedRowKeys([...expandedRowKeys, record.id]);
                  loadShipmentOrderDetail(record);
                } else {
                  setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
                }
              },
              expandedRowRender: (record) => (
                <div style={{ padding: '0 50px 20px 50px' }}>
                  <Typography.Title level={5}>商品明细</Typography.Title>
                  <Table
                    dataSource={record.details}
                    loading={detailLoading[record.id]}
                    columns={[
                      {
                        title: '商品名称',
                        render: (_, row) => (
                          <div>{row?.itemSku?.item?.itemName}</div>
                        ),
                      },
                      {
                        title: '规格名称',
                        render: (_, row) => (
                          <div>{row?.itemSku?.skuName}</div>
                        ),
                      },
                      {
                        title: '库区',
                        dataIndex: 'areaName',
                      },
                      {
                        title: '数量',
                        align: 'right',
                        render: (_, row) => (
                          <Statistic value={Number(row.quantity)} precision={0} />
                        ),
                      },
                      {
                        title: '价格(元)',
                        align: 'right',
                        render: (_, row) => (
                          <Statistic 
                            value={row.amount ? Number(row.amount) : '-'} 
                            precision={2} 
                          />
                        ),
                      },
                      {
                        title: '批号',
                        dataIndex: 'batchNo',
                      },
                      {
                        title: '生产日期',
                        render: (_, row) => (
                          <div>
                            {row.productionDate ? dayjs(row.productionDate).format('YYYY-MM-DD') : '-'}
                          </div>
                        ),
                      },
                      {
                        title: '过期日期',
                        render: (_, row) => (
                          <div>
                            {row.expirationDate ? dayjs(row.expirationDate).format('YYYY-MM-DD') : '-'}
                          </div>
                        ),
                      },
                    ]}
                  />
                </div>
              ),
            }}
            pagination={{
              total,
              current: queryParams.pageNum,
              pageSize: queryParams.pageSize,
              onChange: (page, pageSize) => {
                setQueryParams({
                  ...queryParams,
                  pageNum: page,
                  pageSize,
                });
              },
              showSizeChanger: true,
              showTotal: (total) => `共 ${total} 条`,
            }}
          />
        </Card>
      </Card>

      <Modal
          title={modalState.currentOrder ? "修改移库单" : "新增移库单"}
          open={modalState.visible}
          onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
          footer={null}
          width={'95%'}
          destroyOnClose
        >
        <ShipmentOrderEdit
          id={modalState.currentOrder?.id}
          onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
        />
      </Modal>

      {/* 打印组件 直接弹出打印预览效果*/}
      {/* {printData && (
        <ShipmentPrintComponent
          data={printData}
          visible={!!printData}
          onClose={() => setPrintData(null)}
        />
      )} */}
       <Modal
            open={!!printData}
            onCancel={() => setPrintData(null)}
            footer={null}
            width={800}
        >
        {printData && <ShipmentPrintComponent data={printData} onClose={() => setPrintData(null)} visible={false}/>}
        </Modal>
    </PageContainer>
  );
};

export default ShipmentOrderList;