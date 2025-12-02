import React, { useState } from 'react';
import { Card, Row, Col, Table, Button, DatePicker, Space, Select, Radio, Tag, Progress } from 'antd';
import { DownloadOutlined, CaretUpOutlined, CaretDownOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';

// 调整颜色方案以匹配图片
const assetRatioData = [
  { type: 'BTC', value: 41.5, amount: '12.35 BTC', valueNum: '$4,268,524', color: '#175DFB' },
  { type: 'ETH', value: 33.2, amount: '245.82 ETH', valueNum: '$3,414,819', color: '#11C5C2' },
  { type: 'SOL', value: 14.8, amount: '3,842.5 SOL', valueNum: '$1,522,269', color: '#FE7E03' },
  { type: 'USDT', value: 10.5, amount: '1,080,000 USDT', valueNum: '$1,080,000', color: '#F3413F' },
];

// 模拟近7日持仓变化数据
const trendData = [
  { date: '12/04', BTC: 40, ETH: 34, SOL: 15, USDT: 11 },
  { date: '12/05', BTC: 40.5, ETH: 33.8, SOL: 14.9, USDT: 10.8 },
  { date: '12/06', BTC: 41, ETH: 33.5, SOL: 14.8, USDT: 10.7 },
  { date: '12/07', BTC: 41.2, ETH: 33.3, SOL: 14.8, USDT: 10.7 },
  { date: '12/08', BTC: 41.3, ETH: 33.2, SOL: 14.8, USDT: 10.7 },
  { date: '12/09', BTC: 41.4, ETH: 33.2, SOL: 14.8, USDT: 10.6 },
  { date: '12/10', BTC: 41.5, ETH: 33.2, SOL: 14.8, USDT: 10.5 },
];

// 模拟持仓历史记录
const historyData = [
  {
    key: '1',
    date: '2024-12-09 14:30',
    type: 'AI建议调整',
    btc: { value: '41.5%', change: '+1.5%' },
    eth: { value: '33.2%', change: '-1.8%' },
    sol: { value: '14.8%', change: '-0.2%' },
    usdt: { value: '10.5%', change: '+0.5%' },
    reason: '市场利好消息影响',
    operator: '管理员A',
  },
  {
    key: '2',
    date: '2024-12-05 10:15',
    type: 'AI建议调整',
    btc: { value: '40.0%', change: '+0.0%' },
    eth: { value: '35.0%', change: '+0.0%' },
    sol: { value: '15.0%', change: '+0.0%' },
    usdt: { value: '10.0%', change: '+0.0%' },
    reason: '维持原有持仓结构',
    operator: '管理员B',
  },
  {
    key: '3',
    date: '2024-12-01 09:00',
    type: '初始配置',
    btc: { value: '40.0%', change: '' },
    eth: { value: '35.0%', change: '' },
    sol: { value: '15.0%', change: '' },
    usdt: { value: '10.0%', change: '' },
    reason: '系统初始化配置',
    operator: '系统管理员',
  },
];

// 带引出线的饼图组件
const PieChartWithLines = ({ data }: { data: typeof assetRatioData }) => {
  const radius = 90;
  const centerX = 150;
  const centerY = 150;
  const labelRadius = radius + 15;
  const textRadius = labelRadius + 45;

  let currentAngle = -Math.PI / 2;

  const slices = data.map((item) => {
    const percentage = item.value / 100;
    const angle = percentage * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = startAngle + angle;
    const midAngle = startAngle + angle / 2;

    // 计算扇区路径
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    // 计算标签线起点
    const labelStartX = centerX + labelRadius * Math.cos(midAngle);
    const labelStartY = centerY + labelRadius * Math.sin(midAngle);

    // 计算文本位置，避免重叠
    const textX = centerX + textRadius * Math.cos(midAngle);
    const textY = centerY + textRadius * Math.sin(midAngle);

    // 为不同资产调整位置，避免重叠
    let adjustedTextX = textX;
    let adjustedTextY = textY;

    if (item.type === 'BTC') {
      adjustedTextX = textX + 10;
      adjustedTextY = textY - 5;
    } else if (item.type === 'ETH') {
      adjustedTextX = textX - 5;
      adjustedTextY = textY + 10;
    } else if (item.type === 'SOL') {
      adjustedTextX = textX - 10;
      adjustedTextY = textY - 5;
    } else if (item.type === 'USDT') {
      adjustedTextX = textX + 5;
      adjustedTextY = textY + 10;
    }

    currentAngle = endAngle;

    return {
      ...item,
      pathData,
      labelStartX,
      labelStartY,
      textX: adjustedTextX,
      textY: adjustedTextY,
      lineEndX: adjustedTextX,
      lineEndY: adjustedTextY,
      midAngle,
    };
  });

  return (
    <div style={{ position: 'relative', height: 340, width: 340, margin: '0 auto' }}>
      <svg width="340" height="340" viewBox="0 0 340 340">
        {/* 绘制饼图扇区 */}
        {slices.map((slice) => (
          <path
            key={slice.type}
            d={slice.pathData}
            fill={slice.color}
            stroke="#fff"
            strokeWidth="2"
            opacity="0.85"
          />
        ))}

        {/* 绘制标签线 */}
        {slices.map((slice) => (
          <g key={`line-${slice.type}`}>
            <path
              d={`M ${slice.labelStartX} ${slice.labelStartY} Q ${(slice.labelStartX + slice.textX) / 2} ${slice.labelStartY} ${slice.textX} ${slice.textY}`}
              stroke={slice.color}
              strokeWidth="1.5"
              fill="none"
              strokeDasharray="4,3"
            />
          </g>
        ))}

        {/* 绘制文本标签 */}
        {slices.map((slice) => (
          <g key={`text-${slice.type}`}>
            <text
              x={slice.textX}
              y={slice.textY - 8}
              textAnchor="middle"
              fill={slice.color}
              fontSize="14"
              fontWeight="bold"
            >
              {slice.type}
            </text>
            <text
              x={slice.textX}
              y={slice.textY + 10}
              textAnchor="middle"
              fill="#333"
              fontSize="16"
              fontWeight="bold"
            >
              {slice.value}%
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

// 将趋势数据转换为长格式用于多线图
const transformTrendData = (data: typeof trendData) => {
  const result: any[] = [];
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date') {
        result.push({
          date: item.date,
          type: key,
          value: item[key as keyof typeof item],
        });
      }
    });
  });
  return result;
};

const PortfolioData = () => {
  const [timeRange, setTimeRange] = useState('7d');

  // 折线图配置 - 更新颜色以匹配饼图
  const lineConfig = {
    data: transformTrendData(trendData),
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      label: {
        formatter: (v: number) => `${v}%`,
      },
      grid: {
        line: {
          style: {
            stroke: '#f0f0f0',
            lineDash: [4, 4],
          },
        },
      },
      min: 0,
      max: 50,
    },
    xAxis: {
      tickLine: {
        alignTick: false,
      },
    },
    color: ['#175DFB', '#11C5C2', '#FE7E03', '#F3413F'], // 使用饼图对应的颜色
    lineStyle: {
      lineWidth: 2,
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#fff',
        stroke: (item: any) => {
          const colors: Record<string, string> = {
            BTC: '#175DFB',
            ETH: '#11C5C2',
            SOL: '#FE7E03',
            USDT: '#F3413F',
          };
          return colors[item.type] || '#1890ff';
        },
        strokeWidth: 2,
      },
    },
    smooth: true,
    tooltip: {
      showCrosshairs: true,
      shared: true,
      formatter: (datum: any) => {
        return {
          name: datum.type,
          value: `${datum.value}%`,
        };
      },
    },
    legend: {
      position: 'bottom',
      layout: 'horizontal',
      itemName: {
        style: {
          fontSize: 12,
        },
      },
    },
    animation: {
      appear: {
        animation: 'wave-in',
        duration: 1000,
      },
    },
  };

  // 持仓历史表格列
  const historyColumns = [
    {
      title: '调整日期',
      dataIndex: 'date',
      key: 'date',
      width: 150,
    },
    {
      title: '调整类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (text: string) => {
        // 使用 Ant Design 预设的颜色，确保文字清晰可见
        const typeToColor: Record<string, string> = {
          'AI建议调整': 'blue',
          '初始配置': 'green',
        };
        return <Tag color={typeToColor[text] || 'default'}>{text}</Tag>;
      },
    },
    {
      title: 'BTC占比',
      dataIndex: 'btc',
      key: 'btc',
      width: 120,
      render: (record: { value: string; change: string }) => (
        <div>
          <div>{record.value}</div>
          {record.change && (
            <div style={{
              color: record.change.startsWith('+') ? '#52c41a' : '#ff4d4f',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {record.change.startsWith('+') ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {record.change}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'ETH占比',
      dataIndex: 'eth',
      key: 'eth',
      width: 120,
      render: (record: { value: string; change: string }) => (
        <div>
          <div>{record.value}</div>
          {record.change && (
            <div style={{
              color: record.change.startsWith('+') ? '#52c41a' : '#ff4d4f',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {record.change.startsWith('+') ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {record.change}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'SOL占比',
      dataIndex: 'sol',
      key: 'sol',
      width: 120,
      render: (record: { value: string; change: string }) => (
        <div>
          <div>{record.value}</div>
          {record.change && (
            <div style={{
              color: record.change.startsWith('+') ? '#52c41a' : '#ff4d4f',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {record.change.startsWith('+') ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {record.change}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'USDT占比',
      dataIndex: 'usdt',
      key: 'usdt',
      width: 120,
      render: (record: { value: string; change: string }) => (
        <div>
          <div>{record.value}</div>
          {record.change && (
            <div style={{
              color: record.change.startsWith('+') ? '#52c41a' : '#ff4d4f',
              fontSize: 12,
              display: 'flex',
              alignItems: 'center',
              gap: 2,
            }}>
              {record.change.startsWith('+') ? <CaretUpOutlined /> : <CaretDownOutlined />}
              {record.change}
            </div>
          )}
        </div>
      ),
    },
    {
      title: '调整原因',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      width: 100,
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          marginBottom: '24px',
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold' }}>持仓数据</h2>
            <div style={{ color: '#666', marginTop: '4px' }}>
              总资产规模: <span style={{ color: '#1890ff', fontWeight: 'bold' }}>$10,285,600</span>
              <span style={{ marginLeft: '16px', fontSize: '12px', color: '#999' }}>
                基于实时汇率计算 • 更新时间: 2024-12-10 08:00
              </span>
            </div>
          </div>
          <Space>
            <DatePicker.RangePicker
              style={{ width: '240px' }}
              placeholder={['开始日期', '结束日期']}
            />
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              style={{ background: '#1890ff', borderColor: '#1890ff' }}
            >
              导出Excel
            </Button>
          </Space>
        </div>

        {/* 资产占比 + 持仓趋势 */}
        <Row gutter={[24, 24]}>
          <Col lg={12} md={24} sm={24}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>当前资产占比</span>
                  <div style={{ fontSize: '12px', color: '#999' }}>
                    数据更新时间: 2024-12-10 08:00
                  </div>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
                height: '100%',
              }}
              bodyStyle={{ padding: '16px' }}
            >
              <Row gutter={[16, 16]}>
                <Col lg={12} sm={24}>
                  <div style={{ height: '340px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PieChartWithLines data={assetRatioData} />
                  </div>
                </Col>
                <Col lg={12} sm={24}>
                  <div style={{ padding: '8px', marginTop: '10px' }}>
                    {assetRatioData.map((item) => (
                      <div key={item.type} style={{ marginBottom: '20px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '2px',
                              background: item.color,
                            }} />
                            <span style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.type}</span>
                          </div>
                          <span style={{ fontSize: '16px', fontWeight: 'bold', color: item.color }}>
                            {item.value}%
                          </span>
                        </div>

                        <Progress
                          percent={item.value}
                          showInfo={false}
                          strokeColor={item.color}
                          trailColor="#f0f0f0"
                          strokeWidth={6}
                          style={{ marginBottom: '8px' }}
                        />

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#666' }}>
                          <div>
                            <div>价值：{item.valueNum}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div>数量：{item.amount}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col lg={12} md={24} sm={24}>
            <Card
              title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: 'bold' }}>近7日持仓变化</span>
                  <div>
                    <Radio.Group
                      value={timeRange}
                      onChange={(e) => setTimeRange(e.target.value)}
                      size="small"
                      style={{ marginRight: '12px' }}
                    >
                      <Radio.Button value="7d">7天</Radio.Button>
                      <Radio.Button value="30d">30天</Radio.Button>
                      <Radio.Button value="90d">90天</Radio.Button>
                    </Radio.Group>
                  </div>
                </div>
              }
              bordered={false}
              style={{
                borderRadius: '8px',
                boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              }}
              bodyStyle={{ paddingBottom: '24px' }}
            >
              <div style={{ height: '300px' }}>
                <Line {...lineConfig} />
              </div>

              {/* 自定义图例，放置在图表下方 */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '16px',
                gap: '24px',
                flexWrap: 'wrap'
              }}>
                {assetRatioData.map((asset) => (
                  <div key={asset.type} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      backgroundColor: asset.color
                    }} />
                    <span style={{ fontSize: '14px', color: '#333' }}>{asset.type}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Col>
        </Row>

        {/* 持仓历史记录 */}
        <Card
          title={
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '16px', fontWeight: 'bold' }}>持仓历史记录</span>
              <div style={{ fontSize: '12px', color: '#999' }}>
                共 {historyData.length} 条记录 • 最近更新: 2024-12-10 08:00
              </div>
            </div>
          }
          bordered={false}
          style={{
            marginTop: '24px',
            borderRadius: '8px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
          }}
        >
          <Table
            dataSource={historyData}
            columns={historyColumns}
            rowKey="key"
            size="middle"
            pagination={{
              pageSize: 5,
              showSizeChanger: false,
              showTotal: (total) => `共 ${total} 条记录`,
            }}
            scroll={{ x: 'max-content' }}
            rowClassName={() => 'hover-row'}
          />
        </Card>
      </Card>

      <style>{`
        .hover-row:hover {
          background: #fafafa;
        }
        .ant-table-thead > tr > th {
          background: #fafafa;
          font-weight: 600;
          border-bottom: 2px solid #f0f0f0;
        }
        .ant-card-head {
          border-bottom: 1px solid #f0f0f0;
          padding: 16px 24px;
        }
        .ant-card-body {
          padding: 24px;
        }
        .ant-btn-primary {
          box-shadow: 0 2px 0 rgba(5, 145, 255, 0.1);
        }
        .ant-radio-button-wrapper {
          border-radius: 4px !important;
        }
        .ant-radio-button-wrapper:first-child {
          border-radius: 4px 0 0 4px !important;
        }
        .ant-radio-button-wrapper:last-child {
          border-radius: 0 4px 4px 0 !important;
        }
      `}</style>
    </div>
  );
};

export default PortfolioData;