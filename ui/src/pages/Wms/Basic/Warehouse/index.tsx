import React, { useState, useEffect } from 'react';
import { useAccess } from '@umijs/max';
import { message, Modal } from 'antd';
import { PageContainer } from '@ant-design/pro-components';
import { 
  listWarehouse, 
  delWarehouse, 
  addWarehouse, 
  updateWarehouse, 
  updateOrderNum 
} from '@/services/yw/warehouse';
import { 
  listArea, 
  delArea, 
  addArea, 
  updateArea 
} from '@/services/yw/area';
import EditDrawer, { AreaFormData } from './edit';
import WarehouseTree from './components/WarehouseTree';
import WarehouseModal from './components/WarehouseModal';
import AreaTable from './components/AreaTable';

const WarehouseAndArea: React.FC = () => {
  const [warehouseList, setWarehouseList] = useState<API.Yw.Warehouse[]>([]);
  const [areaList, setAreaList] = useState<API.Yw.Area[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('');
  const [warehouseModalVisible, setWarehouseModalVisible] = useState(false);
  const [areaDrawerVisible, setAreaDrawerVisible] = useState(false);
  const [currentWarehouse, setCurrentWarehouse] = useState<API.Yw.Warehouse>();
  const [currentArea, setCurrentArea] = useState<API.Yw.Area>();
  const [loading, setLoading] = useState(false);
  const access = useAccess();

  useEffect(() => {
    fetchWarehouses();
  }, []);

  useEffect(() => {
    if (warehouseList.length > 0 && !selectedWarehouseId) {
      const firstWarehouseId = warehouseList[0].id;
      setSelectedWarehouseId(firstWarehouseId);
      fetchAreas(firstWarehouseId);
    }
  }, [warehouseList]);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await listWarehouse({ pageSize: String(100) });
      setWarehouseList(res.rows);
    } catch (error) {
      message.error('获取仓库列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchAreas = async (warehouseId: string) => {
    setLoading(true);
    try {
      const res = await listArea({ warehouseId, pageSize: String(100) });
      setAreaList(res.rows);
    } catch (error) {
      message.error('获取库区列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseClick = (warehouseId: string) => {
    setSelectedWarehouseId(warehouseId);
    fetchAreas(warehouseId);
  };

  const handleAddWarehouse = () => {
    setCurrentWarehouse(undefined);
    setWarehouseModalVisible(true);
  };

  const handleUpdateWarehouse = (warehouse: API.Yw.Warehouse) => {
    setCurrentWarehouse(warehouse);
    setWarehouseModalVisible(true);
  };

  const handleDeleteWarehouse = (warehouse: API.Yw.Warehouse) => {
    Modal.confirm({
      title: '删除',
      content: `确认删除仓库【${warehouse.warehouseName}】吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          await delWarehouse(warehouse.id);
          hide();
          message.success('删除成功');
          await fetchWarehouses();
        } catch (error) {
          hide();
          if (error === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>仓库【{warehouse.warehouseName}】已有业务数据关联，不能删除！</div>
                  <div>请联系管理员处理！</div>
                </div>
              )
            });
          } else {
            message.error('删除失败，请重试');
          }
        }
      },
    });
  };

  const handleAddArea = () => {
    setCurrentArea({ warehouseId: selectedWarehouseId } as API.Yw.Area);
    setAreaDrawerVisible(true);
  };

  const handleUpdateArea = (area: API.Yw.Area) => {
    setCurrentArea(area);
    setAreaDrawerVisible(true);
  };

  const handleDeleteArea = (area: API.Yw.Area) => {
    Modal.confirm({
      title: '删除',
      content: `确认删除库区【${area.areaName}】吗？`,
      okText: '确认',
      cancelText: '取消',
      onOk: async () => {
        const hide = message.loading('正在删除');
        try {
          await delArea(area.id);
          hide();
          message.success('删除成功');
          fetchAreas(selectedWarehouseId);
        } catch (error) {
          hide();
          if (error === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>库区【{area.areaName}】已有业务数据关联，不能删除！</div>
                  <div>请联系管理员处理！</div>
                </div>
              )
            });
          } else {
            message.error('删除失败，请重试');
          }
        }
      },
    });
  };

  const handleWarehouseSubmit = async (values: API.Yw.Warehouse) => {
    const hide = message.loading(values.id ? '正在更新' : '正在添加');
    try {
      let resp;
      if (values.id) {
        resp = await updateWarehouse(values);
      } else {
        resp = await addWarehouse(values);
      }
      hide();
      if (resp.code === 200) {
        message.success(values.id ? '更新成功' : '添加成功');
        setWarehouseModalVisible(false);
        await fetchWarehouses();
      } else {
        message.error(resp.msg);
      }
    } catch (error) {
      hide();
      message.error(values.id ? '更新失败请重试！' : '添加失败请重试！');
    }
  };

  const handleAreaSubmit = async (values: AreaFormData) => {
    const hide = message.loading(values.id ? '正在更新' : '正在添加');
    try {
      let resp;
      if (values.id) {
        resp = await updateArea(values as API.Yw.Area);
      } else {
        resp = await addArea(values as API.Yw.Area);
      }
      hide();
      if (resp.code === 200) {
        message.success(values.id ? '更新成功' : '添加成功');
        setAreaDrawerVisible(false);
        fetchAreas(selectedWarehouseId);
      } else {
        message.error(resp.msg);
      }
    } catch (error) {
      hide();
      message.error(values.id ? '更新失败请重试！' : '添加失败请重试！');
    }
  };

  const handleWarehouseDrop = async (info: any) => {
    const { dragNode, dropNode, dropPosition } = info;
    if (dragNode.level === dropNode.level && dropPosition !== 0) {
      try {
        await updateOrderNum(dragNode.parent.data);
        message.success('排序更新成功');
        fetchWarehouses();
      } catch (error) {
        message.error('排序更新失败');
      }
    }
  };

  return (
    <PageContainer loading={loading}>
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ width: '450px' }}>
          <WarehouseTree
            warehouseList={warehouseList}
            selectedWarehouseId={selectedWarehouseId}
            onSelect={handleWarehouseClick}
            onAdd={handleAddWarehouse}
            onUpdate={handleUpdateWarehouse}
            onDelete={handleDeleteWarehouse}
            onDrop={handleWarehouseDrop}
            hasAddPerm={access.hasPerms('wms:warehouse:add')}
            hasEditPerm={access.hasPerms('wms:warehouse:edit')}
            hasDeletePerm={access.hasPerms('wms:warehouse:remove')}
          />
        </div>
        <div style={{ flex: 1 }}>
          <AreaTable
            areaList={areaList}
            onAdd={handleAddArea}
            onUpdate={handleUpdateArea}
            onDelete={handleDeleteArea}
            hasAddPerm={access.hasPerms('wms:area:add')}
            hasEditPerm={access.hasPerms('wms:area:edit')}
            hasDeletePerm={access.hasPerms('wms:area:remove')}
          />
        </div>
      </div>

      {/* Warehouse Modal */}
      <WarehouseModal
        visible={warehouseModalVisible}
        onClose={() => setWarehouseModalVisible(false)}
        onSubmit={handleWarehouseSubmit}
        values={currentWarehouse || {}}
      />

      {/* Area Drawer */}
      <EditDrawer
        onSubmit={handleAreaSubmit}
        onClose={() => setAreaDrawerVisible(false)}
        visible={areaDrawerVisible}
        values={currentArea || {}}
      />
    </PageContainer>
  );
};

export default WarehouseAndArea;