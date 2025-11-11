import React, { useState, useEffect, useRef } from 'react';
import { useModel, history } from '@umijs/max';
import { 
  Button, 
  Card, 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Radio, 
  Table, 
  message, 
  Modal, 
  Statistic,
  Switch,
  Popover,
  Row,
  Col
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { 
  addShipmentOrder, 
  getShipmentOrder, 
  updateShipmentOrder, 
  shipment 
} from '@/services/yw/shipmentOrder';
import { delShipmentOrderDetail } from '@/services/yw/shipmentOrderDetail';
import InventoryDetailSelect from '../../../components/InventoryDetailSelect';
import { numSub, generateNo } from '@/utils/ruoyiUtils';

const { TextArea } = Input;

interface ShipmentOrderEditProps {
  id?: string;
  onCancel: () => void;
}

const ShipmentOrderEdit: React.FC<ShipmentOrderEditProps> = ({ id, onCancel }) => {
  const { warehouseList, areaList, merchantList, itemBrandMap } = useModel('wms');
  const [form] = Form.useForm<API.Yw.ShipmentOrder>();
  const formRef = useRef<ProFormInstance>();
  const inventorySelectRef = useRef<any>();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(false); // For SN mode toggle
  const [inventorySelectShow, setInventorySelectShow] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState<any[]>([]);
  const [wmsShipmentType, setWmsShipmentType] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      loadDetail(id);
    } else {
      // Generate shipment order number
      form.setFieldsValue({
        shipmentOrderNo: `CK${generateNo()}`,
        shipmentOrderType: "2",
        shipmentOrderStatus: 0,
        totalQuantity: 0,
        details: [],
      });
    }
  }, [id]);

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await getShipmentOrder(id);
      const data = res.data;
      
      if (data.details?.length) {
        data.details = data.details.map(detail => ({
          ...detail,
          areaName: areaList.find(it => it.id === detail.areaId)?.areaName,
          itemSku: {
            ...detail.itemSku,
            item: detail.itemSku.item
          },
          remainQuantity: detail.quantity // For editing existing orders
        }));
        
        setSelectedInventory(data.details.map(it => ({
          id: it.inventoryDetailId,
          areaId: it.areaId
        })));
      }
      
      form.setFieldsValue(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWarehouse = (value: string) => {
    form.setFieldsValue({ 
      areaId: undefined,
      details: [] 
    });
    setSelectedInventory([]);
  };

  const handleChangeArea = (value: string) => {
    form.setFieldsValue({ 
      details: form.getFieldValue('details').filter((it: API.Yw.ShipmentOrderDetail) => it.areaId === value)
    });
    setSelectedInventory(selectedInventory.filter(selected => selected.areaId === value));
  };

  const handleChangeQuantity = () => {
    const details = form.getFieldValue('details') || [];
    let sum = 0;
    details.forEach((it: API.Yw.ShipmentOrderDetail) => {
      if (it.quantity) {
        sum += Number(it.quantity);
      }
    });
    form.setFieldsValue({ totalQuantity: sum });
  };

  const handleDeleteDetail = async (row: API.Yw.ShipmentOrderDetail, index: number) => {
    if (row.id) {
      Modal.confirm({
        title: '确认删除本条商品明细吗？',
        content: '如确认会立即执行！',
        onOk: async () => {
          await delShipmentOrderDetail(row.id);
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
    if (!form.getFieldValue('warehouseId')) {
      message.warning('请先选择仓库！');
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
      !currentDetails.find((detail: API.Yw.ShipmentOrderDetail) => 
        detail.inventoryDetailId === item.id
      )
    ).map(item => ({
      itemSku: {
        ...item.itemSku,
        item: item.item
      },
      skuId: item.skuId,
      amount: undefined,
      quantity: undefined,
      remainQuantity: item.remainQuantity,
      batchNo: item.batchNo,
      productionDate: item.productionDate,
      expirationDate: item.expirationDate,
      warehouseId: form.getFieldValue('warehouseId'),
      areaId: form.getFieldValue('areaId') || item.areaId,
      inventoryDetailId: item.id,
      areaName: areaList.find(it => it.id === (form.getFieldValue('areaId') || item.areaId))?.areaName
    }));
    
    form.setFieldsValue({
      details: [...currentDetails, ...newDetails]
    });
  };

  const save = async (shipmentOrderStatus = 0) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      const details = (values.details || []).map((it: API.Yw.ShipmentOrderDetail) => ({
        id: it.id,
        shipmentOrderId: values.id,
        skuId: it.skuId,
        amount: it.amount,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        warehouseId: values.warehouseId,
        areaId: it.areaId
      }));

      const params = {
        ...values,
        shipmentOrderStatus,
        details,
      };

      if (values.id) {
        await updateShipmentOrder(params);
      } else {
        await addShipmentOrder(params);
      }
      
      message.success('操作成功');
      onCancel();
    } catch (error) {
      console.error('Save error:', error);
      message.error('请填写完整信息');
    }
  };

  const doShipment = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (!values.details?.length) {
        message.error('请选择商品');
        return;
      }

      const invalidQuantityList = values.details.filter((it: API.Yw.ShipmentOrderDetail) => !it.quantity);
      if (invalidQuantityList?.length) {
        message.error('请选择出库数量');
        return;
      }

      const details = (values.details || []).map((it: API.Yw.ShipmentOrderDetail) => ({
        id: it.id,
        shipmentOrderId: values.id,
        skuId: it.skuId,
        amount: it.amount,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        inventoryDetailId: it.inventoryDetailId,
        warehouseId: values.warehouseId,
        areaId: it.areaId
      }));

      const params = {
        ...values,
        details,
      };

      setLoading(true);
      const res = await shipment(params);
      if (res.code === 200) {
        message.success('出库成功');
        onCancel();
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      console.error('Shipment error:', error);
      message.error('出库失败');
    } finally {
      setLoading(false);
    }
  };

  const updateToInvalid = async () => {
    Modal.confirm({
      title: '确认作废出库单吗？',
      onOk: async () => {
        await save(-1);
      }
    });
  };

  const handleAutoCalc = () => {
    const details = form.getFieldValue('details') || [];
    let sum = 0;
    details.forEach((it: API.Yw.ShipmentOrderDetail) => {
      if (it.amount) {
        sum += Number(it.amount);
      }
    });
    form.setFieldsValue({ receivableAmount: sum });
  };

  const goSaasTip = () => {
    Modal.info({
      title: '系统提示',
      content: '一物一码/SN模式请去Saas版本体验！',
    });
    return false;
  };

  return (
      <Card loading={loading}>
        <Card title="出库单基本信息">
          <Form 
            form={form}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Row gutter={24}>
              <Col span={11}>
                <Form.Item 
                  label="出库单号" 
                  name="shipmentOrderNo" 
                  rules={[{ required: true, message: '出库单号不能为空' }]}
                >
                  <Input 
                    disabled={!!form.getFieldValue('id')} 
                    style={{ width: '100%' }} 
                    placeholder="出库单号"
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  label="仓库" 
                  name="warehouseId" 
                  rules={[{ required: true, message: '请选择仓库' }]}
                >
                  <Select 
                    placeholder="请选择仓库"
                    options={warehouseList.map(it => ({ value: it.id, label: it.warehouseName }))}
                    onChange={handleChangeWarehouse}
                    style={{ width: '100%' }}
                    filterable
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  label="库区" 
                  name="areaId"
                >
                  <Select 
                    placeholder="请选择库区"
                    options={areaList.filter(it => it.warehouseId === form.getFieldValue('warehouseId')).map(it => ({ value: it.id, label: it.areaName }))}
                    onChange={handleChangeArea}
                    disabled={!form.getFieldValue('warehouseId')}
                    style={{ width: '100%' }}
                    filterable
                    allowClear
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={11}>
                <Form.Item 
                  label="出库类型" 
                  name="shipmentOrderType" 
                  rules={[{ required: true, message: '出库类型不能为空' }]}
                >
                  <Radio.Group>
                    {wmsShipmentType.map(item => (
                      <Radio.Button key={item.value} value={item.value}>
                        {item.label}
                      </Radio.Button>
                    ))}
                  </Radio.Group>
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  label="客户" 
                  name="merchantId"
                >
                  <Select 
                    placeholder="请选择客户"
                    options={merchantList.map(it => ({ value: it.id, label: it.merchantName }))}
                    style={{ width: '100%' }}
                    filterable
                    allowClear
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <Form.Item 
                  label="订单号" 
                  name="orderNo"
                >
                  <Input 
                    placeholder="请输入订单号" 
                    style={{ width: '100%' }} 
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={24}>
              <Col span={11}>
                <Form.Item 
                  label="备注" 
                  name="remark"
                >
                  <TextArea 
                    placeholder="备注...100个字符以内" 
                    rows={4} 
                    maxLength={100} 
                    style={{ width: '100%' }} 
                    showCount
                  />
                </Form.Item>
              </Col>
              <Col span={6}>
                <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Form.Item 
                    label="金额" 
                    name="receivableAmount"
                    style={{ marginBottom: 0 }}
                  >
                    <InputNumber 
                      precision={2} 
                      min={0} 
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                  <Button 
                    type="link" 
                    onClick={handleAutoCalc}
                    style={{ marginLeft: 20, lineHeight: '32px' }}
                  >
                    自动计算
                  </Button>
                </div>
              </Col>
              <Col span={6}>
                <Form.Item 
                  label="数量" 
                  name="totalQuantity"
                >
                  <InputNumber 
                    precision={0} 
                    disabled 
                    style={{ width: '100%' }} 
                    controls={false}
                  />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card title="商品明细" style={{ marginTop: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <span>一物一码/SN模式：</span>
              <Switch 
                checkedChildren="开启" 
                unCheckedChildren="关闭" 
                checked={mode}
                onChange={setMode}
                beforeChange={goSaasTip}
              />
            </div>
            <Popover content="请先选择仓库！" disabled={!!form.getFieldValue('warehouseId')}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showAddItem}
                disabled={!form.getFieldValue('warehouseId')}
              >
                添加商品
              </Button>
            </Popover>
          </div>

          <Table
            dataSource={form.getFieldValue('details')}
            rowKey="id"
            bordered
            pagination={false}
            locale={{ emptyText: '暂无商品明细' }}
          >
            <Table.Column 
              title="商品信息" 
              render={(_, record: API.Yw.ShipmentOrderDetail) => (
                <div>
                  <div>{record.itemSku.item.itemName}{record.itemSku.item.itemCode && `(${record.itemSku.item.itemCode})`}</div>
                  {record.itemSku.item.itemBrand && (
                    <div>品牌：{itemBrandMap.get(record.itemSku.item.itemBrand)?.brandName}</div>
                  )}
                </div>
              )}
            />
            <Table.Column 
              title="规格信息" 
              render={(_, record: API.Yw.ShipmentOrderDetail) => (
                <div>
                  <div>{record.itemSku.skuName}</div>
                  {record.itemSku.barcode && <div>条码：{record.itemSku.barcode}</div>}
                </div>
              )}
            />
            <Table.Column title="库区" dataIndex="areaName" width={200} />
            <Table.Column title="批号" dataIndex="batchNo" />
            <Table.Column 
              title="生产日期" 
              render={(_, record: API.Yw.ShipmentOrderDetail) => (
                record.productionDate ? record.productionDate.substring(0, 10) : null
              )}
            />
            <Table.Column 
              title="过期日期" 
              render={(_, record: API.Yw.ShipmentOrderDetail) => (
                record.expirationDate ? record.expirationDate.substring(0, 10) : null
              )}
            />
            <Table.Column 
              title="剩余库存" 
              align="right"
              width={150}
              render={(_, record: API.Yw.ShipmentOrderDetail) => (
                <Statistic value={Number(record.remainQuantity)} precision={0} />
              )}
            />
            <Table.Column 
              title="出库数量" 
              width={180}
              render={(_, record: API.Yw.ShipmentOrderDetail, index) => (
                <InputNumber 
                  value={record.quantity}
                  onChange={(value) => {
                    const details = form.getFieldValue('details');
                    details[index].quantity = value;
                    form.setFieldsValue({ details });
                    handleChangeQuantity();
                  }}
                  min={1}
                  max={record.remainQuantity}
                  precision={0}
                />
              )}
            />
            <Table.Column 
              title="价格" 
              width={180}
              render={(_, record: API.Yw.ShipmentOrderDetail, index) => (
                <InputNumber 
                  value={record.amount}
                  onChange={(value) => {
                    const details = form.getFieldValue('details');
                    details[index].amount = value;
                    form.setFieldsValue({ details });
                  }}
                  min={0}
                  precision={2}
                />
              )}
            />
            <Table.Column 
              title="操作" 
              width={100}
              align="right"
              render={(_, record: API.Yw.ShipmentOrderDetail, index) => (
                <Button 
                  icon={<DeleteOutlined />} 
                  type="link" 
                  danger 
                  onClick={() => handleDeleteDetail(record, index)}
                >
                  删除
                </Button>
              )}
            />
          </Table>
        </Card>

        <InventoryDetailSelect
          ref={inventorySelectRef}
          open={inventorySelectShow}
          onCancel={() => setInventorySelectShow(false)}
          onOk={handleOkClick}
          width="90%"
          selectWarehouseDisable={false}
          selectAreaDisable={!!form.getFieldValue('areaId')}
          warehouseId={form.getFieldValue('warehouseId')}
          areaId={form.getFieldValue('areaId')}
          selectedInventory={selectedInventory}
        />

        <div style={{ 
          position: 'fixed', 
          bottom: 0, 
          right: 0, 
          width: 'calc(100% - 200px)', 
          padding: '16px', 
          background: '#fff', 
          borderTop: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between'
        }}>
          <div>
            <Button type="primary" onClick={doShipment}>完成出库</Button>
            {form.getFieldValue('id') && (
              <Button danger onClick={updateToInvalid} style={{ marginLeft: 16 }}>作废</Button>
            )}
          </div>
          <div>
            <Button type="primary" onClick={() => save()}>暂存</Button>
            <Button onClick={() => onCancel()} style={{ marginLeft: 16 }}>取消</Button>
          </div>
        </div>
      </Card>
   
   
  );
};

export default ShipmentOrderEdit;