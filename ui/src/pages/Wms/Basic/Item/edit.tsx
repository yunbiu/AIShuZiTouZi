// src/pages/item/edit.tsx
import React, { useState } from 'react';
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  Button, 
  Table, 
  TreeSelect,
  InputNumber,
  Drawer,
  Modal,
  message,
  Space,
  Row,
  Col
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { 
  addItem, 
  updateItem,
} from '@/services/yw/item';
import { delItemSku } from '@/services/yw/itemSku';
// 修改导入的函数调用
import { addItemCategory, updateItemCategory } from '@/services/yw/itemCategory'; 
import styles from './index.less';

const { TextArea } = Input;

interface EditFormProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  formData: any;
  categoryTreeSelect: any[];
  onSuccess: () => void;
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

const EditForm: React.FC<EditFormProps> = ({
  visible,
  onClose,
  title,
  formData,
  categoryTreeSelect,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [skuForm] = Form.useForm();
  const [categoryForm] = Form.useForm();
  const [skuFormData, setSkuFormData] = useState<{itemSkuList: ItemSku[]}>({ 
    itemSkuList: formData?.sku || [{
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
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryModalTitle, setCategoryModalTitle] = useState('');
  const [showParent, setShowParent] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);

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
      onSuccess();
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
      onSuccess();
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
          const newList = skuFormData.itemSkuList.filter((_, i) => i !== index);
          setSkuFormData({ itemSkuList: newList });
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

  return (
    <>
      <Drawer
        title={title}
        width="80%"
        open={visible}
        onClose={onClose}
        footer={
          <div style={{ textAlign: 'right' }}>
            <Button onClick={onClose} style={{ marginRight: 8 }}>
              取消
            </Button>
            <Button type="primary" loading={buttonLoading} onClick={submitForm}>
              确定
            </Button>
          </div>
        }
      >
        <Card>
          <Form form={form} layout="vertical" initialValues={formData}>
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
                    {/* Options would be passed via props or context */}
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
    </>
  );
};

export default EditForm;