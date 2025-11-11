import React, { useState, useRef } from 'react';
import { useIntl, useAccess } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import { ActionType, FooterToolbar, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, DownloadOutlined } from '@ant-design/icons';
// 修改引入的函数名
import { listItemBrandPage, delItemBrand, addItemBrand, updateItemBrand, exportItemBrand } from '@/services/yw/itemBrand';
import EditDrawer from './edit';

const handleAdd = async (fields: API.Yw.ItemBrand) => {
  const hide = message.loading('正在添加');
  try {
    const resp = await addItemBrand({ ...fields });
    hide();
    if (resp.code === 200) {
      message.success('添加成功');
    } else {
      message.error(resp.msg);
    }
    return true;
  } catch (error) {
    hide();
    message.error('添加失败请重试！');
    return false;
  }
};

const handleUpdate = async (fields: API.Yw.ItemBrand) => {
  const hide = message.loading('正在更新');
  try {
    const resp = await updateItemBrand(fields);
    hide();
    if (resp.code === 200) {
      message.success('更新成功');
    } else {
      message.error(resp.msg);
    }
    return true;
  } catch (error) {
    hide();
    message.error('更新失败请重试！');
    return false;
  }
};

const handleRemove = async (selectedRows: API.Yw.ItemBrand[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    const resp = await delItemBrand(selectedRows.map((row) => row.id).join(','));
    hide();
    if (resp.code === 200) {
      message.success('删除成功，即将刷新');
    } else {
      message.error(resp.msg);
    }
    return true;
  } catch (error) {
    hide();
    if (error === 409) {
      Modal.error({
        title: '系统提示',
        content: (
          <div>
            <div>品牌已有业务数据关联，不能删除！</div>
            <div>请联系管理员处理！</div>
          </div>
        )
      });
    } else {
      message.error('删除失败，请重试');
    }
    return false;
  }
};

const handleExport = async () => {
  const hide = message.loading('正在导出');
  try {
    await exportItemBrand();
    hide();
    message.success('导出成功');
    return true;
  } catch (error) {
    hide();
    message.error('导出失败，请重试');
    return false;
  }
};

const ItemBrandTableList: React.FC = () => {
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<API.Yw.ItemBrand>();
  const [selectedRows, setSelectedRows] = useState<API.Yw.ItemBrand[]>([]);
  const access = useAccess();

  const columns: ProColumns<API.Yw.ItemBrand>[] = [
    {
      title: '品牌名称',
      dataIndex: 'brandName',
      valueType: 'text',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      valueType: 'dateTime',
      hideInSearch: true,
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
          hidden={!access.hasPerms('wms:itemBrand:edit')}
          onClick={() => {
            setCurrentRow(record);
            setDrawerVisible(true);
          }}
        >
          修改
        </Button>,
        <Button
          type="link"
          size="small"
          danger
          key="delete"
          hidden={!access.hasPerms('wms:itemBrand:remove')}
          onClick={async () => {
            Modal.confirm({
              title: '删除',
              content: `确认删除品牌【${record.brandName}】吗？`,
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
    <PageContainer>
      <ProTable<API.Yw.ItemBrand>
        headerTitle="品牌列表"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="add"
            hidden={!access.hasPerms('wms:itemBrand:add')}
            onClick={() => {
              setCurrentRow(undefined);
              setDrawerVisible(true);
            }}
          >
            <PlusOutlined /> 新增
          </Button>,
          <Button
            type="primary"
            key="export"
            hidden={!access.hasPerms('wms:itemBrand:export')}
            onClick={async () => {
              await handleExport();
            }}
          >
            <DownloadOutlined /> 导出
          </Button>,
        ]}
        // 修改请求函数名
        request={async (params) => {
          const res = await listItemBrandPage({ ...params });
          return {
            data: res.rows,
            total: res.total,
            success: true,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      
      {selectedRows?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> 项
            </div>
          }
        >
          <Button
            danger
            key="batchRemove"
            hidden={!access.hasPerms('wms:itemBrand:remove')}
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
        </FooterToolbar>
      )}
      
      <EditDrawer
        onSubmit={async (values) => {
          let success = false;
          if (values.id) {
            success = await handleUpdate(values);
          } else {
            success = await handleAdd(values);
          }
          if (success) {
            setDrawerVisible(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onClose={() => {
          setDrawerVisible(false);
          setCurrentRow(undefined);
        }}
        visible={drawerVisible}
        values={currentRow || {}}
      />
    </PageContainer>
  );
};

export default ItemBrandTableList;