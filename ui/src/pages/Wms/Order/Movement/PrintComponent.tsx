import React, { useRef, forwardRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import Barcode from 'react-barcode';

export interface PrintTableItem {
  itemName: string;
  skuName: string;
  sourceAreaName: string;
  targetAreaName: string;
  quantity: string;
  batchNo?: string;
  productionDate?: string;
  expirationDate?: string;
}

export interface PrintData {
  movementOrderNo: string;
  sourceWarehouseName: string;
  sourceAreaName: string;
  targetWarehouseName: string;
  targetAreaName: string;
  movementOrderStatus: string;
  totalQuantity: string;
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
        }}>移库单：{data.movementOrderNo}</h1>
      
      </div>
      <div>
        <Barcode 
          value={data.movementOrderNo} 
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
        <p><strong>移库状态：</strong>{data.movementOrderStatus}</p>
        <p><strong>源仓库：</strong>{data.sourceWarehouseName}</p>
        <p><strong>目标仓库：</strong>{data.targetWarehouseName}</p>
        <p><strong>创建人：</strong>{data.createBy}</p>
        {data.updateBy && <p><strong>操作人：</strong>{data.updateBy}</p>}
        <p><strong>备注：</strong>{data.remark}</p>
      </div>
      <div style={{ flex: 1, minWidth: '250px' }}>
        <p><strong>总数量：</strong>{data.totalQuantity}</p>
        <p><strong>源库区：</strong>{data.sourceAreaName}</p>
        <p><strong>目标库区：</strong>{data.targetAreaName}</p>
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
          border: '1px solid'
        }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid', padding: '10px', textAlign: 'left', width: '20%' }}>商品名称</th>
              <th style={{ border: '1px solid', padding: '10px', textAlign: 'left', width: '15%' }}>规格</th>
              <th style={{ border: '1px solid', padding: '10px', textAlign: 'left', width: '10%' }}>源库区</th>
              <th style={{ border: '1px solid', padding: '10px', textAlign: 'left', width: '10%' }}>目标库区</th>
              <th style={{ border: '1px solid', padding: '10px', textAlign: 'right', width: '10%' }}>数量</th>
              {data.table.some(item => item.batchNo) && (
                <th style={{ border: '1px solid', padding: '10px', textAlign: 'left', width: '15%' }}>批号</th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.table.map((item, index) => (
              <tr key={index}>
                <td style={{ border: '1px solid', padding: '8px' }}>{item.itemName}</td>
                <td style={{ border: '1px solid', padding: '8px' }}>{item.skuName}</td>
                <td style={{ border: '1px solid', padding: '8px' }}>{item.sourceAreaName}</td>
                <td style={{ border: '1px solid', padding: '8px' }}>{item.targetAreaName}</td>
                <td style={{ border: '1px solid', padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                {data.table.some(i => i.batchNo) && (
                  <td style={{ border: '1px solid', padding: '8px' }}>{item.batchNo || '-'}</td>
                )}
              </tr>
            ))}
            {/* 新增合计行 */}
            <tr>
              <td colSpan={4} style={{ border: '1px solid', padding: '8px', textAlign: 'right' }}>合计</td>
              <td style={{ 
                border: '1px solid', 
                padding: '8px', 
                textAlign: 'right',
                fontWeight: 500
              }}>
                {data.table.reduce((sum, item) => sum + Number(item.quantity), 0)}
              </td>
              {data.table.some(i => i.batchNo) && (
                <td style={{ border: '1px solid', padding: '8px' }}>-</td>
              )}
            </tr>
          </tbody>
        </table>

        {/* 备注信息 */}
        {data.remark && (
          <div style={{ 
            marginTop: '15px',
            padding: '10px',
            borderTop: '1px dashed'
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
        暂无移库明细数据
      </div>
    )}

  </div>
));

const PrintComponent: React.FC<PrintComponentProps> = ({ 
  data, 
  onClose, 
  loading = false,
  visible
}) => {
    // 定义一个打印组件，用于触发打印操作
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

export default PrintComponent;