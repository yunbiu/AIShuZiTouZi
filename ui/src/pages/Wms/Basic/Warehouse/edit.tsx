import React, { useEffect } from 'react';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { Form, Drawer, Button } from 'antd';
import { listWarehouseNoPage } from '@/services/yw/warehouse';

export type AreaFormData = Record<string, unknown> & Partial<API.Yw.Area>;

export type EditDrawerProps = {
  onSubmit: (values: AreaFormData) => Promise<void>;
  onClose: () => void;
  visible: boolean;
  values: Partial<API.Yw.Area>;
};

const EditDrawer: React.FC<EditDrawerProps> = (props) => {
  const [form] = Form.useForm();
  
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      id: props.values.id,
      areaCode: props.values.areaCode,
      areaName: props.values.areaName,
      warehouseId: props.values.warehouseId,
      remark: props.values.remark,
    });
  }, [form, props]);

  const handleFinish = async (values: Record<string, any>) => {
    props.onSubmit(values as AreaFormData);
  };

  return (
    <Drawer
      width={600}
      title={props.values.id ? '修改库区' : '添加库区'}
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
          label="ID"
          hidden
          disabled
        />
        <ProFormText
          name="areaName"
          label="名称"
          width="xl"
          placeholder="请输入名称"
          rules={[
            {
              required: true,
              message: '名称不能为空',
            },
          ]}
        />
        <ProFormSelect
          name="warehouseId"
          label="所属仓库"
          width="xl"
          placeholder="请选择所属仓库"
          rules={[
            {
              required: true,
              message: '所属仓库不能为空',
            },
          ]}
          request={async () => {
            const res= await listWarehouseNoPage() as any;
            return res.rows.map((item:any) => ({
              label: item.warehouseName,
              value: item.id,
            }));
          }}
        />
        <ProFormText
          name="areaCode"
          label="编号"
          width="xl"
          placeholder="请输入编号"
        />
        <ProFormText
          name="remark"
          label="备注"
          width="xl"
          placeholder="请输入备注"
        />
      </ProForm>
    </Drawer>
  );
};

export default EditDrawer;