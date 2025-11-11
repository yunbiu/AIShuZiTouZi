import React, { useState, useRef, useEffect } from 'react';
import { useIntl, useAccess, useModel,history } from '@umijs/max';
import { Button, Card, Form, Input, Radio, Table, message, Modal, Statistic } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined, PrinterOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { listCheckOrder, delCheckOrder, getCheckOrder } from '@/services/yw/checkOrder';
import { getDictValueEnum } from '@/services/system/dict';
import { listByCheckOrderId } from '@/services/yw/checkOrderDetail';
import CheckOrderDetail from './CheckOrderDetail'; // 导入 CheckOrderDetail
import CheckOrderEdit from './edit'; // 导入编辑组件
import PrintComponent from './PrintComponent';
import dayjs from 'dayjs';

const CheckOrderList: React.FC = () => {
  const [wmsCheckStatus, setWmsCheckStatus] = useState<any[]>([]);
  const model = useModel('wms');
  model.getWarehouseList();
  const warehouseMap = model.warehouseMap;
  model.getAreaList();
  const areaMap = model.areaMap;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const checkOrderDetailRef = useRef<any>();

  const [loading, setLoading] = useState(false);
  const [checkOrderList, setCheckOrderList] = useState<API.Yw.CheckOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    checkOrderNo: undefined,
    checkOrderStatus: -2,
  });

  const [modalState, setModalState] = useState({
    detailVisible: false,
    editVisible: false,
    currentOrder: null as API.Yw.CheckOrder | null,
  });

  useEffect(() => {
    getDictValueEnum('wms_check_status').then((data) => {
      const statusArray = Object.values(data);
      setWmsCheckStatus(statusArray);
    });
  }, []);
  
  const getList = async () => {
    setLoading(true);
    try {
      const query = { ...queryParams };
      if (query.checkOrderStatus === -2) {
        query.checkOrderStatus = undefined;
      }
      // 处理新增的查询参数
      const { warehouseName, areaName } = form.getFieldsValue();
      if (warehouseName) {
        query.warehouseName = warehouseName;
      }
      if (areaName) {
        query.areaName = areaName;
      }
      const res = await listCheckOrder(query);
      setCheckOrderList(res.rows);
      setTotal(res.total);
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
      checkOrderNo: undefined,
      checkOrderStatus: -2,
    });
    handleQuery();
  };

  const handleAdd = () => {
    setModalState({
      detailVisible: false,
      editVisible: true,
      currentOrder: null,
    });
    // history.push(`/wms/order/check-edit`);
  };

  const handleDelete = async (row: API.Yw.CheckOrder) => {
    Modal.confirm({
      title: '确认删除',
      content: `确认删除盘库单【${row.checkOrderNo}】吗？`,
      onOk: async () => {
        setLoading(true);
        try {
          await delCheckOrder(row.id);
          message.success('删除成功');
          getList();
        } catch (e) {
          if (e === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>盘库单【{row.checkOrderNo}】已盘库完成，不能删除！</div>
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

  const handleUpdate = (row: API.Yw.CheckOrder) => {
    setModalState({
      detailVisible: false,
      editVisible: true,
      currentOrder: row,
    });
  };

  const handleGoDetail = (row: API.Yw.CheckOrder) => {
    setModalState({
      detailVisible: true,
      editVisible: false,
      currentOrder: row,
    });
    checkOrderDetailRef.current?.setCheckOrderId(row.id);
    checkOrderDetailRef.current?.handleQuery();
  };

  const [printModalVisible, setPrintModalVisible] = useState(false); // 新增状态用于控制打印模态框的显示

  const [printData, setPrintData] = useState<any>(null);


  // 打印处理函数
  const [printLoading, setPrintLoading] = useState(false);
  const handlePrint = async (row: API.Yw.CheckOrder) => {
    setPrintLoading(true);
    try {
      const [orderRes, detailsRes] = await Promise.all([
        getCheckOrder(row.id),
        listByCheckOrderId(row.id)
      ]);

      const tableData = detailsRes.data.map(detail => ({
        itemName: detail.itemSku?.item?.itemName || '-',
        skuName: detail.itemSku?.skuName || '-',
        areaName: areaMap.get(detail.areaId)?.areaName || '-',
        quantity: Number(detail.quantity).toFixed(0),
        profitAndLoss: Number(detail.checkQuantity - detail.quantity).toFixed(0),
        checkQuantity: Number(detail.checkQuantity).toFixed(0),
        batchNo: detail.batchNo || undefined,
        productionDate: detail.productionDate 
          ? dayjs(detail.productionDate).format('YYYY-MM-DD')
          : undefined,
        expirationDate: detail.expirationDate
          ? dayjs(detail.expirationDate).format('YYYY-MM-DD')
          : undefined
      }));

      setPrintData({
        checkOrderNo: orderRes.data.checkOrderNo,
        warehouseName: warehouseMap.get(orderRes.data.warehouseId)?.warehouseName || '-',
        areaName: areaMap.get(orderRes.data.areaId)?.areaName || '-',
        checkOrderStatus: getCheckOrderStatus(orderRes.data),
        checkOrderTotal: Number(orderRes.data.checkOrderTotal).toFixed(0),
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
      setPrintLoading(false);
    }
  };

  const getWarehouseName = (record) =>{
    return model.warehouseMap.get(record.warehouseId)?.warehouseName
  }
  const getCheckOrderStatus = (record) =>{
    return wmsCheckStatus.find(item => item.value == record.checkOrderStatus)?.label
  }
  const columns: ProColumns<API.Yw.CheckOrder>[] = [
    {
      title: '单号',
      dataIndex: 'checkOrderNo',
      align: 'left',
      width: 120, // 调整列宽
    },
    {
      title: '仓库/库区',
      align: 'left',
      width: 150, // 调整列宽
      render: (_, record) => (
        <div>
          <div>仓库：{getWarehouseName(record)}</div>
          {record.areaId && <div>库区：{areaMap.get(record.areaId)?.areaName}</div>}
        </div>
      ),
    },
    {
      title: '盘库状态',
      dataIndex: 'checkOrderStatus',
      align: 'center',
      width: 100, // 调整列宽
      render: (_, record) => (
        <span>
          {getCheckOrderStatus(record)}
        </span>
      ),
    },
    {
      title: '盈亏数',
      align: 'right',
      width: 80, // 调整列宽
      render: (_, record) => (
        <Statistic value={Number(record.checkOrderTotal)} precision={0} />
      ),
    },
    {
      title: '创建/操作',
      align: 'left',
      width: 120, // 调整列宽
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
      width: 150, // 调整列宽
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
      width: 120, // 调整列宽
    },
    {
      title: '操作',
      align: 'right',
      width: 120, // 调整列宽
      render: (_, record) => (
        <div>
          <div>
            <Button 
              type="link" 
              onClick={() => handleUpdate(record)} 
              disabled={[-1, 1].includes(record.checkOrderStatus)}
            >
              修改
            </Button>
            <Button type="link" onClick={() => handleGoDetail(record)}>
              查看
            </Button>
          </div>
          <div style={{ marginTop: 5 }}>
            <Button 
              type="link" 
              danger 
              onClick={() => handleDelete(record)} 
              disabled={record.checkOrderStatus === 1}
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

  useEffect(() => {
    getList();
  }, [queryParams.current, queryParams.pageSize,queryParams.checkOrderStatus]);

  return (
    <PageContainer>
      <Card>
        <Form form={form} layout="inline" labelAlign="left" style={{ display: 'flex', flexWrap: 'nowrap', gap: 16 }}>
          <Form.Item label="盘库状态" name="checkOrderStatus" initialValue={-2} style={{ marginBottom: 0, flex: 1 }}>
            <Radio.Group 
              onChange={(e) => {
                setQueryParams(prev => ({ ...prev, checkOrderStatus: e.target.value }));
                handleQuery();
              }}
              style={{ whiteSpace: 'nowrap' }}
            >
              <Radio.Button value={-2}>全部</Radio.Button>
              {wmsCheckStatus.map(item => (
                <Radio.Button key={item.value} value={item.value}>
                  {item.label}
                </Radio.Button>
              ))}
            </Radio.Group>
          </Form.Item>

          <Form.Item label="盘库单号" name="checkOrderNo" style={{ marginBottom: 0, flex: 1 }}>
            <Input
              placeholder="请输入盘库单号"
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
          <span style={{ fontSize: 'large' }}>盘库单</span>
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
          dataSource={checkOrderList}
          columns={columns}
          rowKey="id"
          pagination={{
            current: queryParams.pageNum,
            pageSize: queryParams.pageSize,
            total,
            onChange: (page, pageSize) => {
              setQueryParams(prev => ({ ...prev, pageNum: page, pageSize }));
            },
          }}
          size="small" // 设置表格大小为小，使行高更紧凑
        />
      </Card>

      {/* 新增和修改模态框 */}
      <Modal
        title={modalState.currentOrder ? "修改盘库单" : "新增盘库单"}
        open={modalState.editVisible}
        onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
        footer={null}
        width={'80%'}
        destroyOnClose
      >
        <CheckOrderEdit
          id={modalState.currentOrder?.id}
          onCancel={() => setModalState(prev => ({ ...prev, editVisible: false }))}
        />
      </Modal>

      {/* 添加 CheckOrderDetail 组件 */}
      <CheckOrderDetail
        ref={checkOrderDetailRef}
        open={modalState.detailVisible}
        checkOrderNo={modalState.currentOrder?.checkOrderNo || null}
        onCancel={() => setModalState(prev => ({ ...prev, detailVisible: false }))}
      />


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

export default CheckOrderList;