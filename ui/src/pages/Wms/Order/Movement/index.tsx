import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess, useModel, history } from '@umijs/max';
import { Button, Card, Form, Input, Radio, Table, message, Modal, Statistic, Tag, Select} from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ProColumns } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { listMovementOrder, delMovementOrder, getMovementOrder } from '@/services/yw/movementOrder';
import { listByMovementOrderId } from '@/services/yw/movementOrderDetail';
import { getDictValueEnum } from '@/services/system/dict';
import dayjs from 'dayjs';
import MovementOrderEdit from './edit';
import PrintComponent from './PrintComponent';

const MovementOrderList: React.FC = () => {
  const [wmsMovementStatus, setWmsMovementStatus] = useState<any[]>([]);
  const model = useModel('wms');
  model.getWarehouseList();
  const warehouseMap = model.warehouseMap;
  model.getAreaList();
  const areaMap = model.areaMap;
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [movementOrderList, setMovementOrderList] = useState<API.Yw.MovementOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([]);
  const [detailLoading, setDetailLoading] = useState<Record<string, boolean>>({});
  const [modalState, setModalState] = useState({
    editVisible: false,
    currentOrder: null as API.Yw.MovementOrder | null,
  });

  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    movementOrderNo: undefined,
    movementOrderStatus: -2,
    sourceWarehouseId: undefined,
    sourceAreaId: undefined,
    targetWarehouseId: undefined,
    targetAreaId: undefined,
  });

  useEffect(() => {
    getDictValueEnum('wms_movement_status').then((data) => {
      const statusArray = Object.values(data);
      setWmsMovementStatus(statusArray);
    });
    getList();
  }, [queryParams.pageNum, queryParams.pageSize, queryParams.movementOrderStatus]);

  const getList = async () => {
    setLoading(true);
    try {
      const query = { ...queryParams };
      if (query.movementOrderStatus === -2) {
        delete query.movementOrderStatus;
      }
      
      const res = await listMovementOrder(query);
      setMovementOrderList(res.rows);
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
      movementOrderNo: undefined,
      movementOrderStatus: -2,
      sourceWarehouseId: undefined,
      sourceAreaId: undefined,
      targetWarehouseId: undefined,
      targetAreaId: undefined,
    });
  };

  const handleAdd = () => {
    setModalState({
      editVisible: true,
      currentOrder: null,
    });
  };

  const handleDelete = async (row: API.Yw.MovementOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除移库单【${row.movementOrderNo}】吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          await delMovementOrder(row.id);
          message.success('删除成功');
          getList();
        } catch (e) {
          if (e === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>移库单【{row.movementOrderNo}】已移库，不能删除！</div>
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

  const handleUpdate = (row: API.Yw.MovementOrder) => {
    setModalState({
      editVisible: true,
      currentOrder: row,
    });
  };

  const handleGoDetail = (row: API.Yw.MovementOrder) => {
    const index = expandedRowKeys.indexOf(row.id);
    if (index !== -1) {
      setExpandedRowKeys(expandedRowKeys.filter(key => key !== row.id));
    } else {
      setExpandedRowKeys([...expandedRowKeys, row.id]);
      loadMovementOrderDetail(row);
    }
  };

  const loadMovementOrderDetail = async (row: API.Yw.MovementOrder) => {
    setDetailLoading(prev => ({ ...prev, [row.id]: true }));
    try {
      const res = await listByMovementOrderId(row.id);
      if (res.data?.length) {
        const details = res.data.map(it => ({
          ...it,
          sourceWarehouseName: warehouseMap.get(it.sourceWarehouseId)?.warehouseName,
          sourceAreaName: areaMap.get(it.sourceAreaId)?.areaName,
          targetWarehouseName: warehouseMap.get(it.targetWarehouseId)?.warehouseName,
          targetAreaName: areaMap.get(it.targetAreaId)?.areaName,
        }));
        
        setMovementOrderList(prev => 
          prev.map(item => 
            item.id === row.id ? { ...item, details } : item
          )
        );
      }
    } finally {
      setDetailLoading(prev => ({ ...prev, [row.id]: false }));
    }
  };

  const getWmsMovementStatus= (record) =>{
    return wmsMovementStatus.find(item => item.value == record.movementOrderStatus)?.label
  }
  const [printData, setPrintData] = useState<any>(null);

  // 修改handlePrint函数
  const handlePrint = async (row: API.Yw.MovementOrder) => {
    setLoading(true);
    try {
      const [orderRes, detailsRes] = await Promise.all([
        getMovementOrder(row.id),
        listByMovementOrderId(row.id)
      ]);
      const tableData = detailsRes.data.map(detail => ({
        itemName: detail.itemSku?.item?.itemName || '-',
        skuName: detail.itemSku?.skuName || '-',
        sourceAreaName: areaMap.get(detail.sourceAreaId)?.areaName || '-',
        targetAreaName: areaMap.get(detail.targetAreaId)?.areaName || '-',
        quantity: Number(detail.quantity).toFixed(0),
        batchNo: detail.batchNo || undefined,
        productionDate: detail.productionDate 
          ? dayjs(detail.productionDate).format('YYYY-MM-DD')
          : undefined,
        expirationDate: detail.expirationDate
          ? dayjs(detail.expirationDate).format('YYYY-MM-DD')
          : undefined
      }));

      setPrintData({
        movementOrderNo: orderRes.data.movementOrderNo,
        sourceWarehouseName: warehouseMap.get(orderRes.data.sourceWarehouseId)?.warehouseName || '-',
        sourceAreaName: areaMap.get(orderRes.data.sourceAreaId)?.areaName || '-',
        targetWarehouseName: warehouseMap.get(orderRes.data.targetWarehouseId)?.warehouseName || '-',
        targetAreaName: areaMap.get(orderRes.data.targetAreaId)?.areaName || '-',
        movementOrderStatus: wmsMovementStatus.find(item => item.value == orderRes.data.movementOrderStatus)?.label,
        totalQuantity: Number(orderRes.data.totalQuantity).toFixed(0),
        createBy: orderRes.data.createBy,
        createTime: dayjs(orderRes.data.createTime).format('YYYY-MM-DD HH:mm'),
        updateBy: orderRes.data.updateBy,
        updateTime: orderRes.data.updateTime
          ? dayjs(orderRes.data.updateTime).format('YYYY-MM-DD HH:mm')
          : undefined,
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

  const columns: ProColumns<API.Yw.MovementOrder>[] = [
    {
      title: '单号',
      dataIndex: 'movementOrderNo',
      align: 'left',
      width: 120,
    },
    {
      title: '源仓库/源库区',
      align: 'left',
      width: 260,
      render: (_, record) => (
        <div>
          <div>源仓库：{warehouseMap.get(record.sourceWarehouseId)?.warehouseName}</div>
          {record.sourceAreaId && <div>源库区：{areaMap.get(record.sourceAreaId)?.areaName}</div>}
        </div>
      ),
    },
    {
      title: '目标仓库/目标库区',
      align: 'left',
      width: 260,
      render: (_, record) => (
        <div>
          <div>目标仓库：{warehouseMap.get(record.targetWarehouseId)?.warehouseName}</div>
          {record.targetAreaId && <div>目标库区：{areaMap.get(record.targetAreaId)?.areaName}</div>}
        </div>
      ),
    },
    {
      title: '移库状态',
      dataIndex: 'movementOrderStatus',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Tag color={
          record.movementOrderStatus == 0 ? 'blue' : 
          record.movementOrderStatus == 1 ? 'green' : 'red'
        }>
         {getWmsMovementStatus(record)}
        </Tag>
      ),
    },
    {
      title: '数量',
      align: 'left',
      render: (_, record) => (
        <div className="flex-space-between">
          <span>数量：</span>
          <Statistic value={Number(record.totalQuantity)} precision={0} />
        </div>
      ),
    },
    {
      title: '创建/操作',
      align: 'left',
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
      width: 200,
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
    },
    {
      title: '操作',
      align: 'center',
      width: 160,
      render: (_, record) => (
        <div>
          <div>
            <Button 
              type="link" 
              onClick={() => handleUpdate(record)} 
              disabled={[-1, 1].includes(record.movementOrderStatus)}
            >
              修改
            </Button>
            <Button type="link" onClick={() => handleGoDetail(record)}>
              {expandedRowKeys.includes(record.id) ? '收起' : '查看'}
            </Button>
          </div>
          <div style={{ marginTop: 5 }}>
            <Button 
              type="link" 
              danger 
              onClick={() => handleDelete(record)} 
              disabled={record.movementOrderStatus === 1}
            >
              删除
            </Button>
            <Button type="link" onClick={() => handlePrint(record)}>
              打印
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const expandedRowRender = (record: API.Yw.MovementOrder) => {
    if (detailLoading[record.id]) {
      return <div style={{ textAlign: 'center', padding: '20px' }}>加载中...</div>;
    }

    return (
      <div style={{ padding: '0 50px 20px 50px' }}>
        <h3>商品明细</h3>
        <Table 
          dataSource={record.details || []} 
          loading={detailLoading[record.id]}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: '商品名称',
              dataIndex: ['itemSku', 'item', 'itemName'],
              render: (_, row) => row?.itemSku?.item?.itemName,
            },
            {
              title: '规格名称',
              dataIndex: ['itemSku', 'skuName'],
              render: (_, row) => row?.itemSku?.skuName,
            },
            {
              title: '源库区',
              dataIndex: 'sourceAreaName',
            },
            {
              title: '目标库区',
              dataIndex: 'targetAreaName',
            },
            {
              title: '数量',
              dataIndex: 'quantity',
              align: 'right',
              render: (value) => <Statistic value={Number(value)} precision={0} />,
            },
            {
              title: '批号',
              dataIndex: 'batchNo',
            },
            {
              title: '生产日期',
              dataIndex: 'productionDate',
              render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-',
            },
            {
              title: '过期日期',
              dataIndex: 'expirationDate',
              render: (value) => value ? dayjs(value).format('YYYY-MM-DD') : '-',
            },
          ]}
        />
      </div>
    );
  };

  return (
    <PageContainer>
      <Card>
        <Form form={form} layout="inline" labelAlign="left" style={{ display: 'flex', flexWrap: 'nowrap', gap: 16 }}>
          <Form.Item label="移库状态" name="movementOrderStatus" initialValue={-2} style={{ marginBottom: 0, flex: 1 }}>
            <Radio.Group 
              onChange={(e) => {
                setQueryParams(prev => ({ ...prev, movementOrderStatus: e.target.value }));
                handleQuery();
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Radio.Button value={-2}>全部</Radio.Button>
              {wmsMovementStatus.map(item => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="移库单号" name="movementOrderNo" style={{ marginBottom: 0, flex: 1 }}>
            <Input
              placeholder="请输入移库单号"
              allowClear
              onPressEnter={handleQuery}
              style={{ minWidth: 180 }}
              value={queryParams.movementOrderNo}
              onChange={(e) => setQueryParams(prev => ({ ...prev, movementOrderNo: e.target.value }))}
            />
          </Form.Item>

          <Form.Item label="源仓库库区" name="sourcePlace" style={{ marginBottom: 0, flex: 1 }}>
            <Select
              placeholder="请选择源仓库库区"
              style={{ width: '100%' }}
              onChange={(value) => {
                const [warehouseId, areaId] = value?.split('_') || [];
                setQueryParams(prev => ({ 
                  ...prev, 
                  sourceWarehouseId: warehouseId,
                  sourceAreaId: areaId
                }));
              }}
            >
              {Array.from(warehouseMap.values()).map(warehouse => (
                <Select.OptGroup key={warehouse.id} label={warehouse.warehouseName}>
                  {Array.from(areaMap.values())
                    .filter(area => area.warehouseId === warehouse.id)
                    .map(area => (
                      <Select.Option 
                        key={`${warehouse.id}_${area.id}`} 
                        value={`${warehouse.id}_${area.id}`}
                      >
                        {area.areaName}
                      </Select.Option>
                    ))}
                </Select.OptGroup>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="目标仓库库区" name="targetPlace" style={{ marginBottom: 0, flex: 1 }}>
            <Select
              placeholder="请选择目标仓库库区"
              style={{ width: '100%' }}
              onChange={(value) => {
                const [warehouseId, areaId] = value?.split('_') || [];
                setQueryParams(prev => ({ 
                  ...prev, 
                  targetWarehouseId: warehouseId,
                  targetAreaId: areaId
                }));
              }}
            >
              {Array.from(warehouseMap.values()).map(warehouse => (
                <Select.OptGroup key={warehouse.id} label={warehouse.warehouseName}>
                  {Array.from(areaMap.values())
                    .filter(area => area.warehouseId === warehouse.id)
                    .map(area => (
                      <Select.Option 
                        key={`${warehouse.id}_${area.id}`} 
                        value={`${warehouse.id}_${area.id}`}
                      >
                        {area.areaName}
                      </Select.Option>
                    ))}
                </Select.OptGroup>
              ))}
            </Select>
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
          <span style={{ fontSize: 'large' }}>移库单</span>
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
          dataSource={movementOrderList}
          columns={columns}
          rowKey="id"
          expandable={{
            expandedRowRender,
            expandedRowKeys,
            onExpand: (expanded, record) => {
              const index = expandedRowKeys.indexOf(record.id);
              if (index !== -1) {
                setExpandedRowKeys(expandedRowKeys.filter(key => key !== record.id));
              } else {
                setExpandedRowKeys([...expandedRowKeys, record.id]);
                if (!record.details) {
                  loadMovementOrderDetail(record);
                }
              }
            },
          }}
          pagination={{
            current: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            total,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({ ...prev, pageNum: page, pageSize }));
            },
          }}
          size="small"
        />
      </Card>

      {/* 新增和修改模态框 */}
      <Modal
        title={modalState.currentOrder ? "修改移库单" : "新增移库单"}
        open={modalState.editVisible}
        onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
        footer={null}
        width={'80%'}
        destroyOnClose
      >
        <MovementOrderEdit
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

export default MovementOrderList;