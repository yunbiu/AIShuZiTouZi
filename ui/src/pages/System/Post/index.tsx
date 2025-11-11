import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage, useAccess } from '@umijs/max';
import type { FormInstance } from 'antd';
import { Button, message, Modal } from 'antd';
import { ActionType, FooterToolbar, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getPostList, removePost, addPost, updatePost, exportPost } from '@/services/system/post';
import UpdateForm from './edit';
import { getDictValueEnum } from '@/services/system/dict';
import DictTag from '@/components/DictTag';

const handleAdd = async (fields) => {
  const hide = message.loading('正在添加');
  try {
    const resp = await addPost({ ...fields });
    hide();
    resp.code === 200 ? message.success('添加成功') : message.error(resp.msg);
    return true;
  } catch (error) {
    hide();
    message.error('添加失败，请重试！');
    return false;
  }
};

const handleUpdate = async (fields) => {
  const hide = message.loading('正在更新');
  try {
    const resp = await updatePost(fields);
    hide();
    resp.code === 200 ? message.success('更新成功') : message.error(resp.msg);
    return true;
  } catch (error) {
    hide();
    message.error('更新失败，请重试！');
    return false;
  }
};

const handleRemove = async (selectedRows) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;
  try {
    const resp = await removePost(selectedRows.map((row) => row.postId).join(','));
    hide();
    resp.code === 200 ? message.success('删除成功，即将刷新') : message.error(resp.msg);
    return true;
  } catch (error) {
    hide();
    message.error('删除失败，请重试');
    return false;
  }
};

const handleRemoveOne = async (selectedRow) => {
  const hide = message.loading('正在删除');
  if (!selectedRow) return true;
  try {
    const params = [selectedRow.postId];
    const resp = await removePost(params.join(','));
    hide();
    resp.code === 200 ? message.success('删除成功，即将刷新') : message.error(resp.msg);
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
    await exportPost();
    hide();
    message.success('导出成功');
    return true;
  } catch (error) {
    hide();
    message.error('导出失败，请重试');
    return false;
  }
};

const PostTableList = () => {
  const formTableRef = useRef<FormInstance>();
  const [modalVisible, setModalVisible] = useState(false);
  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState();
  const [selectedRows, setSelectedRows] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const access = useAccess();
  const intl = useIntl();

  useEffect(() => {
    getDictValueEnum('sys_normal_disable').then((data) => setStatusOptions(data));
  }, []);

  const columns = [
    { title: '岗位编号', dataIndex: 'postId', valueType: 'text' },
    { title: '岗位编码', dataIndex: 'postCode', valueType: 'text' },
    { title: '岗位名称', dataIndex: 'postName', valueType: 'text' },
    { title: '显示顺序', dataIndex: 'postSort', valueType: 'text', hideInSearch: true },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusOptions,
      render: (_, record) => <DictTag enums={statusOptions} value={record.status} />,
    },
    {
      title: '操作',
      dataIndex: 'option',
      width: '220px',
      valueType: 'option',
      render: (_, record) => [
        <Button
          type="link"
          size="small"
          key="edit"
          hidden={!access.hasPerms('system:post:edit')}
          onClick={() => {
            setModalVisible(true);
            setCurrentRow(record);
          }}
        >
          编辑
        </Button>,
        <Button
          type="link"
          size="small"
          danger
          key="remove"
          hidden={!access.hasPerms('system:post:remove')}
          onClick={() => {
            Modal.confirm({
              title: '删除',
              content: '确定删除该项吗？',
              okText: '确认',
              cancelText: '取消',
              onOk: async () => {
                const success = await handleRemoveOne(record);
                if (success) actionRef.current?.reload();
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
  <ProTable
  headerTitle="信息"
  actionRef={actionRef}
  formRef={formTableRef}
  rowKey="postId"
  search={{ labelWidth: 120 }}
  pagination={{
    pageSize: 10, // 每页显示10条数据
  }}
  request={(params) =>
    getPostList({
      ...params,
      pageNum: params.current, // 页码
      pageSize: params.pageSize, // 每页数据量，设为10
    }).then((res) => ({
      data: res.rows,
      total: res.total,
      success: true,
    }))
  }
  columns={columns}
  rowSelection={{
    onChange: (_, selectedRows) => setSelectedRows(selectedRows),
  }}
  toolBarRender={() => [
    <Button
      type="primary"
      key="add"
      hidden={!access.hasPerms('system:post:add')}
      onClick={() => {
        setCurrentRow(undefined);
        setModalVisible(true);
      }}
    >
      <PlusOutlined /> 新建
    </Button>,
    <Button
      type="primary"
      key="export"
      hidden={!access.hasPerms('system:post:export')}
      onClick={handleExport}
    >
      <PlusOutlined /> 导出
    </Button>,
  ]}
/>

      {selectedRows.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择 <a style={{ fontWeight: 600 }}>{selectedRows.length}</a> 项
            </div>
          }
        >
          <Button
            key="remove"
            danger
            hidden={!access.hasPerms('system:post:del')}
            onClick={async () => {
              Modal.confirm({
                title: '删除',
                content: '确定删除所选数据项吗？',
                okText: '确认',
                cancelText: '取消',
                onOk: async () => {
                  const success = await handleRemove(selectedRows);
                  if (success) {
                    setSelectedRows([]);
                    actionRef.current?.reloadAndRest?.();
                  }
                },
              });
            }}
          >
            批量删除
          </Button>
        </FooterToolbar>
      )}

      <UpdateForm
        onSubmit={async (values) => {
          const success = values.postId
            ? await handleUpdate(values)
            : await handleAdd(values);

          if (success) {
            setModalVisible(false);
            setCurrentRow(undefined);
            actionRef.current?.reload();
          }
        }}
        onCancel={() => {
          setModalVisible(false);
          setCurrentRow(undefined);
        }}
        open={modalVisible}
        values={currentRow || {}}
        statusOptions={statusOptions}
      />
    </PageContainer>
  );
};

export default PostTableList;
