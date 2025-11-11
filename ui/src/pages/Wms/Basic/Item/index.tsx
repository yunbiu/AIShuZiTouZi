// src/pages/item/index.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useIntl, useAccess, useModel } from '@umijs/max';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Table, 
  Tree, 
  TreeSelect, 
  InputNumber,
  Drawer,
  Modal,
  message,
  Space,
  Row,
  Col
} from 'antd';
import type { TreeProps, TreeDataNode } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined } from '@ant-design/icons';
import { 
  getItem, 
  delItem, 
  addItem, 
  updateItem,

} from '@/services/yw/item';
import { listItemBrand } from '@/services/yw/itemBrand';
import { listItemCategoryPage, listItemCategory, treeSelectItemCategory, getItemCategory, addItemCategory, updateItemCategory, delItemCategory, updateOrderNum } from '@/services/yw/itemCategory';
import { listItemSkuPage,delItemSku,updateItemSku,addItemSku } from '@/services/yw/itemSku';
import styles from './index.less';

const { TextArea } = Input;
const { Option } = Select;

interface Item {
  id: string;
  itemCode: string;
  itemName: string;
  itemCategory: string;
  unit: string;
  itemBrand: string;
  remark: string;
  sku: ItemSku[];
}

interface ItemSku {
  id?: string;
  skuName: string;
  itemId?: string;
  barcode: string;
  skuCode: string;
  length?: number;
  width?: number;
  height?: number;
  grossWeight?: number;
  netWeight?: number;
  costPrice?: number;
  sellingPrice?: number;
}

interface ItemCategory {
  id: string;
  parentId: string;
  categoryName: string;
  orderNum: number;
  status: string;
}

const ItemPage: React.FC = () => {
  const [form] = Form.useForm();
  const [skuForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [queryParams, setQueryParams] = useState({
    pageNum: 1,
    pageSize: 10,
    itemCode: undefined,
    itemName: undefined,
    itemBrand: undefined,
    itemCategory: undefined
  });
  const [formData, setFormData] = useState<Partial<Item>>({});
  const [skuFormData, setSkuFormData] = useState<{itemSkuList: ItemSku[]}>({ itemSkuList: [] });
  const [categoryFormData, setCategoryFormData] = useState<Partial<ItemCategory>>({});
  const [itemList, setItemList] = useState<any[]>([]);
  const [categoryTree, setCategoryTree] = useState<TreeDataNode[]>([]);
  const [categoryTreeSelect, setCategoryTreeSelect] = useState<TreeDataNode[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [drawerTitle, setDrawerTitle] = useState('');
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryModalTitle, setCategoryModalTitle] = useState('');
  const [currentCategory, setCurrentCategory] = useState('');
  const [showParent, setShowParent] = useState(false);
  
  const { initialState } = useModel('@@initialState');
  const { wmsStore } = initialState || {};
  const access = useAccess();
  const intl = useIntl();

  // 获取商品列表
  const fetchItemList = async () => {
    setLoading(true);
    try {
      const res = await listItemSkuPage(queryParams);
      setItemList(res.rows);
      setTotal(res.total);
    } catch (error) {
      message.error('获取商品列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  // 获取商品分类树
  const fetchCategoryTree = async () => {
    try {
      const res = await treeSelectItemCategory();
      const data = [...res.data];
      const treeSelectData = [...res.data];
      data.unshift({
        id: '-1',
        label: '全部',
        key: '-1',
        children: []
      });
      setCategoryTree(data);
      setCategoryTreeSelect(treeSelectData);
      
    } catch (error) {
      message.error('获取分类树失败');
    }
  };
  
  useEffect(() => {
    fetchItemList();
    fetchCategoryTree();
  }, [queryParams]);

  // 查询
  const handleQuery = () => {
    setQueryParams(prev => ({
      ...prev,
      pageNum: 1
    }));
  };
  
  // 重置查询
  const resetQuery = () => {
    form.resetFields();
    setQueryParams({
      pageNum: 1,
      pageSize: 10,
      itemCode: undefined,
      itemName: undefined,
      itemBrand: undefined,
      itemCategory: undefined
    });
  };
  
  // 选择分类
  const handleQueryType = (selectedKeys: React.Key[], info: any) => {
    const node = info.node;
    setQueryParams({
      ...queryParams,
      itemCategory: node.id === '-1' ? '' : node.id,
      pageNum: 1
    });
    setCurrentCategory(node.id === '-1' ? '' : node.id);
  };
  
  // 新增商品
  const handleAdd = () => {
    setDrawerTitle('新增商品');
    setFormData({});
    setSkuFormData({ 
      itemSkuList: [{
        skuName: '',
        barcode: '',
        skuCode: '',
        length: undefined,
        width: undefined,
        height: undefined,
        grossWeight: undefined,
        netWeight: undefined,
        costPrice: undefined,
        sellingPrice: undefined
      }] 
    });
    setDrawerVisible(true);
  };
  
  // 修改商品
  const handleUpdate = async (row: any) => {
    setDrawerTitle('修改商品');
    try {
      const res = await getItem(row.itemId);
      setFormData(res.data);
      setSkuFormData({ itemSkuList: res.data.sku || [] });
      setDrawerVisible(true);
    } catch (error) {
      message.error('获取商品信息失败');
    }
  };
  
  // 删除商品
  const handleDelete = async (row: any) => {
    Modal.confirm({
      title: `确认删除商品【${row.item.itemName}】吗？`,
      onOk: async () => {
        try {
          await delItem(row.itemId);
          message.success('删除成功');
          fetchItemList();
        } catch (error) {
          if (error === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>商品【{row.item.itemName}】已有业务数据关联，不能删除！</div>
                  <div>请联系管理员处理！</div>
                </div>
              )
            });
          }
        }
      }
    });
  };
  
  // 提交商品表单
  const submitForm = async () => {
    try {
      const values = await form.validateFields();
      await skuForm.validateFields();
      
      if (skuFormData.itemSkuList.length === 0) {
        message.error('至少包含一个商品规格');
        return;
      }
      
      setButtonLoading(true);
      const data = {
        ...values,
        sku: skuFormData.itemSkuList
      };
      
      if (formData.id) {
        await updateItem(data);
      } else {
        await addItem(data);
      }
      
      message.success('操作成功');
      setDrawerVisible(false);
      fetchItemList();
    } catch (error) {
      console.error('表单验证失败:', error);
    } finally {
      setButtonLoading(false);
    }
  };
  
  // 新增分类
  const handleAddType = (show: boolean) => {
    setCategoryModalTitle('新增商品分类');
    setShowParent(show);
    if (show) {
      categoryForm.setFieldsValue({ parentId: undefined });
    }
    setCategoryModalVisible(true);
  };
  
  // 编辑分类
  const editCategory = (node: any) => {
    setCategoryModalTitle('修改商品分类');
    if (node.parent) {
      categoryForm.setFieldsValue({ parentId: node.parent.id });
    }
    categoryForm.setFieldsValue({
      id: node.id,
      categoryName: node.label
    });
    setCategoryModalVisible(true);
  };
  
  // 删除分类
  const removeCategory = async (node: any) => {
    Modal.confirm({
      title: `确认删除分类【${node.label}】吗？`,
      onOk: async () => {
        try {
          await removeCategory(node.id);
          message.success('删除成功');
          fetchCategoryTree();
        } catch (error) {
          message.error('删除失败');
        }
      }
    });
  };
  
  // 提交分类表单
  const submitCategoryForm = async () => {
    try {
      const values = await categoryForm.validateFields();
      setButtonLoading(true);
      
      if (values.id) {
        await updateItemCategory(values);
      } else {
        await addItemCategory(values);
      }
      
      message.success(values.id ? '修改成功' : '新增成功');
      setCategoryModalVisible(false);
      fetchCategoryTree();
    } catch (error) {
      console.error('分类表单验证失败:', error);
    } finally {
      setButtonLoading(false);
    }
  };
  
  // 添加SKU
  const onAppendBtnClick = () => {
    setSkuFormData(prev => ({
      itemSkuList: [
        ...prev.itemSkuList,
        {
          skuName: '',
          barcode: '',
          skuCode: '',
          length: undefined,
          width: undefined,
          height: undefined,
          grossWeight: undefined,
          netWeight: undefined,
          costPrice: undefined,
          sellingPrice: undefined
        }
      ]
    }));
  };
  
  // 删除SKU
  const handleDeleteItemSku = async (row: ItemSku, index: number) => {
    if (!row.id) {
      setSkuFormData(prev => ({
        itemSkuList: prev.itemSkuList.filter((_, i) => i !== index)
      }));
      return;
    }
    
    if (skuFormData.itemSkuList.length === 1) {
      message.error('至少包含一个商品规格');
      return;
    }
    
    Modal.confirm({
      title: `确认删除规格【${row.skuName}】吗？`,
      onOk: async () => {
        try {
          await delItemSku(row.id!);
          message.success('删除成功');
          if (formData.id) {
            const res = await getItem(formData.id);
            setSkuFormData({ itemSkuList: res.data.sku });
            setFormData(res.data);
          }
        } catch (error) {
          if (error === 409) {
            Modal.error({
              title: '系统提示',
              content: (
                <div>
                  <div>规格【{row.skuName}】已有业务数据关联，不能删除！</div>
                  <div>请联系管理员处理！</div>
                </div>
              )
            });
          }
        }
      }
    });
  };
  
  // 树节点拖拽
  const handleNodeDrop: TreeProps['onDrop'] = async (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    
    if (info.node.level === 1) {
      await updateItemCategoryOrderNum(info.node.parent.children.filter((it: any) => it.id !== '-1'));
    } else {
      await updateItemCategoryOrderNum(info.node.parent.children);
    }
  };
  
  // 树节点拖拽校验
  const collapse = (draggingNode: any, dropNode: any, type: string) => {
    if (draggingNode.label !== '全部' && 
        draggingNode.level === dropNode.level && 
        draggingNode.parent.id === dropNode.parent.id) {
      if (dropNode.label === '全部') {
        return type === 'next';
      } else {
        return type === 'prev' || type === 'next';
      }
    } else {
      return false;
    }
  };
  
  // 获取体积文本
  const getVolumeText = (row: any) => {
    if ((row.length || row.length === 0) && 
        (row.width || row.width === 0) && 
        (row.height || row.height === 0)) {
      return `${row.length} * ${row.width} * ${row.height}`;
    }
    return ((row.length || row.length === 0) ? (`长：${row.length}`) : '') +
           ((row.width || row.width === 0) ? (` 宽：${row.width}`) : '') +
           ((row.height || row.height === 0) ? (` 高：${row.height}`) : '');
  };
  
  // 树节点渲染
  const renderTreeNodes = (data: TreeDataNode[]) => {
    return data.map((node) => {
      const item = {
        ...node,
        title: (
          <span className={styles.customTreeNode}>
            <span>{node.label}</span>
            <span>
              {node.label !== '全部' && node.level < 2 && (
                <Button 
                  type="link" 
                  icon={<PlusOutlined />} 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    categoryForm.setFieldsValue({ parentId: node.key });
                    setCategoryModalTitle('新增商品分类');
                    setCategoryModalVisible(true);
                  }}
                >
                  新增子分类
                </Button>
              )}
              {node.label !== '全部' && (
                <>
                  <Button 
                    type="link" 
                    icon={<DeleteOutlined />} 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeCategory(node);
                    }}
                  >
                    删除
                  </Button>
                  <Button 
                    type="link" 
                    icon={<EditOutlined />} 
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      editCategory(node);
                    }}
                  >
                    修改
                  </Button>
                </>
              )}
            </span>
          </span>
        )
      };
      
      if (node.children) {
        item.children = renderTreeNodes(node.children);
      }
      
      return item;
    });
  };
  
  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'item',
      render: (item: any, record: any) => (
        <div>
          <div>{item.itemName}{item.itemCode ? `(${item.itemCode})` : ''}</div>
          {item.itemBrand && (
            <div>品牌：{wmsStore?.itemBrandMap.get(item.itemBrand)?.brandName}</div>
          )}
          {item.itemCategory && (
            <div>分类：{wmsStore?.itemCategoryMap.get(item.itemCategory)?.categoryName}</div>
          )}
        </div>
      )
    },
    {
      title: '规格信息',
      dataIndex: 'skuName',
      render: (text: string, record: any) => (
        <div>
          <div>{record.skuName}</div>
          {record.skuCode && <div>编号：{record.skuCode}</div>}
          {record.barcode && <div>条码：{record.barcode}</div>}
        </div>
      )
    },
    {
      title: '价格(元)',
      width: 160,
      render: (record: any) => (
        <>
          {record.costPrice && (
            <div className={styles.flexSpaceBetween}>
              <span>成本价：</span>
              <div>{record.costPrice}</div>
            </div>
          )}
          {record.sellingPrice && (
            <div className={styles.flexSpaceBetween}>
              <span>销售价：</span>
              <div>{record.sellingPrice}</div>
            </div>
          )}
        </>
      )
    },
    {
      title: '重量(kg)',
      width: 160,
      render: (record: any) => (
        <>
          {record.netWeight && (
            <div className={styles.flexSpaceBetween}>
              <span>净重：</span>
              <div>{record.netWeight}</div>
            </div>
          )}
          {record.grossWeight && (
            <div className={styles.flexSpaceBetween}>
              <span>毛重：</span>
              <div>{record.grossWeight}</div>
            </div>
          )}
        </>
      )
    },
    {
      title: '长宽高(cm)',
      width: 250,
      align: 'right' as const,
      render: (record: any) => (
        <div>{getVolumeText(record)}</div>
      )
    },
    {
      title: '操作',
      width: 200,
      align: 'right' as const,
      render: (record: any) => (
        <Space>
          <Button 
            type="link" 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
          >
            删除
          </Button>
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleUpdate(record)}
          >
            修改
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className={styles.appContainer}>
      <Card>
        <Form layout="inline" form={form}>
          <Form.Item label="商品编号" name="itemCode">
            <Input 
              placeholder="请输入商品编号" 
              value={queryParams.itemCode}
              onChange={(e) => setQueryParams({...queryParams, itemCode: e.target.value})}
              onPressEnter={handleQuery}
            />
          </Form.Item>
          <Form.Item label="商品名称" name="itemName">
            <Input 
              placeholder="请输入商品名称" 
              value={queryParams.itemName}
              onChange={(e) => setQueryParams({...queryParams, itemName: e.target.value})}
              onPressEnter={handleQuery}
            />
          </Form.Item>
          <Form.Item label="商品品牌" name="itemBrand">
            <Select 
              placeholder="请选择商品品牌"
              style={{ width: 200 }}
              allowClear
              showSearch
              value={queryParams.itemBrand}
              onChange={(value) => setQueryParams({...queryParams, itemBrand: value})}
            >
              {wmsStore?.itemBrandList.map((item: any) => (
                <Option key={item.id} value={item.id}>{item.brandName}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery}>
              搜索
            </Button>
            <Button icon={<ReloadOutlined />} onClick={resetQuery} style={{ marginLeft: 8 }}>
              重置
            </Button>
          </Form.Item>
        </Form>
      </Card>
      
      <Card className={styles.mt20}>
        <Row gutter={16}>
          <Col span={6}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 18, lineHeight: '18px' }}>商品分类</span>
              <Button 
                className={styles.mr10}
                style={{ fontSize: 12, lineHeight: '14px' }}
                icon={<PlusOutlined />}
                onClick={() => handleAddType(false)}
              >
                新增分类
              </Button>
            </div>
            <Tree
              treeData={renderTreeNodes(categoryTree)}
              defaultExpandAll
              showLine
              draggable
              blockNode
              onSelect={handleQueryType}
              onDrop={handleNodeDrop}
              allowDrop={({ dropNode, dragNode }) => collapse(dragNode, dropNode, '')}
              style={{ width: '100%' }}
              className={styles.mr10}
            />
          </Col>
          
          <Col span={18}>
            <div style={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 18 }}>商品列表</span>
              <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                新增商品
              </Button>
            </div>
            
            <Table
              columns={columns}
              dataSource={itemList}
              rowKey="id"
              loading={loading}
              bordered
              pagination={{
                total,
                current: queryParams.pageNum,
                pageSize: queryParams.pageSize,
                onChange: (page, pageSize) => {
                  setQueryParams({
                    ...queryParams,
                    pageNum: page,
                    pageSize
                  });
                }
              }}
            />
          </Col>
        </Row>
      </Card>
      
      {/* 商品表单抽屉 */}
      <Drawer
        title={drawerTitle}
        width="80%"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setDrawerVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={buttonLoading} onClick={submitForm}>
              确定
            </Button>
          </div>
        }
      >
        <Card>
          <Form form={form} layout="vertical">
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="商品名称" name="itemName" rules={[{ required: true, message: '请输入名称' }]}>
                  <Input placeholder="请输入名称" />
                </Form.Item>
              </Col>
              <Col span={10}>
                <Form.Item label="商品分类" name="itemCategory" rules={[{ required: true, message: '请选择分类' }]}>
                  <TreeSelect
                    treeData={categoryTreeSelect}
                    placeholder="请选择分类"
                    style={{ width: '100%' }}
                    fieldNames={{ label: 'title', value: 'key', children: 'children' }}
                  />
                </Form.Item>
              </Col>
              <Col span={1}>
                <Button 
                  type="link" 
                  icon={<PlusOutlined />} 
                  style={{ height: 32, lineHeight: '32px' }}
                  onClick={() => handleAddType(true)}
                >
                  新增分类
                </Button>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="商品编号" name="itemCode">
                  <Input placeholder="请输入编号" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="商品单位" name="unit">
                  <Input placeholder="请输入单位类别" />
                </Form.Item>
              </Col>
            </Row>
            
            <Row gutter={24}>
              <Col span={12}>
                <Form.Item label="商品品牌" name="itemBrand">
                  <Select 
                    placeholder="请选择商品品牌"
                    style={{ width: '100%' }}
                    allowClear
                    showSearch
                  >
                    {wmsStore?.itemBrandList.map((item: any) => (
                      <Option key={item.id} value={item.id}>{item.brandName}</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>
        
        <Card title="规格" className={styles.mt20}>
          <Form form={skuForm}>
            <Table
              dataSource={skuFormData.itemSkuList}
              bordered
              pagination={false}
              footer={() => (
                <div style={{ padding: '6px 2px', textAlign: 'center' }}>
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />} 
                    onClick={onAppendBtnClick}
                  >
                    添加商品规格
                  </Button>
                </div>
              )}
            >
              <Table.Column
                title="规格名称"
                dataIndex="skuName"
                render={(text, record, index) => (
                  <Form.Item
                    name={['itemSkuList', index, 'skuName']}
                    rules={[{ required: true, message: '规格名称不能为空' }]}
                    style={{ marginBottom: 0 }}
                  >
                    <Input placeholder="请输入规格名称" />
                  </Form.Item>
                )}
              />
              <Table.Column
                title="编号/条码"
                width={250}
                render={(text, record, index) => (
                  <>
                    <div className={styles.flexCenter}>
                      <span className={styles.mr5} style={{ width: 50 }}>编号</span>
                      <Input 
                        value={record.skuCode}
                        onChange={(e) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].skuCode = e.target.value;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                    <div className={styles.flexCenter} style={{ marginTop: 5 }}>
                      <span className={styles.mr5} style={{ width: 50 }}>条码</span>
                      <Input 
                        value={record.barcode}
                        onChange={(e) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].barcode = e.target.value;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                  </>
                )}
              />
              <Table.Column
                title="长/宽/高(cm)"
                width={200}
                render={(text, record, index) => (
                  <>
                    <div className={styles.flexCenter}>
                      <span className={styles.mr5}>长</span>
                      <InputNumber 
                        min={0}
                        precision={1}
                        style={{ width: '100%' }}
                        value={record.length}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].length = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                    <div className={styles.flexCenter} style={{ marginTop: 5 }}>
                      <span className={styles.mr5}>宽</span>
                      <InputNumber 
                        min={0}
                        precision={1}
                        style={{ width: '100%' }}
                        value={record.width}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].width = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                    <div className={styles.flexCenter} style={{ marginTop: 5 }}>
                      <span className={styles.mr5}>高</span>
                      <InputNumber 
                        min={0}
                        precision={1}
                        style={{ width: '100%' }}
                        value={record.height}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].height = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                  </>
                )}
              />
              <Table.Column
                title="净重/毛重(kg)"
                width={240}
                render={(text, record, index) => (
                  <>
                    <div className={styles.flexCenter}>
                      <span className={styles.mr5}>净重</span>
                      <InputNumber 
                        min={0}
                        precision={3}
                        style={{ width: '100%' }}
                        value={record.netWeight}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].netWeight = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                    <div className={styles.flexCenter} style={{ marginTop: 5 }}>
                      <span className={styles.mr5}>毛重</span>
                      <InputNumber 
                        min={0}
                        precision={3}
                        style={{ width: '100%' }}
                        value={record.grossWeight}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].grossWeight = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                  </>
                )}
              />
              <Table.Column
                title="成本价/销售价(元)"
                width={240}
                render={(text, record, index) => (
                  <>
                    <div className={styles.flexCenter}>
                      <span className={styles.mr5}>成本价</span>
                      <InputNumber 
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        value={record.costPrice}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].costPrice = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                    <div className={styles.flexCenter} style={{ marginTop: 5 }}>
                      <span className={styles.mr5}>销售价</span>
                      <InputNumber 
                        min={0}
                        precision={2}
                        style={{ width: '100%' }}
                        value={record.sellingPrice}
                        onChange={(value) => {
                          const newList = [...skuFormData.itemSkuList];
                          newList[index].sellingPrice = value as number;
                          setSkuFormData({ itemSkuList: newList });
                        }}
                      />
                    </div>
                  </>
                )}
              />
              <Table.Column
                title="操作"
                width={80}
                align="right"
                render={(text, record, index) => (
                  <Button 
                    type="link" 
                    icon={<DeleteOutlined />} 
                    onClick={() => handleDeleteItemSku(record, index)}
                  />
                )}
              />
            </Table>
          </Form>
        </Card>
      </Drawer>
      
      {/* 商品分类模态框 */}
      <Modal
        title={categoryModalTitle}
        width={500}
        open={categoryModalVisible}
        onCancel={() => setCategoryModalVisible(false)}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={() => setCategoryModalVisible(false)} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={buttonLoading} onClick={submitCategoryForm}>
              确定
            </Button>
          </div>
        }
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item label="上级分类" name="parentId">
            <TreeSelect
              treeData={categoryTreeSelect}
              placeholder="上级分类"
              style={{ width: '100%' }}
              fieldNames={{ label: 'title', value: 'key', children: 'children' }}
              disabled={!showParent}
            />
          </Form.Item>
          <Form.Item 
            label="商品分类名称" 
            name="categoryName" 
            rules={[{ required: true, message: '请输入商品分类名称' }]}
          >
            <Input placeholder="请输入商品分类名称" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ItemPage;