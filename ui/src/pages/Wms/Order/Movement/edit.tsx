import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess, useModel } from '@umijs/max';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Statistic, 
  Table, 
  message, 
  Modal, 
  Row, 
  Col,
  Switch,
  Popover
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { 
  addMovementOrder, 
  getMovementOrder, 
  updateMovementOrder, 
  movement 
} from '@/services/yw/movementOrder';
import { delMovementOrderDetail } from '@/services/yw/movementOrderDetail';
import { useLocation, history } from '@umijs/max';
import dayjs from 'dayjs';
import InventoryDetailSelect from '../../../components/InventoryDetailSelect';

const { TextArea } = Input;

interface MovementOrderEditProps {
  id?: string;
  onCancel: () => void;
}

const MovementOrderEdit: React.FC<MovementOrderEditProps> = ({ id, onCancel }) => {
  const { warehouseMap, areaMap, itemBrandMap } = useModel('wms');
  const [form] = Form.useForm<API.Yw.MovementOrder>();
  const formRef = useRef<ProFormInstance>();
  const inventorySelectRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(false); // For SN mode toggle
  const [inventorySelectShow, setInventorySelectShow] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadDetail(id);
    } else {
      // Generate movement order number
      const timestamp = new Date().getTime();
      form.setFieldsValue({
        movementOrderNo: `YK${timestamp}`,
        movementOrderStatus: 0,
        totalQuantity: 0,
        details: [],
      });
    }
  }, [id]);

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await getMovementOrder(id);
      const data = res.data;
      
      if (data.details?.length) {
        data.details = data.details.map(detail => ({
          ...detail,
          sourceAreaName: areaMap.get(detail.sourceAreaId)?.areaName,
          targetAreaName: areaMap.get(detail.targetAreaId)?.areaName,
          itemSku: {
            ...detail.itemSku,
            item: detail.itemSku.item
          },
          remainQuantity: detail.quantity // For editing existing orders
        }));
        
        setSelectedInventory(data.details.map(it => ({
          id: it.inventoryDetailId,
          areaId: it.sourceAreaId
        })));
      }
      
      form.setFieldsValue(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSourceWarehouse = (value: string) => {
    form.setFieldsValue({ 
      sourceAreaId: undefined,
      details: [] 
    });
    setSelectedInventory([]);
  };

  const handleChangeSourceArea = (value: string) => {
    form.setFieldsValue({ 
      details: form.getFieldValue('details').filter((it: API.Yw.MovementOrderDetail) => it.sourceAreaId === value)
    });
    setSelectedInventory(selectedInventory.filter(selected => selected.areaId === value));
  };

  const handleChangeTargetWarehouse = (value: string) => {
    form.setFieldsValue({ 
      targetAreaId: undefined,
      details: form.getFieldValue('details').map((it: API.Yw.MovementOrderDetail) => ({
        ...it,
        targetWarehouseId: value,
        targetAreaId: undefined
      }))
    });
  };

  const handleChangeTargetArea = (value: string) => {
    form.setFieldsValue({ 
      details: form.getFieldValue('details').map((it: API.Yw.MovementOrderDetail) => ({
        ...it,
        targetAreaId: value
      }))
    });
  };

  const handleChangeQuantity = () => {
    const details = form.getFieldValue('details') || [];
    let sum = 0;
    details.forEach((it: API.Yw.MovementOrderDetail) => {
      if (it.quantity) {
        sum += Number(it.quantity);
      }
    });
    form.setFieldsValue({ totalQuantity: sum });
  };

  const handleDeleteDetail = async (row: API.Yw.MovementOrderDetail, index: number) => {
    if (row.id) {
      Modal.confirm({
        title: '确认删除本条商品明细吗？',
        content: '如确认会立即执行！',
        onOk: async () => {
          await delMovementOrderDetail(row.id);
          const details = form.getFieldValue('details');
          details.splice(index, 1);
          form.setFieldsValue({ details });
          message.success('删除成功');
          handleChangeQuantity();
        },
      });
    } else {
      const details = form.getFieldValue('details');
      details.splice(index, 1);
      form.setFieldsValue({ details });
      setSelectedInventory(selectedInventory.filter(it => it.id !== row.inventoryDetailId));
      handleChangeQuantity();
    }
  };

  const showAddItem = () => {
    if (!form.getFieldValue('sourceWarehouseId') || !form.getFieldValue('targetWarehouseId')) {
      message.warning('请先选择源仓库和目标仓库！');
      return;
    }
    inventorySelectRef.current?.getList();
    setInventorySelectShow(true);
  };

  const handleOkClick = (items: any[]) => {
    setInventorySelectShow(false);
    setSelectedInventory([...items]);
    
    const currentDetails = form.getFieldValue('details') || [];
    const newDetails = items.filter(item => 
      !currentDetails.find((detail: API.Yw.MovementOrderDetail) => 
        detail.inventoryDetailId === item.id
      )
    ).map(item => ({
      itemSku: {
        ...item.itemSku,
        item: item.item
      },
      skuId: item.skuId,
      quantity: undefined,
      remainQuantity: item.remainQuantity,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expirationDate: item.expirationDate,
      sourceWarehouseId: form.getFieldValue('sourceWarehouseId'),
      sourceAreaId: form.getFieldValue('sourceAreaId') || item.areaId,
      inventoryDetailId: item.id,
      targetAreaId: form.getFieldValue('targetAreaId'),
      sourceAreaName: areaMap.get(form.getFieldValue('sourceAreaId') || item.areaId)?.areaName
    }));
    
    form.setFieldsValue({
      details: [...currentDetails, ...newDetails]
    });
  };

  const save = async (movementOrderStatus = 0) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      const details = (values.details || []).map((it: API.Yw.MovementOrderDetail) => ({
        id: it.id,
        movementOrderId: values.id,
        skuId: it.skuId,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        sourceWarehouseId: values.sourceWarehouseId,
        sourceAreaId: it.sourceAreaId,
        targetWarehouseId: values.targetWarehouseId,
        targetAreaId: it.targetAreaId
      }));

      const params = {
        ...values,
        movementOrderStatus,
        details,
      };

      if (values.id) {
        await updateMovementOrder(params);
      } else {
        await addMovementOrder(params);
      }
      
      message.success('操作成功');
      onCancel();
    } catch (error) {
      console.error('Save error:', error);
      message.error('请填写完整信息');
    }
  };

  const doMovement = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (!values.details?.length) {
        message.error('请选择商品');
        return;
      }

      const invalidQuantityList = values.details.filter((it: API.Yw.MovementOrderDetail) => !it.quantity);
      if (invalidQuantityList?.length) {
        message.error('请选择移库数量');
        return;
      }

      const details = (values.details || []).map((it: API.Yw.MovementOrderDetail) => ({
        id: it.id,
        movementOrderId: values.id,
        skuId: it.skuId,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        sourceWarehouseId: values.sourceWarehouseId,
        sourceAreaId: it.sourceAreaId,
        targetWarehouseId: values.targetWarehouseId,
        targetAreaId: it.targetAreaId
      }));

      const params = {
        ...values,
        details,
      };

      await movement(params);
      message.success('移库成功');
      onCancel();
    } catch (error) {
      console.error('Movement error:', error);
      message.error('操作失败');
    }
  };

  const updateToInvalid = async () => {
    Modal.confirm({
      title: '确认作废移库单吗？',
      onOk: () => save(-1),
    });
  };

  const goSaasTip = () => {
    Modal.info({
      title: '系统提示',
      content: '一物一码/SN模式请去Saas版本体验！',
    });
    return false;
  };

  const columns = [
    {
      title: '商品信息',
      dataIndex: ['itemSku', 'item', 'itemName'],
      render: (_: any, record: API.Yw.MovementOrderDetail) => (
        <div>
          <div>
            {record.itemSku?.item?.itemName}
            {record.itemSku?.item?.itemCode && `(${record.itemSku.item.itemCode})`}
          </div>
          {record.itemSku?.item?.itemBrand && (
            <div>品牌：{itemBrandMap.get(record.itemSku.item.itemBrand)?.brandName}</div>
          )}
        </div>
      ),
    },
    {
      title: '规格信息',
      render: (_: any, record: API.Yw.MovementOrderDetail) => (
        <div>
          <div>{record.itemSku?.skuName}</div>
          {record.itemSku?.barcode && <div>条码：{record.itemSku.barcode}</div>}
        </div>
      ),
    },
    {
      title: '源库区',
      dataIndex: 'sourceAreaName',
    },
    {
      title: '目标库区',
      render: (_: any, record: API.Yw.MovementOrderDetail) => (
        <Select
          value={record.targetAreaId}
          onChange={(value) => {
            const details = form.getFieldValue('details');
            const index = details.findIndex((d: API.Yw.MovementOrderDetail) => d.inventoryDetailId === record.inventoryDetailId);
            if (index !== -1) {
              details[index].targetAreaId = value;
              details[index].targetAreaName = areaMap.get(value)?.areaName;
              form.setFieldsValue({ details });
            }
          }}
          disabled={!!form.getFieldValue('targetAreaId')}
          style={{ width: '100%' }}
        >
          {Array.from(areaMap.values())
            .filter(it => it.warehouseId === form.getFieldValue('targetWarehouseId'))
            .map(item => (
              <Select.Option key={item.id} value={item.id}>
                {item.areaName}
              </Select.Option>
            ))}
        </Select>
      ),
    },
    {
      title: '批号',
      dataIndex: 'batchNo',
    },
    {
      title: '生产日期',
      dataIndex: 'productionDate',
      render: (value: string) => value ? value.substring(0, 10) : '-',
    },
    {
      title: '过期日期',
      dataIndex: 'expirationDate',
      render: (value: string) => value ? value.substring(0, 10) : '-',
    },
    {
      title: '剩余库存',
      render: (_: any, record: API.Yw.MovementOrderDetail) => (
        <Statistic value={Number(record.remainQuantity)} precision={0} />
      ),
    },
    {
      title: '移库数量',
      render: (_: any, record: API.Yw.MovementOrderDetail) => (
        <InputNumber
          value={record.quantity}
          onChange={(value) => {
            const details = form.getFieldValue('details');
            const index = details.findIndex((d: API.Yw.MovementOrderDetail) => d.inventoryDetailId === record.inventoryDetailId);
            if (index !== -1) {
              details[index].quantity = value;
              form.setFieldsValue({ details });
              handleChangeQuantity();
            }
          }}
          min={1}
          max={record.remainQuantity}
          precision={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, record: API.Yw.MovementOrderDetail, index: number) => (
        <Button
          icon={<DeleteOutlined />}
          type="link"
          danger
          onClick={() => handleDeleteDetail(record, index)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <PageContainer>
      <div className="app-container" style={{ marginBottom: 60 }}>
        <Card title="移库单基本信息" loading={loading}>
          <Form
            form={form}
            layout="horizontal"
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item 
                  label="移库单号" 
                  name="movementOrderNo"
                  rules={[{ required: true, message: '移库单号不能为空' }]}
                >
                  <Input disabled={!!id} />
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item 
                  label="源仓库" 
                  name="sourceWarehouseId"
                  rules={[{ required: true, message: '请选择源仓库' }]}
                >
                  <Select
                    placeholder="请选择源仓库"
                    onChange={handleChangeSourceWarehouse}
                  >
                    {Array.from(warehouseMap.values()).map(item => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.warehouseName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item 
                  label="源库区" 
                  name="sourceAreaId"
                >
                  <Select
                    placeholder="请选择源库区"
                    disabled={!form.getFieldValue('sourceWarehouseId')}
                    onChange={handleChangeSourceArea}
                    allowClear
                  >
                    {Array.from(areaMap.values())
                      .filter(it => it.warehouseId === form.getFieldValue('sourceWarehouseId'))
                      .map(item => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.areaName}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={8}>
                <Form.Item 
                  label="目标仓库" 
                  name="targetWarehouseId"
                  rules={[{ required: true, message: '请选择目标仓库' }]}
                >
                  <Select
                    placeholder="请选择目标仓库"
                    onChange={handleChangeTargetWarehouse}
                  >
                    {Array.from(warehouseMap.values()).map(item => (
                      <Select.Option key={item.id} value={item.id}>
                        {item.warehouseName}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              
              <Col span={8}>
                <Form.Item 
                  label="目标库区" 
                  name="targetAreaId"
                >
                  <Select
                    placeholder="请选择目标库区"
                    disabled={!form.getFieldValue('targetWarehouseId')}
                    onChange={handleChangeTargetArea}
                    allowClear
                  >
                    {Array.from(areaMap.values())
                      .filter(it => it.warehouseId === form.getFieldValue('targetWarehouseId'))
                      .map(item => (
                        <Select.Option key={item.id} value={item.id}>
                          {item.areaName}
                        </Select.Option>
                      ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item 
                  label="数量" 
                  name="totalQuantity"
                  labelCol={{ span: 6 }}
                  wrapperCol={{ span: 18 }}
                >
                  <InputNumber 
                    disabled 
                    precision={0}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              </Col>
            </Row>
            
 
            
            <Row gutter={24}>
              <Col span={24}>
                <Form.Item 
                  label="备注" 
                  name="remark"
                  labelCol={{ span: 2 }}
                  wrapperCol={{ span: 22 }}
                >
                  <TextArea
                    placeholder="备注...100个字符以内"
                    maxLength={100}
                    rows={4}
                    showCount
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card title="商品明细" className="mt10" loading={loading}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span>一物一码/SN模式：</span>
              <Switch
                checkedChildren="开启"
                unCheckedChildren="关闭"
                checked={mode}
                onChange={() => {
                  Modal.info({
                    title: '系统提示',
                    content: '一物一码/SN模式请去Saas版本体验！',
                  });
                }}
                style={{ margin: '0 8px' }}
              />
            </div>
            
            <Popover
              placement="left"
              title="提示"
              content="请先选择源仓库和目标仓库！"
              open={!form.getFieldValue('sourceWarehouseId') || !form.getFieldValue('targetWarehouseId') ? undefined : false}
            >
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showAddItem}
                disabled={!form.getFieldValue('sourceWarehouseId') || !form.getFieldValue('targetWarehouseId')}
              >
                添加商品
              </Button>
            </Popover>
          </div>
          
          <Table
            columns={columns}
            dataSource={form.getFieldValue('details') || []}
            rowKey="inventoryDetailId"
            pagination={false}
            scroll={{ x: 'max-content' }}
          />
        </Card>
        
        <InventoryDetailSelect
          ref={inventorySelectRef}
          open={inventorySelectShow}
          onOk={handleOkClick}
          onCancel={() => setInventorySelectShow(false)}
          width="90%"
          selectWarehouseDisable={false}
          selectAreaDisable={!!form.getFieldValue('sourceAreaId')}
          warehouseId={form.getFieldValue('sourceWarehouseId')}
          areaId={form.getFieldValue('sourceAreaId')}
          selectedInventory={selectedInventory}
        />
      </div>
      
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        width: '100%', 
        padding: '16px', 
        background: '#fff', 
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <div>
          <Button 
            type="primary" 
            onClick={doMovement}
            style={{ marginRight: 8 }}
          >
            完成移库
          </Button>
          {id && (
            <Button 
              danger 
              onClick={updateToInvalid}
            >
              作废
            </Button>
          )}
        </div>
        <div>
          <Button 
            type="primary" 
            onClick={() => save(0)}
            style={{ marginRight: 8 }}
          >
            暂存
          </Button>
          <Button onClick={onCancel}>
            取消
          </Button>
        </div>
      </div>
    </PageContainer>
  );
};

export default MovementOrderEdit;