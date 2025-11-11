import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess, useModel, history } from '@umijs/max';
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
  Tag
} from 'antd';
import { 
  SearchOutlined, 
  PlusOutlined, 
  ReloadOutlined, 
  PrinterOutlined 
} from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { 
  listReceiptOrder, 
  delReceiptOrder, 
  getReceiptOrder 
} from '@/services/yw/receiptOrder';
import { listByReceiptOrderId } from '@/services/yw/receiptOrderDetail';
import { getDictValueEnum } from '@/services/system/dict';
import dayjs from 'dayjs';
import ReceiptOrderEdit from './edit';
import PrintComponent from './ReceiptPrintComponent';

const ReceiptOrderList: React.FC = () => {
  const [wmsReceiptStatus, setWmsReceiptStatus] = useState<any[]>([]);
  const [wmsReceiptType, setWmsReceiptType] = useState<any[]>([]);
  const model = useModel('wms');
  model.getWarehouseList();
  const warehouseMap = model.warehouseMap;
  model.getAreaList();
  const areaMap = model.areaMap;
  model.getMerchantList();
  const merchantMap = model.merchantMap;
  
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [receiptOrderList, setReceiptOrderList] = useState<API.Yw.ReceiptOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  
  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    receiptOrderNo: undefined,
    receiptOrderType: -1,
    merchantId: undefined,
    orderNo: undefined,
    payableAmount: undefined,
    receiptOrderStatus: -2,
  });

  // 在组件顶部添加导入

  
  // 在组件状态中添加modal控制
  const [modalState, setModalState] = useState({
    visible: false,
    currentOrder: null as API.Yw.ReceiptOrder | null,
  });
  
  useEffect(() => {
    Promise.all([
      getDictValueEnum('wms_receipt_status'),
      getDictValueEnum('wms_receipt_type')
    ]).then(([statusData, typeData]) => {
      setWmsReceiptStatus(Object.values(statusData));
      setWmsReceiptType(Object.values(typeData));
    });
    getList();
  }, [queryParams.pageNum, queryParams.pageSize]);
  useEffect(() => {
    getList();
  }, [queryParams.receiptOrderStatus]);
  const getList = async () => {
    setLoading(true);
    try {
      const query = { ...queryParams };
      if (query.receiptOrderStatus === -2) {
        query.receiptOrderStatus = undefined;
      }
      if (query.receiptOrderType === -1) {
        query.receiptOrderType = undefined;
      }
      
      const res = await listReceiptOrder(query);
      setReceiptOrderList(res.rows);
      setTotal(res.total);
      setExpandedRowKeys([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuery = () => {
    setQueryParams(prev => ({ ...prev, pageNum: 1 }));
    getList();
  };

  const resetQuery = () => {
    form.resetFields();
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      receiptOrderNo: undefined,
      receiptOrderType: -1,
      merchantId: undefined,
      orderNo: undefined,
      payableAmount: undefined,
      receiptOrderStatus: -2,
    });
  };

  const handleAdd = () => {
    setModalState({
      visible: true,
      currentOrder: null,
    });
  };

  const handleDelete = async (row: API.Yw.ReceiptOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除入库单【${row.receiptOrderNo}】吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          await delReceiptOrder(row.id);
          message.success('删除成功');
          getList();
        } catch (e) {
          if (e === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>入库单【{row.receiptOrderNo}】已入库，不能删除！</div>
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

  const handleUpdate = (row: API.Yw.ReceiptOrder) => {
    setModalState({
      visible: true,
      currentOrder: row,
    });
  };

  const handleGoDetail = (row: API.Yw.ReceiptOrder) => {
    const index = expandedRowKeys.indexOf(row.id);
    if (index !== -1) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== row.id));
    } else {
      setExpandedRowKeys([...expandedRowKeys, row.id]);
      loadReceiptOrderDetail(row);
    }
  };

  const loadReceiptOrderDetail = async (row: API.Yw.ReceiptOrder) => {
    setDetailLoading(prev => ({ ...prev, [row.id]: true }));
    try {
      const res = await listByReceiptOrderId(row.id);
      if (res.data?.length) {
        const details = res.data.map(it => ({
          ...it,
          warehouseName: warehouseMap.get(it.warehouseId)?.warehouseName,
          areaName: areaMap.get(it.areaId)?.areaName
        }));
        
        setReceiptOrderList(prev => 
          prev.map(item => 
            item.id === row.id ? { ...item, details } : item
          )
        );
      }
    } finally {
      setDetailLoading(prev => ({ ...prev, [row.id]: false }));
    }
  };

  const [printData, setPrintData] = useState<any>(null);

  const handlePrint = async (row: API.Yw.ReceiptOrder) => {
    setLoading(true);
    try {
      const [orderRes, detailsRes] = await Promise.all([
        getReceiptOrder(row.id),
        listByReceiptOrderId(row.id)
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
        receiptOrderNo: orderRes.data.receiptOrderNo,
        receiptOrderType: wmsReceiptType.find(item => item.value == orderRes.data.receiptOrderType)?.label,
        receiptOrderStatus: wmsReceiptStatus.find(item => item.value == orderRes.data.receiptOrderStatus)?.label,
        merchantName: merchantMap.get(orderRes.data.merchantId)?.merchantName || '-',
        orderNo: orderRes.data.orderNo || '-',
        warehouseName: warehouseMap.get(orderRes.data.warehouseId)?.warehouseName || '-',
        areaName: areaMap.get(orderRes.data.areaId)?.areaName || '-',
        totalQuantity: Number(orderRes.data.totalQuantity).toFixed(0),
        payableAmount: orderRes.data.payableAmount ? `${orderRes.data.payableAmount}元` : '',
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

  const columns: ProColumns<API.Yw.ReceiptOrder>[] = [
    {
      title: '单号/订单号',
      align: 'left',
      width: 150,
      render: (_, record) => (
        <div>
          <div>单号：{record.receiptOrderNo}</div>
          {record.orderNo && <div>订单号：{record.orderNo}</div>}
        </div>
      ),
    },
    {
      title: '入库类型',
      dataIndex: 'receiptOrderType',
      align: 'left',
      width: 100,
      render: (value, record) => (
        <Tag color={
            value == 0 ? 'blue' : 
            value == 1 ? 'green' : 'blue'
        }>
          {wmsReceiptType.find(item => item.value == value)?.label}
        </Tag>

      ),
    },
    {
      title: '供应商',
      align: 'left',
      width: 120,
      render: (_, record) => (
        <div>{merchantMap.get(record.merchantId)?.merchantName}</div>
      ),
    },
    {
      title: '仓库/库区',
      align: 'left',
      width: 150,
      render: (_, record) => (
        <div>
          <div>仓库：{warehouseMap.get(record.warehouseId)?.warehouseName}</div>
          {record.areaId && <div>库区：{areaMap.get(record.areaId)?.areaName}</div>}
        </div>
      ),
    },
    {
      title: '入库状态',
      dataIndex: 'receiptOrderStatus',
      align: 'center',
      width: 100,
      render: (value, record) => (
        <Tag color={
            value == 0 ? 'blue' : 
            value == 1 ? 'green' : 'red'
        }>
          {wmsReceiptStatus.find(item => item.value == value)?.label}
        </Tag>

      ),
 
    },
    {
      title: '数量/金额(元)',
      align: 'left',
      width: 120,
      render: (_, record) => (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>数量：</span>
            <Statistic value={Number(record.totalQuantity)} precision={0} />
          </div>
          {(record.payableAmount || record.payableAmount === 0) && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>金额：</span>
              <Statistic value={Number(record.payableAmount)} precision={2} />
            </div>
          )}
        </div>
      ),
    },
    {
      title: '创建/操作',
      align: 'left',
      width: 120,
      render: (_, record) => (
        <div>
          <div>创建：{record.createBy}</div>
          {record.updateBy && <div>操作：{record.updateBy}</div>}
        </div>
      ),
    },
    {
      title: '创建时间/操作时间',
      align: 'left',
      width: 150,
      render: (_, record) => (
        <div>
          <div>创建：{dayjs(record.createTime).format('MM-DD HH:mm')}</div>
          <div>操作：{dayjs(record.updateTime).format('MM-DD HH:mm')}</div>
        </div>
      ),
    },
    {
      title: '备注',
      dataIndex: 'remark',
      width: 120,
    },
    {
      title: '操作',
      align: 'right',
      width: 120,
      render: (_, record) => (
        <div>
          <div>
            <Popover
              content={`入库单【${record.receiptOrderNo}】已${record.receiptOrderStatus === 1 ? '入库' : '作废'}，无法修改！`}
              disabled={[-1, 1].includes(record.receiptOrderStatus)}
            >
              <Button 
                type="link" 
                onClick={() => handleUpdate(record)} 
                disabled={[-1, 1].includes(record.receiptOrderStatus)}
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
          </div>
          <div style={{ marginTop: 5 }}>
            <Popover
              content={`入库单【${record.receiptOrderNo}】已入库，无法删除！`}
              disabled={[-1, 0].includes(record.receiptOrderStatus)}
            >
              <Button 
                type="link" 
                danger 
                onClick={() => handleDelete(record)} 
                disabled={record.receiptOrderStatus === 1}
              >
                删除
              </Button>
            </Popover>
            <Button 
              type="link" 
              onClick={() => handlePrint(record)}
            >
              打印
            </Button>
          </div>
        </div>
      ),
    },
  ];

  return (
    <PageContainer>
      <Card>
        <Form form={form} layout="inline" labelAlign="left" style={{ display: 'flex', flexWrap: 'nowrap', gap: 16 }}>
          <Form.Item label="入库状态" name="receiptOrderStatus" initialValue={-2} style={{ marginBottom: 0, flex: 1 }}>
            <Radio.Group 
              onChange={(e) => {
                setQueryParams(prev => ({ ...prev, receiptOrderStatus: e.target.value }));
                handleQuery();
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Radio.Button value={-2}>全部</Radio.Button>
              {wmsReceiptStatus.map(item => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="入库类型" name="receiptOrderType" initialValue={-1} style={{ marginBottom: 0, flex: 1 }}>
            <Radio.Group 
              onChange={(e) => {
                setQueryParams(prev => ({ ...prev, receiptOrderType: e.target.value }));
                handleQuery();
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Radio.Button value={-1}>全部</Radio.Button>
              {wmsReceiptType.map(item => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="入库单号" name="receiptOrderNo" style={{ marginBottom: 0, flex: 1 }}>
            <Input
              placeholder="请输入入库单号"
              allowClear
              onPressEnter={handleQuery}
              style={{ minWidth: 180 }}
            />
          </Form.Item>

          <Form.Item label="订单号" name="orderNo" style={{ marginBottom: 0, flex: 1 }}>
            <Input
              placeholder="请输入订单号"
              allowClear
              onPressEnter={handleQuery}
              style={{ minWidth: 180 }}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetQuery} style={{ marginLeft: 8 }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card style={{ marginTop: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <span style={{ fontSize: 'large' }}>入库单</span>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAdd}
          >
            新增
          </Button>
        </div>

        <Table
          loading={loading}
          dataSource={receiptOrderList}
          columns={columns}
          rowKey="id"
          expandable={{
            expandedRowKeys,
            onExpand: (expanded, record) => {
              if (expanded) {
                handleGoDetail(record);
              } else {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
              }
            },
            expandedRowRender: (record) => (
              <div style={{ padding: '0 50px 20px 50px' }}>
                <h3>商品明细</h3>
                <Table
                  loading={detailLoading[record.id]}
                  dataSource={record.details || []}
                  rowKey="id"
                  pagination={{
                    current: queryParams.pageNum,
                    pageSize: queryParams.pageSize,
                    total,
                    onChange: (page, pageSize) => {
                      setQueryParams(prev => ({ ...prev, pageNum: page, pageSize }));
                    },
                  }}
                  size="small"
                  columns={[
                    {
                      title: '商品名称',
                      dataIndex: ['itemSku', 'item', 'itemName'],
                    },
                    {
                      title: '规格名称',
                      dataIndex: ['itemSku', 'skuName'],
                    },
                    {
                      title: '库区',
                      dataIndex: 'areaName',
                    },
                    {
                      title: '数量',
                      align: 'right',
                      render: (_, record) => (
                        <Statistic value={Number(record.quantity)} precision={0} />
                      ),
                    },
                    {
                      title: '价格(元)',
                      align: 'right',
                      render: (_, record) => (
                        <Statistic 
                          value={record.amount ? Number(record.amount) : 0} 
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
                      render: (_, record) => (
                        <div>
                          {record.productionDate 
                            ? dayjs(record.productionDate).format('YYYY-MM-DD')
                            : '-'}
                        </div>
                      ),
                    },
                    {
                      title: '过期日期',
                      render: (_, record) => (
                        <div>
                          {record.expirationDate 
                            ? dayjs(record.expirationDate).format('YYYY-MM-DD')
                            : '-'}
                        </div>
                      ),
                    }
                  ]}
                />
              </div>
            ),
          }}
        />

       
      </Card>
    {/* 新增和修改模态框 */}
      <Modal
          title={modalState.currentOrder ? "修改移库单" : "新增移库单"}
          open={modalState.visible}
          onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
          footer={null}
          width={'95%'}
          destroyOnClose
        >
        <ReceiptOrderEdit
          id={modalState.currentOrder?.id}
          onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
        />
      </Modal>
      <Modal
        open={!!printData}
        onCancel={() => setPrintData(null)}
        footer={null}
        width={800}
      >
      {printData && <PrintComponent data={printData} onClose={() => setPrintData(null)} visible={false}/>}
    </Modal>
    
    </PageContainer>
  );
};
  export default ReceiptOrderList;