import React, { useRef, forwardRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import dayjs from 'dayjs';
import Barcode from 'react-barcode'; // 引入 react-barcode

// 类型定义
export interface PrintTableItem {
  itemName: string;
  skuName: string;
  areaName: string;
  quantity: string;
  profitAndLoss: string;
  checkQuantity: string;
  batchNo?: string;
  productionDate?: string;
  expirationDate?: string;
  receiptTime?: string;
}

export interface PrintData {
  checkOrderNo: string;
  warehouseName: string;
  areaName: string;
  checkOrderStatus: string;
  checkOrderTotal: string;
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

// 打印内容组件（必须用forwardRef包裹）
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
        }}>盘库单:{data.checkOrderNo}</h1>
      </div>
      <div>
        <Barcode 
          value={data.checkOrderNo} 
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
      display: 'flex',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      marginBottom: '20px'
    }}>
      <div style={{ flex: 1, minWidth: '250px' }}>
        <p><strong>盘库状态：</strong>{data.checkOrderStatus}</p>
        <p><strong>仓库：</strong>{data.warehouseName}</p>
        
      </div>
      <div style={{ flex: 1, minWidth: '250px' }}>
      <p><strong>盈亏数：</strong>{data.checkOrderTotal}</p>
        <p><strong>库区：</strong>{data.areaName}</p>
      </div>
      <div style={{ flex: 1, minWidth: '250px' }}>
        <p><strong>创建人：</strong>{data.createBy}</p>
        <p><strong>操作人：</strong>{data.updateBy}</p>
      </div>
      {data.updateBy && (
        <div style={{ flex: 1, minWidth: '250px' }}>
          <p><strong>创建时间：</strong>{data.createTime}</p>
          <p><strong>操作时间：</strong>{data.updateTime}</p>
        </div>
      )}
      <div style={{ flex: 1, minWidth: '250px' }}>
        <p><strong>备注：</strong>{data.remark}</p>
      </div>
    </div>

    {/* 表格数据 */}
    {data.table?.length > 0 ? (
      <>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          margin: '15px 0',
          border: '1px solid '
        }}>
          <thead>
            <tr >
              <th style={{ border: '1px solid ', padding: '10px', textAlign: 'left', width: '20%' }}>商品名称</th>
              <th style={{ border: '1px solid ', padding: '10px', textAlign: 'left', width: '15%' }}>规格</th>
              <th style={{ border: '1px solid ', padding: '10px', textAlign: 'left', width: '10%' }}>库区</th>
              <th style={{ border: '1px solid ', padding: '10px', textAlign: 'right', width: '10%' }}>账面库存</th>
              <th style={{ border: '1px solid ', padding: '10px', textAlign: 'right', width: '10%' }}>盈亏数</th>
              <th style={{ border: '1px solid ', padding: '10px', textAlign: 'right', width: '10%' }}>实际库存</th>
              {data.table.some(item => item.batchNo) && (
                <th style={{ border: '1px solid ', padding: '10px', textAlign: 'left', width: '15%' }}>批号</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.table.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid ', padding: '8px' }}>{item.itemName}</td>
                <td style={{ border: '1px solid ', padding: '8px' }}>{item.skuName}</td>
                <td style={{ border: '1px solid ', padding: '8px' }}>{item.areaName}</td>
                <td style={{ border: '1px solid ', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                <td style={{ border: '1px solid ', padding: '8px', textAlign: 'right' }}>{item.profitAndLoss}</td>
                <td style={{ border: '1px solid ', padding: '8px', textAlign: 'right' }}>{item.checkQuantity}</td>
                {data.table.some(i => i.batchNo) && (
                  <td style={{ border: '1px solid ', padding: '8px' }}>{item.batchNo || '-'}</td>
                )}
              </tr>
            ))}
            {/* 合计行 */}
            <tr>
              <td colSpan={3} style={{ border: '1px solid ', padding: '8px', textAlign: 'right' }}>合计</td>
              <td style={{ border: '1px solid ', padding: '8px', textAlign: 'right' }}>
                {data.table.reduce((sum, item) => sum + Number(item.quantity), 0)}
              </td>
              <td style={{ 
                border: '1px solid ', 
                padding: '8px', 
                textAlign: 'right',
                fontWeight: 500
              }}>
                {data.table.reduce((sum, item) => sum + Number(item.profitAndLoss), 0)}
              </td>
              <td style={{ border: '1px solid ', padding: '8px', textAlign: 'right' }}>
                {data.table.reduce((sum, item) => sum + Number(item.checkQuantity), 0)}
              </td>
              {data.table.some(i => i.batchNo) && (
                <td style={{ border: '1px solid ', padding: '8px' }}>-</td>
              )}
            </tr>
          </tbody>
        </table>

        {/* 备注信息 */}
        {data.remark && (
          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            borderTop: '1px dashed '
          }}>
            <p><strong>备注：</strong>{data.remark}</p>
          </div>
        )}
      </>
    ) : (
      <div style={{ 
        textAlign: 'center',
        padding: '20px',
        color: '#999'
      }}>
        暂无盘库明细数据
      </div>
    )}

  </div>
));

// 主打印组件
const PrintComponent: React.FC<PrintComponentProps> = ({ 
  data, 
  onClose, 
  loading = false ,
  visible
}) => {
  const printRef = React.useRef();
  const [isPrinting, setIsPrinting] = React.useState(false);
  // 定义一个打印组件，用于触发打印操作
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });
  // 组件加载后自动触发打印预览
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        reactToPrintFn();
      }, 100); // 稍作延迟确保DOM完全加载
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

export default PrintComponent;