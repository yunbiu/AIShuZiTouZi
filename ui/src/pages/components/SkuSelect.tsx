import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useModel, history } from '@umijs/max';
import { Button, Drawer, Form, Input, Table, Statistic, Row, Col } from 'antd';
import { SearchOutlined, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { listItemSkuPage } from '@/services/yw/itemSku';

interface SkuSelectProps {
  open: boolean;
  onCancel: () => void;
  singleSelect?: boolean;
  size?: string;
}

interface SkuSelectRef {
  getList: () => void;
}

const SkuSelect = forwardRef<SkuSelectRef, SkuSelectProps>((props, ref) => {
  const { open, onCancel, singleSelect = false, size = '80%' } = props;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<API.Wms.ItemSku[]>([]);
  const [loading, setLoading] = useState(false);
  const { itemBrandMap } = useModel('wms');

  useImperativeHandle(ref, () => ({
    getList: () => {
      actionRef.current?.reload();
    },
  }));

  const getVolumeText = (row: API.Wms.ItemSku) => {
    if ((row.length || row.length === 0) && (row.width || row.width === 0) && (row.height || row.height === 0)) {
      return `${row.length} * ${row.width} * ${row.height}`;
    }
    return [
      row.length || row.length === 0 ? `长：${row.length}` : '',
      row.width || row.width === 0 ? `宽：${row.width}` : '',
      row.height || row.height === 0 ? `高：${row.height}` : ''
    ].filter(Boolean).join(' ');
  };

  const handleChooseSku = (row: API.Wms.ItemSku) => {
    onCancel();
    // 触发单选事件
  };

  const handleOk = () => {
    onCancel();
    // 触发多选事件
    setSelectedRows([]);
  };

  const handleCancel = () => {
    onCancel();
    setSelectedRows([]);
  };

  const goCreateItem = () => {
    history.push('/system/itemManage2?openDrawer=true');
  };

  const columns: ProColumns<API.Wms.ItemSku>[] = [
    {
      title: '商品信息',
      render: (_, record) => (
        <div>
          <div>{record.item?.itemName}</div>
          {record.item?.itemCode && <div>编号：{record.item.itemCode}</div>}
          {record.item?.itemBrand && <div>品牌：{itemBrandMap.get(record.item.itemBrand)?.brandName}</div>}
        </div>
      ),
    },
    {
      title: '规格信息',
      render: (_, record) => (
        <div>
          <div>{record.skuName}</div>
          {record.skuCode && <div>编号：{record.skuCode}</div>}
          {record.barcode && <div>条码：{record.barcode}</div>}
        </div>
      ),
    },
    {
      title: '价格(元)',
      width: 160,
      align: 'left',
      render: (_, record) => (
        <div>
          {record.costPrice !== undefined && (
            <div className="flex-space-between">
              <span>成本价：</span>
              <div>{record.costPrice}</div>
            </div>
          )}
          {record.sellingPrice !== undefined && (
            <div className="flex-space-between">
              <span>销售价：</span>
              <div>{record.sellingPrice}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '重量(kg)',
      width: 160,
      align: 'left',
      render: (_, record) => (
        <div>
          {record.netWeight !== undefined && (
            <div className="flex-space-between">
              <span>净重：</span>
              <div>{record.netWeight}</div>
            </div>
          )}
          {record.grossWeight !== undefined && (
            <div className="flex-space-between">
              <span>毛重：</span>
              <div>{record.grossWeight}</div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '长宽高(cm)',
      align: 'right',
      width: 250,
      render: (_, record) => (
        <div>{getVolumeText(record)}</div>
      ),
    },
    ...(singleSelect ? [{
      title: '操作',
      width: 100,
      align: 'right',
      render: (_, record) => (
        <Button type="link" onClick={() => handleChooseSku(record)}>选择</Button>
      ),
    }] : []),
  ];

  return (
    <Drawer
      title="商品选择"
      width={size}
      open={open}
      onClose={handleCancel}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Button icon={<PlusOutlined />} onClick={goCreateItem}>创建商品</Button>
            <Button icon={<ReloadOutlined />} onClick={() => actionRef.current?.reload()} style={{ marginLeft: 8 }}>
              刷新
            </Button>
          </div>
          <div>
            <Button onClick={handleCancel} style={{ marginRight: 8 }}>取消</Button>
            {!singleSelect && <Button type="primary" onClick={handleOk}>确认</Button>}
          </div>
        </div>
      }
    >
      <Form form={form} layout="inline" labelAlign="left">
        <Row gutter={20} style={{ width: '100%' }}>
          <Col span={8}>
            <Form.Item label="商品名称" name="itemName">
              <Input placeholder="商品名称" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="商品编号" name="itemCode">
              <Input placeholder="商品编号" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="规格名称" name="skuName">
              <Input placeholder="规格名称" allowClear />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={20} style={{ width: '100%', marginTop: 16 }}>
          <Col span={8}>
            <Form.Item label="规格编号" name="barcode">
              <Input placeholder="规格编号" allowClear />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Button type="primary" icon={<SearchOutlined />} onClick={() => actionRef.current?.reload()}>
              查询
            </Button>
          </Col>
        </Row>
      </Form>

      <ProTable<API.Wms.ItemSku>
        style={{ marginTop: 16 }}
        actionRef={actionRef}
        rowKey="id"
        search={false}
        options={false}
        request={async (params) => {
          setLoading(true);
          try {
            const formValues = form.getFieldsValue();
            const queryParams = {
              ...formValues,
              pageNum: params.current,
              pageSize: params.pageSize,
            };
            
            const res = await listItemSkuPage(queryParams);
            return {
              data: res.rows,
              total: res.total,
              success: true,
            };
          } finally {
            setLoading(false);
          }
        }}
        columns={columns}
        rowSelection={singleSelect ? undefined : {
          selectedRowKeys: selectedRows.map(row => row.id),
          onChange: (_, rows) => setSelectedRows(rows),
        }}
        loading={loading}
        pagination={{
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
        }}
      />
    </Drawer>
  );
});

export default SkuSelect;