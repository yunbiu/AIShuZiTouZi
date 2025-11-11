import React, { useState, useEffect, useRef } from 'react';
import { useModel, useRequest } from '@umijs/max';
import { 
  Button, Card, Form, Input, InputNumber, DatePicker, Select, 
  Radio, Table, message, Modal, Row, Col, Popover, Switch 
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { 
  addReceiptOrder, getReceiptOrder, updateReceiptOrder, warehousing 
} from '@/services/yw/receiptOrder';
import { delReceiptOrderDetail } from '@/services/yw/receiptOrderDetail';
import { getDictValueEnum } from '@/services/system/dict';
import SkuSelect from '../../../components/SkuSelect';
import { useParams, history } from '@umijs/max';
import { numSub, generateNo } from '@/utils/ruoyiUtils';

const { TextArea } = Input;
const { Option } = Select;
interface ReceiptOrderEditProps {
  id?: string;
}

const ReceiptOrderEdit: React.FC<ReceiptOrderEditProps> = ({ id }) => {
  const { 
    warehouseList, warehouseMap, 
    areaList, areaMap,
    merchantList, merchantMap,
    itemBrandMap 
  } = useModel('wms');
  const [wmsReceiptStatus, setWmsReceiptStatus] = useState<any[]>([]);
  const [wmsReceiptType, setWmsReceiptType] = useState<any[]>([]);
  const [form] = Form.useForm<API.Yw.ReceiptOrder>();
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState(false); // For SN mode toggle
  const [skuSelectShow, setSkuSelectShow] = useState(false);
  
  useEffect(() => {
    Promise.all([
      getDictValueEnum('wms_receipt_status'),
      getDictValueEnum('wms_receipt_type')
    ]).then(([statusData, typeData]) => {
      setWmsReceiptStatus(Object.values(statusData));
      setWmsReceiptType(Object.values(typeData));
    });
  }, []);

  useEffect(() => {
    if (id) {
      loadDetail(id);
    } else {
      form.setFieldsValue({
        receiptOrderNo: `RK${generateNo()}`,
        receiptOrderType: "2",
        receiptOrderStatus: 0,
        totalQuantity: 0,
        details: [],
      });
    }
  }, [id]);

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await getReceiptOrder(id);
      form.setFieldsValue(res.data);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeWarehouse = (value: string) => {
    form.setFieldsValue({ 
      areaId: undefined,
      details: form.getFieldValue('details')?.map((it: any) => ({
        ...it,
        areaId: undefined
      }))
    });
  };

  const handleChangeArea = (value: string) => {
    form.setFieldsValue({ 
      details: form.getFieldValue('details')?.map((it: any) => ({
        ...it,
        areaId: value
      }))
    });
  };

  const handleChangeQuantity = () => {
    const details = form.getFieldValue('details') || [];
    let totalQuantity = 0;
    details.forEach((it: any) => {
      if (it.quantity) {
        totalQuantity += Number(it.quantity);
      }
    });
    form.setFieldsValue({ totalQuantity });
  };

  const handleAutoCalc = () => {
    const details = form.getFieldValue('details') || [];
    let payableAmount = 0;
    details.forEach((it: any) => {
      if (it.amount >= 0) {
        payableAmount = numSub(payableAmount, -Number(it.amount));
      }
    });
    form.setFieldsValue({ payableAmount });
  };

  const handleDeleteDetail = async (row: any, index: number) => {
    if (row.id) {
      Modal.confirm({
        title: '确认删除本条商品明细吗？',
        content: '如确认会立即执行！',
        onOk: async () => {
          await delReceiptOrderDetail(row.id);
          const details = form.getFieldValue('details');
          details.splice(index, 1);
          form.setFieldsValue({ details });
          message.success('删除成功');
        },
      });
    } else {
      const details = form.getFieldValue('details');
      details.splice(index, 1);
      form.setFieldsValue({ details });
    }
  };

  const showAddItem = () => {
    if (!form.getFieldValue('warehouseId')) {
      message.error('请先选择仓库');
      return;
    }
    setSkuSelectShow(true);
  };

  const handleOkClick = (items: any[]) => {
    setSkuSelectShow(false);
    const details = form.getFieldValue('details') || [];
    form.setFieldsValue({
      details: [
        ...details,
        ...items.map(it => ({
          itemSku: { ...it },
          amount: undefined,
          quantity: it.quantity,
          batchNo: undefined,
          productionDate: undefined,
          expirationDate: undefined,
          warehouseId: form.getFieldValue('warehouseId'),
          areaId: form.getFieldValue('areaId')
        }))
      ]
    });
  };

  const doSave = async (receiptOrderStatus = 0) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      if (!values.details?.length) {
        message.error('请添加商品明细');
        return;
      }

      const invalidAreaList = values.details.filter((it: any) => !it.areaId);
      if (invalidAreaList.length) {
        message.error('请为所有商品选择库区');
        return;
      }

      const invalidQuantityList = values.details.filter((it: any) => !it.quantity);
      if (invalidQuantityList.length) {
        message.error('请为所有商品设置数量');
        return;
      }

      const details = values.details.map((it: any) => ({
        id: it.id,
        receiptOrderId: values.id,
        skuId: it.itemSku.id,
        amount: it.amount,
        quantity: it.quantity,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        warehouseId: values.warehouseId,
        areaId: it.areaId
      }));

      const params = {
        ...values,
        receiptOrderStatus,
        details
      };

      if (values.id) {
        await updateReceiptOrder(params);
      } else {
        await addReceiptOrder(params);
      }
      
      message.success('操作成功');
      history.push('/receiptOrder');
    } catch (error) {
      message.error('请填写完整信息');
    }
  };

  const save = async () => {
    Modal.confirm({
      title: '确认暂存入库单吗？',
      onOk: () => doSave(0),
    });
  };

  const updateToInvalid = async () => {
    Modal.confirm({
      title: '确认作废入库单吗？',
      onOk: () => doSave(-1),
    });
  };

  const doWarehousing = async () => {
    Modal.confirm({
      title: '确认入库吗？',
      onOk: () => doSave(1),
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
      render: (_: any, record: any) => (
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
      render: (_: any, record: any) => (
        <div>
          <div>{record.itemSku?.skuName}</div>
          {record.itemSku?.barcode && <div>条码：{record.itemSku.barcode}</div>}
        </div>
      ),
    },
    {
      title: '库区',
      render: (_: any, record: any) => (
        <Popover
          placement="left"
          title="提示"
          content="请先选择仓库！"
          open={!form.getFieldValue('warehouseId') ? undefined : false}
        >
          <Select
            value={record.areaId}
            placeholder="请选择库区"
            disabled={!form.getFieldValue('warehouseId') || !!form.getFieldValue('areaId')}
            onChange={(value) => {
              const details = form.getFieldValue('details');
              const index = details.findIndex((d: any) => d.skuId === record.skuId);
              if (index !== -1) {
                details[index].areaId = value;
                form.setFieldsValue({ details });
              }
            }}
            style={{ width: '100%' }}
          >
            {areaList
              .filter(it => it.warehouseId === form.getFieldValue('warehouseId'))
              .map(item => (
                <Option key={item.id} value={item.id}>
                  {item.areaName}
                </Option>
              ))}
          </Select>
        </Popover>
      ),
    },
    {
      title: '数量',
      render: (_: any, record: any) => (
        <InputNumber
          value={record.quantity}
          placeholder="数量"
          min={1}
          precision={0}
          onChange={(value) => {
            const details = form.getFieldValue('details');
            const index = details.findIndex((d: any) => d.skuId === record.skuId);
            if (index !== -1) {
              details[index].quantity = value;
              form.setFieldsValue({ details });
              handleChangeQuantity();
            }
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '价格',
      render: (_: any, record: any) => (
        <InputNumber
          value={record.amount}
          placeholder="价格"
          precision={2}
          min={0}
          max={2147483647}
          onChange={(value) => {
            const details = form.getFieldValue('details');
            const index = details.findIndex((d: any) => d.skuId === record.skuId);
            if (index !== -1) {
              details[index].amount = value;
              form.setFieldsValue({ details });
            }
          }}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '批号',
      render: (_: any, record: any) => (
        <Input
          value={record.batchNo}
          onChange={(e) => {
            const details = form.getFieldValue('details');
            const index = details.findIndex((d: any) => d.skuId === record.skuId);
            if (index !== -1) {
              details[index].batchNo = e.target.value;
              form.setFieldsValue({ details });
            }
          }}
        />
      ),
    },
    {
      title: '生产日期/过期日期',
      render: (_: any, record: any) => (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ marginRight: 8 }}>生产日期：</span>
            <DatePicker
              value={record.productionDate}
              format="YYYY-MM-DD"
              onChange={(date) => {
                const details = form.getFieldValue('details');
                const index = details.findIndex((d: any) => d.skuId === record.skuId);
                if (index !== -1) {
                  details[index].productionDate = date?.format('YYYY-MM-DD HH:mm:ss');
                  form.setFieldsValue({ details });
                }
              }}
              style={{ width: 150 }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: 8 }}>过期日期：</span>
            <DatePicker
              value={record.expirationDate}
              format="YYYY-MM-DD"
              onChange={(date) => {
                const details = form.getFieldValue('details');
                const index = details.findIndex((d: any) => d.skuId === record.skuId);
                if (index !== -1) {
                  details[index].expirationDate = date?.format('YYYY-MM-DD HH:mm:ss');
                  form.setFieldsValue({ details });
                }
              }}
              style={{ width: 150 }}
            />
          </div>
        </div>
      ),
    },
    {
      title: '操作',
      render: (_: any, record: any, index: number) => (
        <Button
          icon={<DeleteOutlined />}
          type="text"
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
      <Card title="入库单基本信息" loading={loading} style={{ marginBottom: 24 }}>
        <Form
          form={form}
          layout="horizontal"
          labelCol={{ span: 6 }}
          wrapperCol={{ span: 18 }}
        >
          <Row gutter={24}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="入库单号"
                name="receiptOrderNo"
                rules={[{ required: true, message: '入库单号不能为空' }]}
              >
                <Input disabled={!!id} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="仓库"
                name="warehouseId"
                rules={[{ required: true, message: '请选择仓库' }]}
              >
                <Select
                  placeholder="请选择仓库"
                  onChange={handleChangeWarehouse}
                  style={{ width: '100%' }}
                >
                  {warehouseList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.warehouseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="库区"
                name="areaId"
              >
                <Popover
                  placement="left"
                  title="提示"
                  content="请先选择仓库！"
                  open={!form.getFieldValue('warehouseId') ? undefined : false}
                >
                  <Select
                    placeholder="请选择库区"
                    disabled={!form.getFieldValue('warehouseId')}
                    onChange={handleChangeArea}
                    style={{ width: '100%' }}
                  >
                    {areaList
                      .filter(it => it.warehouseId === form.getFieldValue('warehouseId'))
                      .map(item => (
                        <Option key={item.id} value={item.id}>
                          {item.areaName}
                        </Option>
                      ))}
                  </Select>
                </Popover>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="入库类型"
                name="receiptOrderType"
                rules={[{ required: true, message: '入库类型不能为空' }]}
              >
                <Radio.Group>
                  {wmsReceiptType?.map((item: any) => (
                    <Radio.Button key={item.value} value={item.value}>
                      {item.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="供应商"
                name="merchantId"
              >
                <Select
                  placeholder="请选择供应商"
                  style={{ width: '100%' }}
                >
                  {merchantList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.merchantName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8}>
              <Form.Item
                label="订单号"
                name="orderNo"
              >
                <Input placeholder="请输入订单号" style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={16}>
              <Form.Item
                label="备注"
                name="remark"
                labelCol={{ span: 3 }}
                wrapperCol={{ span: 21 }}
              >
                <TextArea
                  placeholder="备注...100个字符以内"
                  maxLength={100}
                  rows={2}
                  showCount
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                label="金额"
                name="payableAmount"
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <InputNumber
                    precision={2}
                    min={0}
                    style={{ width: '100%' }}
                  />
                  <Button 
                    type="link" 
                    onClick={handleAutoCalc}
                    style={{ marginLeft: 8 }}
                  >
                    自动计算
                  </Button>
                </div>
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Form.Item
                label="数量"
                name="totalQuantity"
              >
                <InputNumber
                  disabled
                  precision={0}
                  style={{ width: '100%' }}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      <Card title="商品明细" loading={loading} style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <span>一物一码/SN模式：</span>
          <Switch
            checkedChildren="开启"
            unCheckedChildren="关闭"
            checked={mode}
            onChange={setMode}
            beforeChange={goSaasTip}
            style={{ margin: '0 8px' }}
          />
          <Popover
            placement="left"
            title="提示"
            content="请先选择仓库！"
            open={!form.getFieldValue('warehouseId') ? undefined : false}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={showAddItem}
              disabled={!form.getFieldValue('warehouseId')}
              style={{ float: 'right' }}
            >
              添加商品
            </Button>
          </Popover>
        </div>

        <Table
          columns={columns}
          dataSource={form.getFieldValue('details') || []}
          rowKey="skuId"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      </Card>

      <SkuSelect
        open={skuSelectShow}
        onOk={handleOkClick}
        onCancel={() => setSkuSelectShow(false)}
        width="80%"
      />

      {/* 底部操作按钮 */}
      <div style={{ 
        position: 'fixed', 
        bottom: 0, 
        right: 0, 
        width: '100%', 
        padding: '16px', 
        background: '#fff', 
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button 
              onClick={doWarehousing} 
              type="primary" 
              style={{ marginRight: 8 }}
            >
              完成入库
            </Button>
            {id && (
              <Button onClick={updateToInvalid} danger>
                作废
              </Button>
            )}
          </div>
          <div>
            <Button 
              onClick={save} 
              type="primary" 
              style={{ marginRight: 8 }}
            >
              暂存
            </Button>
            <Button onClick={() => history.push('/receiptOrder')}>
              取消
            </Button>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};
  export default ReceiptOrderEdit;