import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, DatePicker, Space, Select, Radio, Tag, Progress, Spin, Alert, Layout } from 'antd';
import { DownloadOutlined, CaretUpOutlined, CaretDownOutlined, ReloadOutlined } from '@ant-design/icons';
import { Line } from '@ant-design/charts';
import axios from 'axios';
import dayjs from 'dayjs';
import * as XLSX from 'xlsx';
import { history } from 'umi';
import {
  BellOutlined, FileTextOutlined, DollarOutlined,
  PieChartOutlined, EyeOutlined,
  HomeOutlined, MessageOutlined, BarChartOutlined,
  CheckOutlined
} from '@ant-design/icons';

const { Header } = Layout;

// 币种颜色映射（保持原有配色）
const ASSET_COLOR_MAP = {
  BTC: '#175DFB',
  ETH: '#11C5C2',
  SOL: '#FE7E03',
  USDT: '#F3413F',
};

// 默认请求参数（可根据实际需求调整或从路由/状态获取）
const DEFAULT_PARAMS = {
  portfolioId: 1,      // 默认组合ID
  historyId: 2,        // 默认7天历史ID
};

// 格式化金额为 $xxx,xxx.xx 格式
const formatUsdValue = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
};

// 格式化资产数量（根据币种调整小数位数）
const formatAssetAmount = (assetType: string, amount: number) => {
  switch (assetType) {
    case 'BTC':
      return `${amount.toFixed(6)} BTC`;
    case 'ETH':
      return `${amount.toFixed(4)} ETH`;
    case 'SOL':
      return `${amount.toFixed(2)} SOL`;
    case 'USDT':
      return `${amount.toLocaleString()} USDT`;
    default:
      return `${amount} ${assetType}`;
  }
};

// 带引出线的饼图组件（原有逻辑保留）
const PieChartWithLines = ({ data }: { data: any[] }) => {
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

    const labelStartX = centerX + labelRadius * Math.cos(midAngle);
    const labelStartY = centerY + labelRadius * Math.sin(midAngle);
    const textX = centerX + textRadius * Math.cos(midAngle);
    const textY = centerY + textRadius * Math.sin(midAngle);

    // 调整文本位置避免重叠（动态计算，支持所有资产类型）
    let adjustedTextX = textX;
    let adjustedTextY = textY;

    // 根据角度动态调整文本位置，避免重叠
    if (midAngle > -Math.PI / 2 && midAngle < Math.PI / 2) {
      // 右侧扇区，文本右移
      adjustedTextX = textX + 10;
    } else {
      // 左侧扇区，文本左移
      adjustedTextX = textX - 10;
    }

    if (midAngle > 0) {
      // 下半部分，文本下移
      adjustedTextY = textY + 10;
    } else {
      // 上半部分，文本上移
      adjustedTextY = textY - 5;
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

// 转换趋势数据为图表所需格式
const transformTrendData = (data: any[]) => {
  const result: any[] = [];
  data.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'date') {
        result.push({
          date: item.date,
          type: key,
          value: item[key],
        });
      }
    });
  });
  return result;
};

const PortfolioData = () => {
  // 状态管理
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // 数据状态（移除模拟数据，初始化为空数组）
  const [assetRatioData, setAssetRatioData] = useState<any[]>([]); // 当前资产占比
  const [trendData, setTrendData] = useState<any[]>([]); // 近7日趋势
  const [historyData, setHistoryData] = useState<any[]>([]); // 持仓历史记录

  // 接口请求函数
  // 1. 获取用户当前资产占比（修改接口地址，添加token请求头）
  const fetchUserAssetData = async () => {
    try {
      // 获取token
      const authToken = localStorage.getItem('access_token') || 'your_actual_token_here';
      
      const res = await axios.get('http://localhost:8080/portfolio/userId', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (res.data.code === 200) {
        // 转换为页面所需格式
        const formattedData = res.data.data.map((item: any) => ({
          type: item.assetType,
          value: item.percentage,
          amount: formatAssetAmount(item.assetType, item.amount),
          valueNum: formatUsdValue(item.usdValue),
          color: ASSET_COLOR_MAP[item.assetType as keyof typeof ASSET_COLOR_MAP] || '#1890ff',
        }));
        setAssetRatioData(formattedData);
      } else {
        setError(`获取用户资产失败: ${res.data.msg}`);
        setAssetRatioData([]);
      }
    } catch (err) {
      setError(`获取用户资产失败: ${(err as Error).message}`);
      setAssetRatioData([]);
    }
  };

  // 2. 获取组合历史持仓记录（保持不变）
  const fetchPortfolioHistory = async (portfolioId: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/portfolio/portfolioId/${portfolioId}`);
      if (res.data.code === 200) {
        // 按时间分组转换为历史记录格式
        const recordMap = new Map();

        // 先分组（按快照时间）
        res.data.data.forEach((item: any) => {
          const timeKey = item.snapshotTime.split(' ')[0];
          if (!recordMap.has(timeKey)) {
            recordMap.set(timeKey, {
              date: item.snapshotTime,
              type: item.percentage > 0 ? 'AI建议调整' : '初始配置',
              reason: item.assetType.includes('测试') ? item.assetType : '系统自动调整',
              operator: '系统管理员',
              btc: { value: '0%', change: '' },
              eth: { value: '0%', change: '' },
              sol: { value: '0%', change: '' },
              usdt: { value: '0%', change: '' },
            });
          }

          // 填充对应币种数据
          const record = recordMap.get(timeKey);
          const assetKey = item.assetType.toLowerCase();
          if (record[assetKey]) {
            record[assetKey].value = `${item.percentage}%`;
            // 模拟变化值（实际可从接口获取）
            record[assetKey].change = item.percentage > 0 ? `+${(item.percentage % 10).toFixed(1)}%` : '';
          }
        });

        // 转换为数组并排序
        const formattedHistory = Array.from(recordMap.values())
          .sort((a: any, b: any) => dayjs(b.date).unix() - dayjs(a.date).unix())
          .map((item: any, index: number) => ({
            key: `${index + 1}`,
            ...item,
          }));

        setHistoryData(formattedHistory);
      } else {
        setError(`获取持仓历史失败: ${res.data.msg}`);
      }
    } catch (err) {
      setError(`获取持仓历史失败: ${(err as Error).message}`);
    }
  };

  // 3. 获取持仓趋势数据（支持不同时间范围）
  const fetchTrendHistory = async (historyId: number, days: number) => {
    try {
      const res = await axios.get(`http://localhost:8080/portfolio/getRecentHistory/${historyId}?days=${days}`);
      if (res.data.code === 200) {
        // 检查后端返回的数据是否为空
        if (res.data.data && res.data.data.length > 0) {
          // 根据天数构建趋势数据
          const baseDate = dayjs();
          const trendMap: any = {};

          // 收集所有出现过的资产类型
          const assetTypes = new Set<string>();
          res.data.data.forEach((item: any) => {
            assetTypes.add(item.assetType);
          });

          // 初始化数据，动态添加所有资产类型
          for (let i = days - 1; i >= 0; i--) {
            const date = baseDate.subtract(i, 'day').format('MM/DD');
            // 初始化为只包含date字段的对象
            trendMap[date] = { date };
            // 为每种资产类型添加初始值0
            assetTypes.forEach(type => {
              trendMap[date][type] = 0;
            });
          }

          // 填充接口返回的实际数据
          res.data.data.forEach((item: any) => {
            const date = dayjs(item.snapshotTime).format('MM/DD');
            if (trendMap[date]) {
              trendMap[date][item.assetType] = item.percentage;
            }
          });

          // 转换为数组
          const formattedTrendData = Object.values(trendMap);
          // 使用transformTrendData转换数据格式
          setTrendData(transformTrendData(formattedTrendData));
        } else {
          setTrendData([]);
        }
      } else {
        setError(`获取趋势数据失败: ${res.data.msg}`);
        setTrendData([]);
      }
    } catch (err) {
      setError(`获取趋势数据失败: ${(err as Error).message}`);
      setTrendData([]);
    }
  };

  // 刷新数据函数
  const refreshData = () => {
    setLoading(true);
    setError('');

    // 根据时间范围确定天数
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;

    // 并行请求接口
    Promise.allSettled([
      fetchUserAssetData(), // 不再传递userId参数
      fetchPortfolioHistory(DEFAULT_PARAMS.portfolioId),
      fetchTrendHistory(DEFAULT_PARAMS.historyId, days),
    ]).finally(() => {
      setLoading(false);
    });
  };

  // 页面初始化时加载数据
  useEffect(() => {
    refreshData();
  }, []);

  // 切换时间范围时重新获取趋势数据
  useEffect(() => {
    setLoading(true);
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    fetchTrendHistory(DEFAULT_PARAMS.historyId, days).then(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // 导出Excel功能
  const exportToExcel = () => {
    try {
      // 准备要导出的数据
      const exportData = assetRatioData.map(item => ({
        '币种': item.type,
        '占比': `${item.value}%`,
        '数量': item.amount,
        '价值': item.valueNum,
      }));

      // 创建一个工作簿
      const workbook = XLSX.utils.book_new();

      // 创建工作表
      const worksheet = XLSX.utils.json_to_sheet(exportData);

      // 设置列宽
      worksheet['!cols'] = [
        { wch: 10 }, // 币种列宽
        { wch: 10 }, // 占比列宽
        { wch: 20 }, // 数量列宽
        { wch: 20 }, // 价值列宽
      ];

      // 将工作表添加到工作簿
      XLSX.utils.book_append_sheet(workbook, worksheet, '资产占比数据');

      // 导出工作簿
      XLSX.writeFile(workbook, `持仓数据_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    } catch (error) {
      console.error('导出Excel失败:', error);
    }
  };

  // 持仓历史表格列配置（保持不变）
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

  // 折线图配置（保持不变）
  const lineConfig = {
    data: trendData,
    xField: 'date',
    yField: 'value',
    seriesField: 'type',
    yAxis: {
      title: {
        text: '占比 (%)',
        style: {
          fill: '#666',
        },
      },
      formatter: (v: number) => `${v}%`,
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
    // 动态颜色映射，优先使用ASSET_COLOR_MAP，然后使用默认颜色
    color: (type: string) => {
      return ASSET_COLOR_MAP[type as keyof typeof ASSET_COLOR_MAP] || '#1890ff';
    },
    lineStyle: {
      lineWidth: 2,
    },
    point: {
      size: 4,
      shape: 'circle',
      style: {
        fill: '#fff',
        stroke: (item: any) => {
          return ASSET_COLOR_MAP[item.type as keyof typeof ASSET_COLOR_MAP] || '#1890ff';
        },
        strokeWidth: 2,
      },
    },
    smooth: true,
    tooltip: {
      showCrosshairs: true,
      shared: true,
      formatter: (datum: any) => ({
        name: datum.type,
        value: `${datum.value}%`,
      }),
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

  // 计算总资产
  const totalAsset = assetRatioData.reduce((sum, item) => {
    const num = parseFloat(item.valueNum.replace(/[$,]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 顶部导航栏 */}
      <Header style={{
        background: '#fff',
        padding: '0 24px',
        borderBottom: '1px solid #e8e8e8',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '64px',
        lineHeight: '64px',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
      }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#1890ff' }}>
          AI数字货币投资辅助系统
        </div>
        <div style={{ display: 'flex', gap: 16 }}>
          <Button
            type="text"
            icon={<HomeOutlined />}
            onClick={() => history.push('/crypto-ai/dashboard')}
            style={{ color: '#1890ff', fontWeight: 500 }}
          >
            系统概览
          </Button>
          <Button
            type="text"
            icon={<MessageOutlined />}
            onClick={() => history.push('/crypto-ai/message-list')}
            style={{ color: '#666', fontWeight: 500 }}
          >
            消息列表
          </Button>
          <Button
            type="text"
            icon={<BarChartOutlined />}
            onClick={() => history.push('/crypto-ai/portfolio-data')}
            style={{ color: '#1890ff', fontWeight: 500 }}
          >
            持仓数据
          </Button>
          <Button
            type="text"
            icon={<FileTextOutlined />}
            onClick={() => history.push('/crypto-ai/suggestion-report')}
            style={{ color: '#666', fontWeight: 500 }}
          >
            建议报告
          </Button>
        </div>
      </Header>

      {/* 主要内容区域 */}
      <div style={{ padding: '24px', background: '#f5f5f5', flex: 1 }}>
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
                总资产规模: <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{formatUsdValue(totalAsset)}</span>
                <span style={{ marginLeft: '16px', fontSize: '12px', color: '#999' }}>
                  基于实时汇率计算 • 更新时间: {dayjs().format('YYYY-MM-DD HH:mm')}
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
                onClick={exportToExcel}
              >
                导出Excel
              </Button>
              <Button
                icon={<ReloadOutlined />}
                onClick={refreshData}
                loading={loading}
              >
                刷新
              </Button>
            </Space>
          </div>

          {/* 错误提示 */}
          {error && (
            <Alert
              message="数据加载失败"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '24px' }}
              closable
              onClose={() => setError('')}
            />
          )}

          {/* 加载状态 */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Spin size="large" tip="正在加载数据..." />
            </div>
          ) : (
            <>
              {/* 资产占比 + 持仓趋势 */}
              <Row gutter={[24, 24]}>
                <Col lg={12} md={24} sm={24}>
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>当前资产占比</span>
                        <div style={{ fontSize: '12px', color: '#999' }}>
                          数据更新时间: {dayjs().format('YYYY-MM-DD HH:mm')}
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
                          {assetRatioData.length > 0 ? (
                            <PieChartWithLines data={assetRatioData} />
                          ) : (
                            <div style={{ color: '#999' }}>暂无资产数据</div>
                          )}
                        </div>
                      </Col>
                      <Col lg={12} sm={24}>
                        <div style={{ padding: '8px', marginTop: '10px' }}>
                          {assetRatioData.length > 0 ? (
                            assetRatioData.map((item) => (
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
                            ))
                          ) : (
                            <div style={{ textAlign: 'center', padding: '20px 0', color: '#999' }}>
                              暂无资产数据
                            </div>
                          )}
                        </div>
                      </Col>
                    </Row>
                  </Card>
                </Col>

                <Col lg={12} md={24} sm={24}>
                  <Card
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
                          {timeRange === '7d' ? '近7日' : timeRange === '30d' ? '近30日' : '近90日'}持仓变化
                        </span>
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
                      height: '100%',
                    }}
                    bodyStyle={{ paddingBottom: '24px', height: '100%' }}
                  >
                    <div style={{ height: '300px' }}>
                      {trendData.length > 0 ? (
                        <Line {...lineConfig} />
                      ) : (
                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                          暂无趋势数据
                        </div>
                      )}
                    </div>

                    {/* 自定义图例 */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      marginTop: '16px',
                      gap: '24px',
                      flexWrap: 'wrap'
                    }}>
                      {Object.keys(ASSET_COLOR_MAP).map((assetType) => (
                        <div key={assetType} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '12px',
                            height: '12px',
                            borderRadius: '50%',
                            backgroundColor: ASSET_COLOR_MAP[assetType as keyof typeof ASSET_COLOR_MAP]
                          }} />
                          <span style={{ fontSize: '14px', color: '#333' }}>{assetType}</span>
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
                      共 {historyData.length} 条记录 • 最近更新: {dayjs().format('YYYY-MM-DD HH:mm')}
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
                  locale={{ emptyText: '暂无历史记录' }}
                />
              </Card>
            </>
          )}
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
    </Layout>
  );
};

export default PortfolioData;