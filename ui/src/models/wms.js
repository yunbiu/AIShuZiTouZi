// src/models/wms.js
import { listWarehouseNoPage } from '../services/yw/warehouse';
import { listAreaNoPage } from '../services/yw/area';
import { listMerchantNoPage } from "../services/yw/merchant";
import { listItemCategory, treeSelectItemCategory } from "../services/yw/itemCategory";
import { listItemBrand } from "../services/yw/itemBrand";
import { useState, useCallback } from 'react';

export default function useWmsModel() {
  // 仓库管理
  const [warehouseList, setWarehouseList] = useState([]);
  const [warehouseMap, setWarehouseMap] = useState(new Map());

  const getWarehouseList = useCallback(() => {
    listWarehouseNoPage({}).then((res) => {
      setWarehouseList(res.data);
      const map = new Map();
      res.data.forEach((supplier) => {
        map.set(supplier.id, supplier);
      });
      setWarehouseMap(map);
    });
  }, []);

  // 库区管理
  const [areaList, setAreaList] = useState([]);
  const [areaMap, setAreaMap] = useState(new Map());

  const getAreaList = useCallback(() => {
    listAreaNoPage({}).then((res) => {
      setAreaList(res.data);
      const map = new Map();
      res.data.forEach((supplier) => {
        map.set(supplier.id, supplier);
      });
      setAreaMap(map);
    });
  }, []);

  // 企业管理
  const [merchantList, setMerchantList] = useState([]);
  const [merchantMap, setMerchantMap] = useState(new Map());

  const getMerchantList = useCallback(() => {
    listMerchantNoPage({}).then((res) => {
      setMerchantList(res.data);
      const map = new Map();
      res.data.forEach((supplier) => {
        map.set(supplier.id, supplier);
      });
      setMerchantMap(map);
    });
  }, []);

  // 商品分类管理
  const [itemCategoryList, setItemCategoryList] = useState([]);
  const [itemCategoryTreeList, setItemCategoryTreeList] = useState([]);
  const [itemCategoryMap, setItemCategoryMap] = useState(new Map());

  const getItemCategoryList = useCallback(() => {
    return new Promise((resolve, reject) => {
      listItemCategory({}).then(res => {
        setItemCategoryList(res.data);
        const map = new Map();
        res.data.forEach(supplier => {
          map.set(supplier.id, supplier);
        });
        setItemCategoryMap(map);
        resolve();
      }).catch(() => reject());
    });
  }, []);

  const getItemCategoryTreeList = useCallback(() => {
    return new Promise((resolve, reject) => {
      treeSelectItemCategory().then(res => {
        setItemCategoryTreeList(res.data);
        resolve();
      }).catch(() => reject());
    });
  }, []);

  // 商品品牌管理
  const [itemBrandList, setItemBrandList] = useState([]);
  const [itemBrandMap, setItemBrandMap] = useState(new Map());

  const getItemBrandList = useCallback(() => {
    return new Promise((resolve, reject) => {
      listItemBrand({}).then(res => {
        setItemBrandList(res.data);
        const map = new Map();
        res.data.forEach(supplier => {
          map.set(supplier.id, {...supplier});
        });
        setItemBrandMap(map);
        resolve();
      }).catch(() => reject());
    });
  }, []);

  return {
    // 仓库管理
    warehouseList,
    warehouseMap,
    getWarehouseList,
    // 库区管理
    areaList,
    areaMap,
    getAreaList,
    // 企业管理
    merchantList,
    merchantMap,
    getMerchantList,
    // 商品分类管理
    itemCategoryList,
    itemCategoryTreeList,
    itemCategoryMap,
    getItemCategoryList,
    getItemCategoryTreeList,
    // 商品品牌管理
    itemBrandList,
    itemBrandMap,
    getItemBrandList
  };
}