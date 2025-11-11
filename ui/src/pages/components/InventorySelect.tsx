import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useModel } from '@umijs/max';
import { Button, Drawer, message, Modal, Table, Statistic, Form, Input, Select } from 'antd';
import { SearchOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { listInventory } from '@/services/yw/inventory';
import dayjs from 'dayjs';

interface InventorySelectProps {
  open: boolean;
  onCancel: () => void;
  selectedInventory?: API.Yw.Inventory[];
  size?: string;
}

interface InventorySelectRef {
  setWarehouseIdAndAreaId: (warehouseId: string | null, areaId: string | null) => void;
  getList: () => void;
}

const InventorySelect = forwardRef<InventorySelectRef, InventorySelectProps>((props, ref) => {
  const { open, onCancel, selectedInventory = [], size = '30%' } = props;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<API.Yw.Inventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectAreaDisable, setSelectAreaDisable] = useState(false);
  const { warehouseMap, areaMap, itemBrandMap } = useModel('wms');

  useImperativeHandle(ref, () => ({
    setWarehouseIdAndAreaId,
    getList: () => {
      actionRef.current?.reload();
    },
  }));

  const setWarehouseIdAndAreaId = (warehouseId: string | null, areaId: string | null) => {
    form.setFieldsValue({
      warehouseId,
      areaId
    });
    setSelectAreaDisable(!!areaId);
  };

  const getVolumeText = (row: API.Yw.ItemSku) => {
    if ((row.length || row.length === 0) && (row.width || row.width === 0) && (row.height || row.height === 0)) {
      return `${row.length} * ${row.width} * ${row.height}`;
    }
    return [
      row.length || row.length === 0 ? `长：${row.length}` : '',
      row.width || row.width === 0 ? `宽：${row.width}` : '',
      row.height || row.height === 0 ? `高：${row.height}` : ''
    ].filter(Boolean).join(' ');
  };

  const judgeSelectable = (row: API.Yw.Inventory) => {
    return !selectedInventory.some(selected => 
      `${selected.warehouseId}_${selected.areaId}_${selected.skuId}` === 
      `${row.warehouseId}_${row.areaId}_${row.skuId}`
    );
  };

  const columns: ProColumns<API.Yw.Inventory>[] = [
    {
      title: '库区',
      dataIndex: 'areaName',
      render: (_, record) => areaMap.get(record.areaId)?.areaName,
    },
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
          <div>{record.itemSku?.skuName}</div>
          {record.itemSku?.skuCode && <div>编号：{record.itemSku.skuCode}</div>}
          {record.itemSku?.barcode && <div>条码：{record.itemSku.barcode}</div>}
        </div>
      ),
    },
    {
      title: '价格(元)',
      width: 160,
      align: 'left',
      render: (_, record) => (
        <div>
          {record.itemSku?.costPrice !== undefined && (
            <div className="flex-space-between">
              <span>成本价：</span>
              <div>{record.itemSku.costPrice}</div>
            </div>
          )}
          {record.itemSku?.sellingPrice !== undefined && (
            <div className="flex-space-between">
              <span>销售价：</span>
              <div>{record.itemSku.sellingPrice}</div>
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
          {record.itemSku?.netWeight !== undefined && (
            <div className="flex-space-between">
              <span>净重：</span>
              <div>{record.itemSku.netWeight}</div>
            </div>
          )}
          {record.itemSku?.grossWeight !== undefined && (
            <div className="flex-space-between">
              <span>毛重：</span>
              <div>{record.itemSku.grossWeight}</div>
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
        <div>{getVolumeText(record.itemSku)}</div>
      ),
    },
    {
      title: '剩余库存',
      align: 'right',
      render: (_, record) => (
        <Statistic value={Number(record.quantity)} precision={0} />
      ),
    },
  ];

  const handleOk = () => {
    onCancel();
    setSelectedRows([]);
  };

  const handleCancel = () => {
    onCancel();
    setSelectedRows([]);
  };

  return (
    <Drawer
      title="选择库存"
      width={size}
      open={open}
      onClose={handleCancel}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" onClick={handleOk}>
            确认
          </Button>
        </div>
      }
    >
      <Form form={form} layout="inline" labelAlign="left">
        <Form.Item label="商品名称" name="itemName">
          <Input placeholder="商品名称" allowClear />
        </Form.Item>
        <Form.Item label="商品编号" name="itemCode">
          <Input placeholder="商品编号" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item label="库区" name="areaId">
          <Select
            placeholder="请选择库区"
            disabled={selectAreaDisable}
            allowClear
            style={{ width: 180 }}
          >
            {Array.from(areaMap.values())
              .filter(area => area.warehouseId === form.getFieldValue('warehouseId'))
              .map(area => (
                <Select.Option key={area.id} value={area.id}>
                  {area.areaName}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>
        <Form.Item label="规格名称" name="skuName">
          <Input placeholder="规格名称" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item label="规格编号" name="barcode">
          <Input placeholder="规格编号" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={() => actionRef.current?.reload()}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <ProTable<API.Yw.Inventory>
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
            
            const res = await listInventory(queryParams);
            return {
              data: res.rows.map(item => ({
                ...item,
                warehouseName: warehouseMap.get(item.warehouseId)?.warehouseName,
                areaName: areaMap.get(item.areaId)?.areaName
              })),
              total: res.total,
              success: true,
            };
          } finally {
            setLoading(false);
          }
        }}
        columns={columns}
        rowSelection={{
          selectedRowKeys: selectedRows.map(row => row.id),
          onChange: (_, rows) => setSelectedRows(rows),
          getCheckboxProps: (record) => ({
            disabled: !judgeSelectable(record),
          }),
        }}
        loading={loading}
        pagination={{
          showSizeChanger: true,
        }}
      />
    </Drawer>
  );
});

export default InventorySelect;