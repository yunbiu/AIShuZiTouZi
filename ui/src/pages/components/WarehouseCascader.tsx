import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useModel, history } from '@umijs/max';
import { Cascader, Button } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import type { CascaderProps } from 'antd';

interface WarehouseCascaderProps {
  value?: string | number | (string | number)[];
  onChange?: (value: string | number | (string | number)[]) => void;
  size?: 'large' | 'middle' | 'small';
  showAllLevels?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}

interface WarehouseCascaderRef {
  refresh: () => void;
}

const WarehouseCascader = forwardRef<WarehouseCascaderRef, WarehouseCascaderProps>((props, ref) => {
  const { 
    value, 
    onChange, 
    size = 'middle', 
    showAllLevels = false, 
    disabled = false, 
    clearable = true, 
    multiple = false 
  } = props;
  
  const { areaList, warehouseList, getWarehouseList, getAreaList } = useModel('wms');
  const [options, setOptionsState] = useState<CascaderProps['options']>([]);
  const [dropdownVisible, setDropdownVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    refresh: () => {
      getWarehouseList();
      getAreaList();
    },
  }));

  useEffect(() => {
    updateOptions();
  }, [warehouseList, areaList]);

  const updateOptions = () => {
    const areaMap = new Map();
    const warehouseMap = new Map();

    areaList.forEach((area) => {
      const children = warehouseMap.get(area.warehouseId) || [];
      children.push({
        value: area.id,
        label: area.areaName,
      });
      warehouseMap.set(area.warehouseId, children);
    });

    const tempOptions = warehouseList.map((warehouse) => ({
      value: warehouse.id,
      label: warehouse.warehouseName,
      children: warehouseMap.get(warehouse.id),
    }));

    setOptionsState(showAllLevels ? tempOptions : tempOptions.filter(it => it.children));
  };

  const handleVisibleChange = (visible: boolean) => {
    setDropdownVisible(visible);
  };

  const handleAdd = () => {
    history.push('/system/warehouse');
    setDropdownVisible(false);
  };

  const handleRefresh = () => {
    getWarehouseList();
    getAreaList();
    setDropdownVisible(false);
  };

  const dropdownRender = (menu: React.ReactNode) => (
    <div>
      {menu}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '8px',
        borderTop: '1px solid #f0f2f5'
      }}>
        <Button 
          type="link" 
          icon={<PlusOutlined />} 
          onClick={handleAdd}
        >
          新增
        </Button>
        <Button 
          type="link" 
          icon={<ReloadOutlined />} 
          onClick={handleRefresh}
        >
          刷新
        </Button>
      </div>
    </div>
  );

  return (
    <Cascader
      placeholder="请选择仓库信息"
      options={options}
      value={value}
      onChange={onChange}
      multiple={multiple}
      allowClear={clearable}
      size={size}
      disabled={disabled}
      showCheckedStrategy={showAllLevels ? Cascader.SHOW_CHILD : Cascader.SHOW_PARENT}
      dropdownRender={dropdownRender}
      onDropdownVisibleChange={handleVisibleChange}
      showSearch={{
        filter: (inputValue, path) => {
          return path.some(option => 
            option.label.toLowerCase().indexOf(inputValue.toLowerCase()) > -1
          );
        }
      }}
    />
  );
});

export default WarehouseCascader;