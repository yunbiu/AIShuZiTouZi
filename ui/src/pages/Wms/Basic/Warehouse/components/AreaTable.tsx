import React from 'react';
import { Button } from 'antd';
import { ProColumns, ProTable } from '@ant-design/pro-components';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

export type AreaTableProps = {
  areaList: API.Yw.Area[];
  onAdd: () => void;
  onUpdate: (area: API.Yw.Area) => void;
  onDelete: (area: API.Yw.Area) => void;
  loading?: boolean;
  hasAddPerm?: boolean;
  hasEditPerm?: boolean;
  hasDeletePerm?: boolean;
};

const AreaTable: React.FC<AreaTableProps> = (props) => {
  const {
    areaList,
    onAdd,
    onUpdate,
    onDelete,
    loading,
    hasAddPerm = true,
    hasEditPerm = true,
    hasDeletePerm = true,
  } = props;

  const columns: ProColumns<API.Yw.Area>[] = [
    {
      title: '名称',
      dataIndex: 'areaName',
      valueType: 'text',
      onHeaderCell: () => ({
        style: { backgroundColor: '#e6f7ff' },
      }),
    },
    {
      title: '编号',
      dataIndex: 'areaCode',
      valueType: 'text',
    },
    {
      title: '备注',
      dataIndex: 'remark',
      valueType: 'text',
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
          hidden={!hasEditPerm}
          onClick={() => onUpdate(record)}
          icon={<EditOutlined />}
        >
          修改
        </Button>,
        <Button
          type="link"
          size="small"
          danger
          key="delete"
          hidden={!hasDeletePerm}
          onClick={() => onDelete(record)}
          icon={<DeleteOutlined />}
        >
          删除
        </Button>,
      ],
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' , backgroundColor:'lightgrey'}}>
        <span style={{ fontSize: '14px' }}>库区列表</span>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          hidden={!hasAddPerm}
          onClick={onAdd}
        >
          新增库区
        </Button>
      </div>
      <ProTable<API.Yw.Area>
        dataSource={areaList}
        columns={columns}
        rowKey="id"
        search={false}
        options={false}
        pagination={false}
        loading={loading}
      />
    </div>
  );
};

export default AreaTable;