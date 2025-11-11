import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useModel } from '@umijs/max';
import { Button, Drawer, message, Modal, Table, Statistic, Form, Input, Select, DatePicker } from 'antd';
import { SearchOutlined, CloseOutlined, CheckOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { listInventoryDetail } from '@/services/yw/inventoryDetail';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

interface InventoryDetailSelectProps {
  open: boolean;
  onCancel: () => void;
  selectedInventory?: API.Yw.InventoryDetail[];
}

interface InventoryDetailSelectRef {
  setWarehouseIdAndAreaId: (warehouseId: string | null, areaId: string | null) => void;
  getList: () => void;
}

const InventoryDetailSelect = forwardRef<InventoryDetailSelectRef, InventoryDetailSelectProps>((props, ref) => {
  const { open, onCancel, selectedInventory = [] } = props;
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<API.Yw.InventoryDetail[]>([]);
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

  const judgeSelectable = (row: API.Yw.InventoryDetail) => {
    return !selectedInventory.some(selected => selected.id === row.id);
  };

  const columns: ProColumns<API.Yw.InventoryDetail>[] = [
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
      title: '批号',
      dataIndex: 'batchNo',
      align: 'left',
    },
    {
      title: '生产日期/过期日期',
      align: 'left',
      width: 180,
      render: (_, record) => (
        <div>
          {record.productionDate && <div>生产日期：{dayjs(record.productionDate).format('YYYY-MM-DD')}</div>}
          {record.expirationDate && <div>过期日期：{dayjs(record.expirationDate).format('YYYY-MM-DD')}</div>}
        </div>
      ),
    },
    {
      title: '入库日期',
      align: 'left',
      width: 140,
      render: (_, record) => (
        <div>{dayjs(record.createTime).format('YYYY-MM-DD')}</div>
      ),
    },
    {
      title: '剩余库存',
      align: 'right',
      render: (_, record) => (
        <Statistic value={Number(record.remainQuantity)} precision={0} />
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
      width={1200}
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
            {Array.from(areaMap.values()).map(area => (
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
        <Form.Item label="批号" name="batchNo">
          <Input placeholder="批号" allowClear style={{ width: 180 }} />
        </Form.Item>
        <Form.Item label="入库日期" name="createTimeRange">
          <RangePicker
            format="YYYY-MM-DD"
            placeholder={['开始日期', '结束日期']}
          />
        </Form.Item>
        <Form.Item label="多少天内过期" name="daysToExpires">
          <Select placeholder="请选择" allowClear style={{ width: 120 }}>
            <Select.Option value={30}>30天内</Select.Option>
            <Select.Option value={60}>60天内</Select.Option>
            <Select.Option value={90}>90天内</Select.Option>
            <Select.Option value={120}>120天内</Select.Option>
            <Select.Option value={180}>180天内</Select.Option>
            <Select.Option value={365}>365天内</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item>
          <Button type="primary" icon={<SearchOutlined />} onClick={() => actionRef.current?.reload()}>
            查询
          </Button>
        </Form.Item>
      </Form>

      <ProTable<API.Yw.InventoryDetail>
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
              createStartTime: formValues.createTimeRange?.[0]?.format('YYYY-MM-DD HH:mm:ss'),
              createEndTime: formValues.createTimeRange?.[1]?.format('YYYY-MM-DD HH:mm:ss'),
              pageNum: params.current,
              pageSize: params.pageSize,
            };
            
            const res = await listInventoryDetail(queryParams);
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

export default InventoryDetailSelect;