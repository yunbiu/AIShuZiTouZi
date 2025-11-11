import React, { useState, useEffect } from 'react';
import { Cascader } from 'antd';
import type { CascaderProps } from 'antd';
// 直接引入 API 服务
import { listWarehouseNoPage } from '@/services/yw/warehouse';
import { listAreaNoPage } from '@/services/yw/area';

interface WarehouseCascaderProps {
  value?: (string | number)[] | string | number;
  onChange?: (value: (string | number)[] | string | number) => void;
  size?: 'large' | 'middle' | 'small';
  showAllLevels?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  multiple?: boolean;
}

const WarehouseCascader: React.FC<WarehouseCascaderProps> = (props) => {
  const {
    value,
    onChange,
    size = 'middle',
    showAllLevels = false,
    disabled = false,
    clearable = true,
    multiple = false,
  } = props;

  const [areaList, setAreaList] = useState<any[]>([]);
  const [warehouseList, setWarehouseList] = useState<any[]>([]);
  const [options, setOptions] = useState<any[]>([]);
  const [selections, setSelections] = useState<(string | number)[] | string | number>(value || []);

  useEffect(() => {
    setSelections(value || []);
  }, [value]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [warehouseRes, areaRes] = await Promise.all([
          listWarehouseNoPage({}),
          listAreaNoPage({})
        ]);
        setWarehouseList(warehouseRes.data);
        setAreaList(areaRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const updateOptions = () => {
      let areaMap = new Map();
      let warehouseMap = new Map();

      areaList.forEach((area) => {
        let children = warehouseMap.get(area.warehouseId);
        if (!children) {
          children = [];
          warehouseMap.set(area.warehouseId, children);
        }
        children.push({
          value: area.id,
          label: area.areaName,
          children: areaMap.get(area.id),
        });
      });

      const tempOptions = warehouseList.map((warehouse) => {
        return {
          value: warehouse.id,
          label: warehouse.warehouseName,
          children: warehouseMap.get(warehouse.id),
        };
      });

      if (!showAllLevels) {
        setOptions(tempOptions.filter(it => it.children));
      } else {
        setOptions(tempOptions);
      }
    };

    updateOptions();
  }, [warehouseList, areaList, showAllLevels]);

  const handleChange = (value: any) => {
    setSelections(value);
    if (onChange) {
      onChange(value);
    }
  };

  const handleVisibleChange = (visible: boolean) => {
    if (visible) {
      // 可以根据需要添加逻辑
    }
  };

  const onClickAdd = () => {
    window.open('/system/warehouse', '_blank');
  };

  const onClickRefresh = () => {
    const fetchData = async () => {
      try {
        const [warehouseRes, areaRes] = await Promise.all([
          listWarehouseNoPage({}),
          listAreaNoPage({})
        ]);
        setWarehouseList(warehouseRes.data);
        setAreaList(areaRes.data);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
    };

    fetchData();
  };

  return (
    <>
      <Cascader
        placeholder="请选择仓库信息"
        options={options}
        value={selections}
        onChange={handleChange}
        changeOnSelect={!showAllLevels}
        multiple={multiple}
        allowClear={clearable}
        size={size}
        disabled={disabled}
        showCheckedStrategy={showAllLevels ? Cascader.SHOW_CHILD : Cascader.SHOW_PARENT}
        showSearch
        onDropdownVisibleChange={handleVisibleChange}
      />
    </>
  );
};

export default WarehouseCascader;