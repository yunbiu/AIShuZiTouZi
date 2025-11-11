import React, { useState, useRef, useEffect } from 'react';
import { useIntl, FormattedMessage, useAccess } from '@umijs/max';
import { Button, message, Modal } from 'antd';
import { ActionType, PageContainer, ProColumns, ProTable } from '@ant-design/pro-components';
import { PlusOutlined, DeleteOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { getOperlogList, removeOperlog, addOperlog, updateOperlog, cleanAllOperlog, exportOperlog } from '@/services/monitor/operlog';
import UpdateForm from './detail';
import { getDictValueEnum } from '@/services/system/dict';
import DictTag from '@/components/DictTag';

const OperlogTableList: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [businessTypeOptions, setBusinessTypeOptions] = useState<any>([]);
  const [operatorTypeOptions, setOperatorTypeOptions] = useState<any>([]);
  const [statusOptions, setStatusOptions] = useState<any>([]);

  const access = useAccess();
  const intl = useIntl();

  useEffect(() => {
    getDictValueEnum('sys_oper_type', true).then(setBusinessTypeOptions);
    getDictValueEnum('sys_oper_type', true).then(setOperatorTypeOptions);
    getDictValueEnum('sys_common_status', true).then(setStatusOptions);
  }, []);

  const columns: ProColumns<API.Monitor.Operlog>[] = [
    { title: '日志主键', dataIndex: 'operId', valueType: 'text', hideInSearch: true },
    { title: '操作模块', dataIndex: 'title', valueType: 'text' },
    { title: '业务类型', dataIndex: 'businessType', valueType: 'select', valueEnum: businessTypeOptions },
    { title: '请求方式', dataIndex: 'requestMethod', valueType: 'text' },
    { title: '操作类别', dataIndex: 'operatorType', valueType: 'select', valueEnum: operatorTypeOptions },
    { title: '操作人员', dataIndex: 'operName', valueType: 'text' },
    { title: '主机地址', dataIndex: 'operIp', valueType: 'text' },
    { title: '操作地点', dataIndex: 'operLocation', valueType: 'text' },
    { title: '操作状态', dataIndex: 'status', valueType: 'select', valueEnum: statusOptions },
    { title: '操作时间', dataIndex: 'operTime', valueType: 'dateTime' },
  ];

  return (
    <PageContainer>
    <ProTable<API.Monitor.Operlog>
  headerTitle="信息"
  actionRef={actionRef}
  rowKey="operId"
  pagination={{
    pageSize: 20, // 默认每页显示20条数据
    showSizeChanger: true, // 启用选择每页显示条数的功能
    pageSizeOptions: ['10', '20', '30', '50'], // 允许选择的每页条数
    onChange: (page, pageSize) => {
      // 可选：这里可以加入改变每页条数时的处理逻辑
      console.log(`Page: ${page}, Page Size: ${pageSize}`);
    },
  }}
  request={(params) => {
    return getOperlogList({
      pageNum: params.current, // 当前页码
      pageSize: params.pageSize || 20, // 使用选择的每页条数
    }).then((res) => ({
      data: res.rows,
      total: res.total,
      success: true,
    }));
  }}
  columns={columns}
  rowSelection={{}}
/>

    </PageContainer>
  );
};

export default OperlogTableList;
