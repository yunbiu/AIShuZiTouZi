import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage, useAccess } from '@umijs/max';
import type { FormInstance } from 'antd';
import { Button, message, Modal } from 'antd';
import { ActionType, FooterToolbar, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined, UnlockOutlined } from '@ant-design/icons';
import { getLogininforList, removeLogininfor, exportLogininfor, unlockLogininfor, cleanLogininfor } from '@/services/monitor/logininfor';
import DictTag from '@/components/DictTag';
import { getDictValueEnum } from '@/services/system/dict';

const LogininforTableList: React.FC = () => {
  const formTableRef = useRef<FormInstance>();
  const actionRef = useRef<ActionType>();
  const [selectedRows, setSelectedRows] = useState<API.Monitor.Logininfor[]>([]);
  const [statusOptions, setStatusOptions] = useState<any>([]);

  const access = useAccess();

  /** 国际化配置 */
  const intl = useIntl();

  useEffect(() => {
    getDictValueEnum('sys_common_status', true).then((data) => {
      setStatusOptions(data);
    });
  }, []);

  const columns: ProColumns<API.Monitor.Logininfor>[] = [
    { title: '访问编号', dataIndex: 'infoId', valueType: 'text', hideInSearch: true },
    { title: '用户账号', dataIndex: 'userName', valueType: 'text' },
    { title: '登录IP地址', dataIndex: 'ipaddr', valueType: 'text' },
    { title: '登录地点', dataIndex: 'loginLocation', valueType: 'text', hideInSearch: true },
    { title: '浏览器类型', dataIndex: 'browser', valueType: 'text', hideInSearch: true },
    { title: '操作系统', dataIndex: 'os', valueType: 'text', hideInSearch: true },
    {
      title: '登录状态',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: statusOptions,
      render: (_, record) => <DictTag enums={statusOptions} value={record.status} />,
    },
    { title: '提示消息', dataIndex: 'msg', valueType: 'text', hideInSearch: true },
    { title: '访问时间', dataIndex: 'loginTime', valueType: 'dateTime' },
  ];

  return (
    <PageContainer>
  <ProTable<API.Monitor.Logininfor>
  headerTitle="信息"
  actionRef={actionRef}
  formRef={formTableRef}
  rowKey="infoId"
  key="logininforList"
  pagination={{
    defaultPageSize: 20, // 默认每页显示 20 条
    showSizeChanger: true, // 启用选择每页条数的功能

  }}
  request={(params) =>
    getLogininforList({
      ...params,
      pageNum: params.current, // 当前页码
      pageSize: params.pageSize || 20, // 使用选择的每页条数
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
/>

    </PageContainer>
  );
};

export default LogininforTableList;
