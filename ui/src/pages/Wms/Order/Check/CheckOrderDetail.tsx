import React, { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { useIntl, useAccess } from '@umijs/max';
import { Button, Drawer, message, Modal, Table, Statistic } from 'antd';
import { PlusOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { listCheckOrderDetail, delCheckOrderDetail, exportCheckOrderDetail } from '@/services/yw/checkOrderDetail';
import { useModel } from '@umijs/max';
import dayjs from 'dayjs';

interface CheckOrderDetailProps {
  open: boolean;
  checkOrderNo: string | null;
  onCancel: () => void;
}

interface CheckOrderDetailRef {
  setCheckOrderId: (id: string) => void;
  handleQuery: () => void;
}

const CheckOrderDetail = forwardRef<CheckOrderDetailRef, CheckOrderDetailProps>((props, ref) => {
  const { open, checkOrderNo, onCancel } = props;
  const [checkOrderId, setCheckOrderId] = useState<string>();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<API.Yw.CheckOrderDetail[]>([]);
  const [currentRow, setCurrentRow] = useState<API.Yw.CheckOrderDetail>();
  const [loading, setLoading] = useState(false);
  const access = useAccess();
  const { areaMap } = useModel('wms');

  useImperativeHandle(ref, () => ({
    setCheckOrderId,
    handleQuery: () => {
      actionRef.current?.reload();
    },
  }));

  const handleRemove = async (selectedRows: API.Yw.CheckOrderDetail[]) => {
    const hide = message.loading('正在删除');
    if (!selectedRows) return true;
    try {
      const resp = await delCheckOrderDetail(selectedRows.map((row) => row.id).join(','));
      hide();
      if (resp.code === 200) {
        message.success('删除成功，即将刷新');
      } else {
        message.error(resp.msg);
      }
      return true;
    } catch (error) {
      hide();
      message.error('删除失败，请重试');
      return false;
    }
  };

  const handleExport = async () => {
    const hide = message.loading('正在导出');
    try {
      await exportCheckOrderDetail({ checkOrderId });
      hide();
      message.success('导出成功');
      return true;
    } catch (error) {
      hide();
      message.error('导出失败，请重试');
      return false;
    }
  };

  const columns: ProColumns<API.Yw.CheckOrderDetail>[] = [
    {
      title: '商品名称',
      dataIndex: ['itemSku', 'item', 'itemName'],
      valueType: 'text',
    },
    {
      title: '规格名称',
      dataIndex: ['itemSku', 'skuName'],
      valueType: 'text',
    },
    {
      title: '库区',
      dataIndex: 'areaName',
      valueType: 'text',
      render: (_, record) => areaMap.get(record.areaId)?.areaName,
    },
    {
      title: '批号',
      dataIndex: 'batchNo',
      valueType: 'text',
    },
    {
      title: '账面库存',
      dataIndex: 'quantity',
      valueType: 'digit',
      align: 'right',

    },
    
    {
      title: '盈亏数',
      valueType: 'digit',
      align: 'right',
      render: (_, record) => {
        const checkQuantity = record.checkQuantity/1;
        const quantity  = record.quantity/1;
        return checkQuantity - quantity;
      },
    },
    {
      title: '实际库存',
      dataIndex: 'checkQuantity',
      valueType: 'digit',
      align: 'right',

    },
    {
      title: '操作',
      dataIndex: 'option',
      width: '180px',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type="link"
          size="small"
          key="edit"
          hidden={!access.hasPerms('wms:checkOrderDetail:edit')}
          onClick={() => {
            setCurrentRow(record);
            // TODO: Implement edit functionality
          }}
        >
          修改
        </Button>,
        <Button
          type="link"
          size="small"
          danger
          key="delete"
          hidden={!access.hasPerms('wms:checkOrderDetail:remove')}
          onClick={async () => {
            Modal.confirm({
              title: '删除',
              content: '确认删除该盘点明细吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                const success = await handleRemove([record]);
                if (success && actionRef.current) {
                  actionRef.current.reload();
                }
              },
            });
          }}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <Drawer
      title={`盘点单明细 - ${checkOrderNo}`}
      width={1350}
      open={open}
      onClose={onCancel}
      destroyOnClose
    >
      <ProTable<API.Yw.CheckOrderDetail>
        headerTitle="盘点明细列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="add"
            hidden={!access.hasPerms('wms:checkOrderDetail:add')}
            onClick={() => {
              setCurrentRow(undefined);
              // TODO: Implement add functionality
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
          <Button
            type="primary"
            key="export"
            hidden={!access.hasPerms('wms:checkOrderDetail:export')}
            onClick={async () => {
              await handleExport();
            }}
          >
            <DownloadOutlined /> 导出
          </Button>,
        ]}
        request={async (params) => {
          if (!checkOrderId) return { data: [], success: true };
          setLoading(true);
          try {
            const res = await listCheckOrderDetail({ ...params, checkOrderId });
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
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
        loading={loading}
      />
      
      {selectedRows?.length > 0 && (
        <div style={{ position: 'fixed', bottom: 0, right: 0, width: '100%', padding: '16px', background: '#fff', boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> 项
            </div>
            <Button
              danger
              key="batchRemove"
              hidden={!access.hasPerms('wms:checkOrderDetail:remove')}
              onClick={async () => {
                Modal.confirm({
                  title: '是否确认删除所选数据项?',
                  icon: <ExclamationCircleOutlined />,
                  content: '请谨慎操作',
                  async onOk() {
                    const success = await handleRemove(selectedRows);
                    if (success) {
                      setSelectedRows([]);
                      actionRef.current?.reloadAndRest?.();
                    }
                  },
                  onCancel() {},
                });
              }}
            >
              批量删除
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  );
});

export default CheckOrderDetail;