import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess, useModel } from '@umijs/max';
// Import Row and Col from antd
import { Button, Card, Form, Input, InputNumber, DatePicker, Select, Statistic, Table, message, Modal, Row, Col } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ProFormInstance } from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import { addCheckOrder, getCheckOrder, updateCheckOrder, check } from '@/services/yw/checkOrder';
import { delCheckOrderDetail } from '@/services/yw/checkOrderDetail';
import { listInventoryDetailNoPage } from '@/services/yw/inventoryDetail';
import dayjs from 'dayjs';
// import { generateNo } from '@/utils/ruoyi';

const { TextArea } = Input;
const { Option } = Select;

interface CheckOrderEditProps {
  id?: string;
  onCancel: () => void;
}

const CheckOrderEdit: React.FC<CheckOrderEditProps> = ({ id, onCancel }) => {
  const { warehouseMap, areaMap, itemBrandMap } = useModel('wms');
  const [form] = Form.useForm<API.Yw.CheckOrder>();
  const formRef = useRef<ProFormInstance>();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [mode, setMode] = useState(false); // For SN mode toggle
  const [warehouseList, setWarehouseList] = useState<API.Yw.Warehouse[]>([]);
  const [areaList, setAreaList] = useState<API.Yw.Area[]>([]);

  useEffect(() => {
    if (id) {
      setChecking(true);
      loadDetail(id);
    } else {
      // 使用时间戳生成盘库单号
      const timestamp = new Date().getTime();
      form.setFieldsValue({
        checkOrderNo: `PK${timestamp}`,
        checkOrderStatus: 0,
        checkOrderTotal: 0,
        details: [],
      });
    }
  }, [id]);

  const loadDetail = async (id: string) => {
    setLoading(true);
    try {
      const res = await getCheckOrder(id);
      const data = res.data;
      if (data.details) {
        data.details = data.details.map(detail => ({
          ...detail,
          areaName: areaMap.get(detail.areaId)?.areaName,
          newInventoryDetail: !detail.inventoryDetailId,
          quantity: Number(detail.quantity),
          checkQuantity: Number(detail.checkQuantity),
        }));
      }
      form.setFieldsValue(data);
    } finally {
      setLoading(false);
    }
  };

  const startCheck = async () => {
    const values = await form.validateFields(['warehouseId']);
    if (!values.warehouseId) {
      message.error('请先选择仓库！');
      return;
    }

    setChecking(true);
    setLoading(true);
    try {
      const res = await listInventoryDetailNoPage({
        warehouseId: values.warehouseId,
        areaId: values.areaId,
      });

      const currentDetails = form.getFieldValue('details') || [];
      const newDetails = res.data.filter(it => 
        !currentDetails.find((detail: API.Yw.CheckOrderDetail) => detail.inventoryDetailId === it.id)
      ).map(it => ({
        itemSku: it.itemSku,
        inventoryDetailId: it.id,
        skuId: it.itemSku.id,
        warehouseId: it.warehouseId,
        areaId: it.areaId,
        quantity: Number(it.remainQuantity),
        checkQuantity: Number(it.remainQuantity),
        areaName: areaMap.get(it.areaId)?.areaName,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        receiptTime: it.createTime,
        newInventoryDetail: false,
      }));

      form.setFieldsValue({
        details: [...currentDetails, ...newDetails],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangeQuantity = () => {
    const details = form.getFieldValue('details') || [];
    let checkOrderTotal = 0;
    details.forEach((it: API.Yw.CheckOrderDetail) => {
      if (it.quantity !== it.checkQuantity) {
        checkOrderTotal += (it.checkQuantity - it.quantity);
      }
    });
    form.setFieldsValue({ checkOrderTotal });
  };

  const handleDeleteDetail = async (row: API.Yw.CheckOrderDetail, index: number) => {
    if (row.id) {
      Modal.confirm({
        title: '确认删除本条商品明细吗？',
        content: '如确认会立即执行！',
        onOk: async () => {
          await delCheckOrderDetail(row.id);
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

  const save = async (checkOrderStatus = 0) => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      const details = (values.details || []).map((it: API.Yw.CheckOrderDetail) => ({
        id: it.id,
        checkOrderId: values.id,
        skuId: it.skuId,
        quantity: it.quantity,
        checkQuantity: it.checkQuantity,
        inventoryDetailId: it.inventoryDetailId,
        warehouseId: values.warehouseId,
        areaId: it.areaId,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        receiptTime: it.receiptTime,
      }));

      const params = {
        ...values,
        checkOrderStatus,
        details,
      };

      if (values.id) {
        await updateCheckOrder(params);
      } else {
        await addCheckOrder(params);
      }
      
      message.success('操作成功');
      onCancel();
    } catch (error) {
      message.error('请填写完整信息');
    }
  };

  const doCheck = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();
      
      const newList = (values.details || []).filter((it: API.Yw.CheckOrderDetail) => it.newInventoryDetail);
      if (newList.length && newList.some((it: API.Yw.CheckOrderDetail) => !it.areaId)) {
        message.error('请选择库区');
        return;
      }

      const details = (values.details || []).map((it: API.Yw.CheckOrderDetail) => ({
        id: it.id,
        checkOrderId: values.id,
        skuId: it.skuId,
        quantity: it.quantity,
        checkQuantity: it.checkQuantity,
        warehouseId: values.warehouseId,
        areaId: it.areaId,
        batchNo: it.batchNo,
        productionDate: it.productionDate,
        expirationDate: it.expirationDate,
        receiptTime: it.receiptTime,
        inventoryDetailId: it.inventoryDetailId,
      }));

      const params = {
        ...values,
        details,
      };

      await check(params);
      message.success('盘库成功');
      onCancel();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const updateToInvalid = async () => {
    Modal.confirm({
      title: '确认作废盘库单吗？',
      onOk: () => save(-1),
    });
  };

  const columns = [
    {
      title: '商品信息',
      dataIndex: ['itemSku', 'item', 'itemName'],
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
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
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        <div>
          {record.itemSku
            ? `${record.itemSku.skuName}${record.itemSku.barcode ? `(${record.itemSku.barcode})` : ''}`
            : '请选择商品'}
        </div>
      ),
    },
    {
      title: '库区',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        record.newInventoryDetail ? (
          <Select
            value={record.areaId}
            onChange={(value) => {
              const details = form.getFieldValue('details');
              const index = details.findIndex((d: API.Yw.CheckOrderDetail) => d.skuId === record.skuId);
              if (index !== -1) {
                details[index].areaId = value;
                details[index].areaName = areaMap.get(value)?.areaName;
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
        ) : (
          <div>{record.areaName}</div>
        )
      ),
    },
    {
      title: '批号',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        record.newInventoryDetail ? (
          <Input
            value={record.batchNo}
            onChange={(e) => {
              const details = form.getFieldValue('details');
              const index = details.findIndex((d: API.Yw.CheckOrderDetail) => d.skuId === record.skuId);
              if (index !== -1) {
                details[index].batchNo = e.target.value;
                form.setFieldsValue({ details });
              }
            }}
          />
        ) : (
          <div>{record.batchNo}</div>
        )
      ),
    },
    {
      title: '生产日期/过期日期',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        record.newInventoryDetail ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
              <span style={{ marginRight: 8 }}>生产日期：</span>
              <DatePicker
                value={record.productionDate ? dayjs(record.productionDate) : null}
                onChange={(date) => {
                  const details = form.getFieldValue('details');
                  const index = details.findIndex((d: API.Yw.CheckOrderDetail) => d.skuId === record.skuId);
                  if (index !== -1) {
                    details[index].productionDate = date ? date.format('YYYY-MM-DD HH:mm:ss') : undefined;
                    form.setFieldsValue({ details });
                  }
                }}
                style={{ width: 150 }}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span style={{ marginRight: 8 }}>过期日期：</span>
              <DatePicker
                value={record.expirationDate ? dayjs(record.expirationDate) : null}
                onChange={(date) => {
                  const details = form.getFieldValue('details');
                  const index = details.findIndex((d: API.Yw.CheckOrderDetail) => d.skuId === record.skuId);
                  if (index !== -1) {
                    details[index].expirationDate = date ? date.format('YYYY-MM-DD HH:mm:ss') : undefined;
                    form.setFieldsValue({ details });
                  }
                }}
                style={{ width: 150 }}
              />
            </div>
          </div>
        ) : (
          <div>
            {record.productionDate && <div>生产日期：{record.productionDate.substring(0, 10)}</div>}
            {record.expirationDate && <div>过期日期：{record.expirationDate.substring(0, 10)}</div>}
          </div>
        )
      ),
    },
    {
      title: '入库日期',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        record.newInventoryDetail ? (
          <DatePicker
            value={record.receiptTime ? dayjs(record.receiptTime) : null}
            onChange={(date) => {
              const details = form.getFieldValue('details');
              const index = details.findIndex((d: API.Yw.CheckOrderDetail) => d.skuId === record.skuId);
              if (index !== -1) {
                details[index].receiptTime = date ? date.format('YYYY-MM-DD HH:mm:ss') : undefined;
                form.setFieldsValue({ details });
              }
            }}
            style={{ width: 150 }}
          />
        ) : (
          <div>{dayjs(record.receiptTime).format('YYYY-MM-DD')}</div>
        )
      ),
    },
    {
      title: '账面库存',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        <Statistic value={Number(record.quantity)} precision={0} />
      ),
    },
    {
      title: '盈亏数',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        <Statistic value={Number(record.checkQuantity) - Number(record.quantity)} precision={0} />
      ),
    },
    {
      title: '实际库存',
      render: (_: any, record: API.Yw.CheckOrderDetail) => (
        <InputNumber
          value={record.checkQuantity}
          onChange={(value) => {
            const details = form.getFieldValue('details');
            const index = details.findIndex((d: API.Yw.CheckOrderDetail) => d.skuId === record.skuId);
            if (index !== -1) {
              details[index].checkQuantity = value;
              form.setFieldsValue({ details });
              handleChangeQuantity();
            }
          }}
          min={0}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: '操作',
      render: (_: any, record: API.Yw.CheckOrderDetail, index: number) => (
        record.newInventoryDetail && (
          <Button
            icon={<DeleteOutlined />}
            type="link"
            danger
            onClick={() => handleDeleteDetail(record, index)}
          >
            删除
          </Button>
        )
      ),
    },
  ];

  return (
    <PageContainer >
      {!checking ? (
        // 新增一个 div 用于包裹 Card 并设置居中样式
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Card style={{width:'500px'}}>
            <Form form={form} layout="vertical">
              <Form.Item label="仓库" name="warehouseId" rules={[{ required: true, message: '请选择仓库' }]}>
                <Select
                  placeholder="请选择仓库"
                  onChange={(value) => {
                    form.setFieldsValue({ areaId: undefined });
                    setAreaList(Array.from(areaMap.values()).filter(it => it.warehouseId === value));
                  }}
                >
                  {Array.from(warehouseMap.values()).map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.warehouseName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item label="库区" name="areaId">
                <Select placeholder="请选择库区">
                  {areaList.map(item => (
                    <Option key={item.id} value={item.id}>
                      {item.areaName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item>
                <Button type="primary" onClick={startCheck} style={{ width: '100%' }}>
                  开始盘库
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      ) : (
        <>
        <Card title="盘库单基本信息" loading={loading} style={{ marginBottom: 24 }}>
  <Form
    form={form}
    layout="horizontal"
    labelCol={{ span: 6 }}  // 统一标签宽度
    wrapperCol={{ span: 18 }}  // 统一输入项宽度
    labelAlign="left"  // 标签左对齐
  >
    <Row gutter={24}>
      {/* 第一行 */}
      <Col xs={24} sm={12} md={8}>
        <Form.Item
          label="盘库单号"
          name="checkOrderNo"
          rules={[{ required: true, message: '盘库单号不能为空' }]}
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
            disabled={checking}
            style={{ width: '100%' }}
            onChange={(value) => {
              form.setFieldsValue({ areaId: undefined });
              setAreaList(Array.from(areaMap.values()).filter(it => it.warehouseId === value));
            }}
          >
            {Array.from(warehouseMap.values()).map(item => (
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
          <Select
            placeholder="请选择库区"
            disabled={!form.getFieldValue('warehouseId') || checking}
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
        </Form.Item>
      </Col>

      {/* 第二行 - 备注（单独一行） */}
      <Col span={16}>
        <Form.Item
          label="备注"
          name="remark"
          labelCol={{ span: 3 }}  // 备注标签较窄
          wrapperCol={{ span: 21 }}
        >
          <TextArea
            placeholder="备注...100个字符以内"
            maxLength={100}
            rows={2}
            showCount
            style={{ width: '100%' }}  // 宽度100%填满
          />
        </Form.Item>
      </Col>

      {/* 第三行 - 盈亏数（单独一行） */}
      <Col xs={8} sm={8} md={8}>
        <Form.Item
          label="盈亏数"
          name="checkOrderTotal"
        >
          <InputNumber
            disabled
            precision={0}
            style={{ width: '100%' }}  // 宽度100%填满
          />
        </Form.Item>
      </Col>
    </Row>
  </Form>
</Card>

          <Card title="商品明细" className="mt10" loading={loading}>
            <div style={{ marginBottom: 16 }}>
              <span>一物一码/SN模式：</span>
              <Button
                type="text"
                onClick={() => {
                  Modal.info({
                    title: '系统提示',
                    content: '一物一码/SN模式请去Saas版本体验！',
                  });
                }}
              >
                {mode ? '开启' : '关闭'}
              </Button>
              <Button
                type="primary"
                style={{ float: 'right' }}
                icon={<PlusOutlined />}
                disabled={!form.getFieldValue('warehouseId')}
                onClick={() => {
                  // TODO: Implement SKU selection
                }}
              >
                新增库存
              </Button>
            </div>
            <Table
              columns={columns}
              dataSource={form.getFieldValue('details') || []}
              rowKey="skuId"
              pagination={false}
              scroll={{ x: 'max-content' }}
            />
          </Card>

          <div style={{ position: 'fixed', bottom: 0, right: 0, width: '100%', padding: '16px', background: '#fff', boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <Button onClick={doCheck} type="primary" style={{ marginRight: 8 }}>
                  完成盘库
                </Button>
                {id && (
                  <Button onClick={updateToInvalid} danger>
                    作废
                  </Button>
                )}
              </div>
              <div>
                <Button onClick={() => save(0)} type="primary" style={{ marginRight: 8 }}>
                  暂存
                </Button>
                <Button onClick={onCancel}>取消</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </PageContainer>
  );
};

export default CheckOrderEdit;