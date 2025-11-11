import React, { useRef, forwardRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import Barcode from 'react-barcode';

export interface PrintTableItem {
  itemName: string;
  skuName: string;
  areaName: string;
  quantity: string;
  amount: string;
  batchNo?: string;
  productionDate?: string;
  expirationDate?: string;
}

export interface PrintData {
  receiptOrderNo: string;
  receiptOrderType: string;
  receiptOrderStatus: string;
  merchantName: string;
  orderNo: string;
  warehouseName: string;
  areaName: string;
  totalQuantity: string;
  payableAmount: string;
  createBy: string;
  createTime: string;
  updateBy?: string;
  updateTime?: string;
  remark?: string;
  table: PrintTableItem[];
}

interface PrintComponentProps {
  data: PrintData;
  onClose: () => void;
  loading?: boolean;
  visible?: boolean;
}

const PrintContent = forwardRef<HTMLDivElement, { data: PrintData }>(({ data }, ref) => (
  <div 
    ref={ref} 
    style={{ 
      padding: '20px', 
      fontFamily: '"Microsoft YaHei", sans-serif',
      fontSize: '14px'
    }}
  >
    {/* 头部信息 */}
    <div style={{ 
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '20px',
      borderBottom: '1px solid #eee',
      paddingBottom: '15px'
    }}>
      <div>
        <h1 style={{ 
          fontSize: '22px', 
          fontWeight: 'bold',
          marginBottom: '8px'
        }}>入库单：{data.receiptOrderNo}</h1>
      </div>
      <div>
        <Barcode 
          value={data.receiptOrderNo} 
          options={{ 
            displayValue: false, 
            width: 1, 
            height: 50, 
            format: 'CODE128' 
          }} 
        />
      </div>
    </div>

    {/* 基本信息 */}
    <div style={{ 
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '15px',
      marginBottom: '20px'
    }}>
      <div>
        <p><strong>入库类型：</strong>{data.receiptOrderType}</p>
        <p><strong>供应商：</strong>{data.merchantName}</p>
        <p><strong>仓库：</strong>{data.warehouseName}</p>
        <p><strong>数量：</strong>{data.totalQuantity}</p>
        <p><strong>创建人：</strong>{data.createBy}</p>
        {data.updateBy && <p><strong>操作人：</strong>{data.updateBy}</p>}
        <p><strong>备注：</strong>{data.remark}</p>
      </div>
      <div>
        <p><strong>入库状态：</strong>{data.receiptOrderStatus}</p>
        <p><strong>订单号：</strong>{data.orderNo}</p>
        <p><strong>库区：</strong>{data.areaName}</p>
        <p><strong>金额：</strong>{data.payableAmount}</p>
        <p><strong>创建时间：</strong>{data.createTime}</p>
        {data.updateTime && <p><strong>操作时间：</strong>{data.updateTime}</p>}
      </div>
    </div>



    {/* 表格数据 */}
    {data.table?.length > 0 ? (
      <>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '15px 0',
          border: '1px solid #ddd'
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>商品名称</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>规格</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>库区</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>批号</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>生产日期</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'left' }}>过期日期</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>数量</th>
              <th style={{ border: '1px solid #ddd', padding: '10px', textAlign: 'right' }}>价格(元)</th>
            </tr>
          </thead>
          <tbody>
            {data.table.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.itemName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.skuName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.areaName}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.batchNo || '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.productionDate || '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.expirationDate || '-'}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right' }}>{item.amount}</td>
              </tr>
            ))}
            {/* 合计行 */}
            <tr>
              <td colSpan={6} style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 500 }}>合计</td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                {data.table.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0) || 0}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'right', fontWeight: 500 }}>
                {data.table.reduce((sum, item) => sum + (Number(item.amount) || 0), 0).toFixed(2) || '0.00'}
              </td>
            </tr>
          </tbody>
        </table>
      </>
    ) : (
      <div style={{ 
        textAlign: 'center',
        padding: '20px',
        color: '#999'
      }}>
        暂无入库明细数据
      </div>
    )}
  </div>
));

const ReceiptPrintComponent: React.FC<PrintComponentProps> = ({ 
  data, 
  onClose, 
  loading = false,
  visible
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        reactToPrintFn();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [visible, reactToPrintFn]);

  return (
    <div>
      <button onClick={() => reactToPrintFn()}>打印</button>
      <PrintContent ref={contentRef} data={data}/>
    </div>
  );
};

export default ReceiptPrintComponent;