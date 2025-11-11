import React from 'react';
import { Modal, Button } from 'antd';
import { ProForm, ProFormText } from '@ant-design/pro-components';

export type WarehouseModalProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: API.Yw.Warehouse) => Promise<void>;
  values: Partial<API.Yw.Warehouse>;
};

const WarehouseModal: React.FC<WarehouseModalProps> = (props) => {
  const { visible, onClose, onSubmit, values } = props;

  return (
    <Modal
      title={values?.id ? '修改仓库' : '添加仓库'}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={500}
      destroyOnClose
    >
      <ProForm<API.Yw.Warehouse>
        initialValues={values || {}}
        onFinish={async (formValues) => {
          await onSubmit(formValues);
        }}
        submitter={{
          render: (props, doms) => {
            return [
              <Button key="cancel" onClick={onClose}>
                取消
              </Button>,
              <Button key="submit" type="primary" onClick={() => props.form?.submit?.()}>
                确定
              </Button>,
            ];
          },
        }}
      >
        <ProFormText
          name="id"
          label="ID"
          hidden
          disabled
        />
        <ProFormText
          name="warehouseName"
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
        <ProFormText
          name="warehouseCode"
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
    </Modal>
  );
};

export default WarehouseModal;