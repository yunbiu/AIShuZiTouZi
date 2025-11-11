import React, { useEffect } from 'react';
import { ProForm, ProFormText } from '@ant-design/pro-components';
import { Form, Drawer, Button  } from 'antd';

export type ItemBrandFormData = Record<string, unknown> & Partial<API.Yw.ItemBrand>;

export type EditDrawerProps = {
  onSubmit: (values: ItemBrandFormData) => Promise<void>;
  onClose: () => void;
  visible: boolean;
  values: Partial<API.Yw.ItemBrand>;
};

const EditDrawer: React.FC<EditDrawerProps> = (props) => {
  const [form] = Form.useForm();
  
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      id: props.values.id,
      brandName: props.values.brandName,
    });
  }, [form, props]);

  const handleFinish = async (values: Record<string, any>) => {
    props.onSubmit(values as ItemBrandFormData);
  };

  return (
    <Drawer
      width={600}
      title={props.values.id ? '修改品牌' : '添加品牌'}
      open={props.visible}
      onClose={props.onClose}
      destroyOnClose
      footer={
        <div style={{ textAlign: 'right' }}>
          <Button onClick={props.onClose} style={{ marginRight: 8 }}>
            取消
          </Button>
          <Button type="primary" onClick={() => form.submit()}>
            确定
          </Button>
        </div>
      }
    >
      <ProForm 
        form={form}
        submitter={false}
        layout="horizontal"
        onFinish={handleFinish}
      >
        <ProFormText
          name="id"
          label="品牌ID"
          hidden
          disabled
        />
        <ProFormText
          name="brandName"
          label="品牌名称"
          width="xl"
          placeholder="请输入品牌名称"
          rules={[
            {
              required: true,
              message: '品牌名称不能为空',
            },
          ]}
        />
      </ProForm>
    </Drawer>
  );
};

export default EditDrawer;