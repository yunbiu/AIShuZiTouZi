import React, { useEffect } from 'react';
import { ProForm, ProFormText, ProFormSelect, ProFormDigit } from '@ant-design/pro-components';
import { Form, Drawer, Button } from 'antd';

export type MerchantFormData = Record<string, unknown> & Partial<API.Yw.Merchant>;

export type EditDrawerProps = {
  onSubmit: (values: MerchantFormData) => Promise<void>;
  onClose: () => void;
  visible: boolean;
  values: Partial<API.Yw.Merchant>;
};

const EditDrawer: React.FC<EditDrawerProps> = (props) => {
  const [form] = Form.useForm();
  
  useEffect(() => {
    form.resetFields();
    form.setFieldsValue({
      id: props.values.id,
      merchantCode: props.values.merchantCode,
      merchantName: props.values.merchantName,
      merchantType: props.values.merchantType,
      merchantLevel: props.values.merchantLevel,
      bankName: props.values.bankName,
      bankAccount: props.values.bankAccount,
      address: props.values.address,
      mobile: props.values.mobile,
      tel: props.values.tel,
      contactPerson: props.values.contactPerson,
      email: props.values.email,
      remark: props.values.remark,
    });
  }, [form, props]);

  const handleFinish = async (values: Record<string, any>) => {
    props.onSubmit(values as MerchantFormData);
  };

  return (
    <Drawer
      width={600}
      title={props.values.id ? '修改往来单位' : '添加往来单位'}
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
          name="merchantCode"
          label="编号"
          width="xl"
          placeholder="请输入编号"
          rules={[
            {
              required: true,
              message: '编号不能为空',
            },
          ]}
        />
        <ProFormText
          name="merchantName"
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
          name="merchantType"
          label="企业类型"
          width="xl"
          placeholder="请选择企业类型"
          options={[
            { label: '类型1', value: 1 },
            { label: '类型2', value: 2 },
            // Add more options as needed
          ]}
          rules={[
            {
              required: true,
              message: '企业类型不能为空',
            },
          ]}
        />
        <ProFormText
          name="merchantLevel"
          label="级别"
          width="xl"
          placeholder="请输入级别"
        />
        <ProFormText
          name="bankName"
          label="开户行"
          width="xl"
          placeholder="请输入开户行"
        />
        <ProFormText
          name="bankAccount"
          label="银行账户"
          width="xl"
          placeholder="请输入银行账户"
        />
        <ProFormText
          name="address"
          label="地址"
          width="xl"
          placeholder="请输入地址"
        />
        <ProFormText
          name="mobile"
          label="手机号"
          width="xl"
          placeholder="请输入手机号"
        />
        <ProFormText
          name="tel"
          label="座机号"
          width="xl"
          placeholder="请输入座机号"
        />
        <ProFormText
          name="contactPerson"
          label="联系人"
          width="xl"
          placeholder="请输入联系人"
        />
        <ProFormText
          name="email"
          label="Email"
          width="xl"
          placeholder="请输入Email"
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