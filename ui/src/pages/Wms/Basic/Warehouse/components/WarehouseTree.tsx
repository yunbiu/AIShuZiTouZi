import React from 'react';
import { Button, Tree } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';

export type WarehouseTreeProps = {
  warehouseList: API.Yw.Warehouse[];
  selectedWarehouseId: string;
  onSelect: (warehouseId: string) => void;
  onAdd: () => void;
  onUpdate: (warehouse: API.Yw.Warehouse) => void;
  onDelete: (warehouse: API.Yw.Warehouse) => void;
  onDrop: (info: any) => void;
  loading?: boolean;
  hasAddPerm?: boolean;
  hasEditPerm?: boolean;
  hasDeletePerm?: boolean;
};

const WarehouseTree: React.FC<WarehouseTreeProps> = (props) => {
  const {
    warehouseList,
    selectedWarehouseId,
    onSelect,
    onAdd,
    onUpdate,
    onDelete,
    onDrop,
    loading,
    hasAddPerm = true,
    hasEditPerm = true,
    hasDeletePerm = true,
  } = props;

  const renderWarehouseTreeTitle = (node: API.Yw.Warehouse) => {
    return (
      <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
        <span>
          {node.warehouseName}
          {node.warehouseCode && ` (编号：${node.warehouseCode})`}
        </span>
        <span>
          <Button
            type="link"
            size="small"
            danger
            hidden={!hasDeletePerm}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node);
            }}
            icon={<DeleteOutlined />}
          >
            删除
          </Button>
          <Button
            type="link"
            size="small"
            hidden={!hasEditPerm}
            onClick={(e) => {
              e.stopPropagation();
              onUpdate(node);
            }}
            icon={<EditOutlined />}
          >
            修改
          </Button>
        </span>
      </div>
    );
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px',  backgroundColor:'lightgrey'}}>
        <span style={{ fontSize: '14px' }}>仓库列表</span>
        <Button
          type="primary"
          size="small"
          icon={<PlusOutlined />}
          hidden={!hasAddPerm}
          onClick={onAdd}
        >
          新增仓库
        </Button>
      </div>
      <Tree
        treeData={warehouseList as any}
        fieldNames={{ key: 'id', title: 'warehouseName' }}
        selectedKeys={[selectedWarehouseId]}
        onSelect={(keys) => {
          if (keys.length > 0) {
            onSelect(keys[0] as string);
          }
        }}
        draggable
        blockNode
        titleRender={renderWarehouseTreeTitle as any}
        onDrop={onDrop}
      />
    </div>
  );
};

export default WarehouseTree;