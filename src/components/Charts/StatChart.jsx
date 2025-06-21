import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import EChartsComponent from '../Common/EChartsComponent';
import { useChartConfig } from '../../hooks/useChartData';

const ChartContainer = styled.div`
  width: 100%;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 15px;
  padding: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  margin: 20px 0;
  border: 1px solid rgba(212, 175, 55, 0.2);
`;

const ChartTitle = styled.h3`
  text-align: center;
  color: #d4af37;
  margin-bottom: 20px;
  font-size: 20px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: ${props => props.height || '400px'};
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  border: 1px solid rgba(212, 175, 55, 0.1);
`;

const ControlPanel = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ControlButton = styled.button`
  background: ${props => props.$active ? 
    'linear-gradient(135deg, #d4af37 0%, #f6e05e 100%)' : 
    'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)'
  };
  color: ${props => props.$active ? '#1a1a2e' : '#e2e8f0'};
  border: 2px solid ${props => props.$active ? '#d4af37' : '#4a5568'};
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  box-shadow: ${props => props.$active ? 
    '0 4px 12px rgba(212, 175, 55, 0.3)' : 
    '0 2px 8px rgba(0, 0, 0, 0.2)'
  };

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.$active ? 
      '0 6px 16px rgba(212, 175, 55, 0.4)' : 
      '0 4px 12px rgba(0, 0, 0, 0.3)'
    };
  }

  &:active {
    transform: translateY(0);
  }
`;

const StatChart = ({ 
  title, 
  data, 
  type = 'bar', 
  height = '400px',
  showControls = true,
  customOptions = {}
}) => {
  const chartConfig = useChartConfig();
  const [chartType, setChartType] = useState(type);
  const [theme, setTheme] = useState('light');

  // 图表配置选项
  const chartOption = useMemo(() => {
    // 数据验证和处理
    if (!data) {
      return { backgroundColor: 'transparent' };
    }

    // 将数据转换为统一格式
    let processedData = [];
    if (Array.isArray(data)) {
      processedData = data.map(item => {
        if (typeof item === 'object' && item !== null) {
          return {
            name: item.name || item.label || item.key || String(item.x || ''),
            value: item.value || item.y || item.count || 0
          };
        }
        return { name: String(item), value: 1 };
      });
    } else if (typeof data === 'object' && data !== null) {
      processedData = Object.entries(data).map(([key, value]) => ({
        name: key,
        value: typeof value === 'number' ? value : 1
      }));
    } else {
      return { backgroundColor: 'transparent' };
    }

    // 如果处理后的数据为空，返回空配置
    if (processedData.length === 0) {
      return { backgroundColor: 'transparent' };
    }

    const baseOption = {
      backgroundColor: 'transparent',
      textStyle: {
        fontFamily: 'SourceHanSansCN-Regular, sans-serif',
        color: '#e2e8f0'
      },
      animation: true,
      animationDuration: 1000,
      animationEasing: 'cubicOut',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        borderColor: 'rgba(212, 175, 55, 0.3)',
        textStyle: {
          color: '#e2e8f0',
          fontSize: 12
        },
        extraCssText: 'border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);'
      },
      legend: {
        top: 'bottom',
        textStyle: {
          color: '#a0aec0',
          fontSize: 12
        }
      },
      grid: {
        left: '10%',
        right: '10%',
        bottom: '15%',
        top: '10%',
        containLabel: true
      }
    };

    // 武侠主题色彩方案
    const wuxiaColors = [
      '#d4af37', '#f6e05e', '#ecc94b', '#d69e2e', '#b7791f',
      '#e53e3e', '#fc8181', '#f56565', '#ed8936', '#dd6b20',
      '#3182ce', '#63b3ed', '#4299e1', '#2b77cb', '#2c5aa0'
    ];

    switch (chartType) {
      case 'bar':
        return {
          ...baseOption,
          color: wuxiaColors,
          xAxis: {
            type: 'category',
            data: processedData.map(d => d.name),
            axisLabel: {
              color: '#a0aec0',
              fontSize: 11
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.3)'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: '#a0aec0',
              fontSize: 11
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.3)'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.1)'
              }
            }
          },
          series: [{
            type: 'bar',
            data: processedData.map(d => d.value),
            itemStyle: {
              borderRadius: [4, 4, 0, 0],
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            }
          }]
        };

      case 'pie':
        return {
          ...baseOption,
          color: wuxiaColors,
          series: [{
            type: 'pie',
            radius: ['40%', '70%'],
            center: ['50%', '50%'],
            data: processedData.map(d => ({
              name: d.name,
              value: d.value
            })),
            itemStyle: {
              borderRadius: 8,
              borderColor: '#1a1a2e',
              borderWidth: 2,
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            label: {
              color: '#e2e8f0',
              fontSize: 12
            },
            labelLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.5)'
              }
            }
          }]
        };

      case 'line':
        return {
          ...baseOption,
          color: wuxiaColors,
          xAxis: {
            type: 'category',
            data: processedData.map(d => d.name),
            axisLabel: {
              color: '#a0aec0',
              fontSize: 11
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.3)'
              }
            }
          },
          yAxis: {
            type: 'value',
            axisLabel: {
              color: '#a0aec0',
              fontSize: 11
            },
            axisLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.3)'
              }
            },
            splitLine: {
              lineStyle: {
                color: 'rgba(212, 175, 55, 0.1)'
              }
            }
          },
          series: [{
            type: 'line',
            data: processedData.map(d => d.value),
            smooth: true,
            lineStyle: {
              width: 3,
              shadowBlur: 10,
              shadowColor: 'rgba(212, 175, 55, 0.3)'
            },
            itemStyle: {
              borderWidth: 3,
              borderColor: '#fff',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.3)'
            },
            areaStyle: {
              opacity: 0.3
            }
          }]
        };

      default:
        return baseOption;
    }
  }, [data, chartType, customOptions]);

  const handleChartTypeChange = (newType) => {
    setChartType(newType);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  if (!data) {
    return (
      <ChartContainer>
        <ChartTitle>{title}</ChartTitle>
        <div style={{ 
          height: height, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          color: '#999'
        }}>
          暂无数据
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>{title}</ChartTitle>
      
      {showControls && (
        <ControlPanel>
          <ControlButton 
            $active={chartType === 'bar'}
            onClick={() => handleChartTypeChange('bar')}
          >
            柱状图
          </ControlButton>
          <ControlButton 
            $active={chartType === 'pie'}
            onClick={() => handleChartTypeChange('pie')}
          >
            饼图
          </ControlButton>
          <ControlButton 
            $active={chartType === 'line'}
            onClick={() => handleChartTypeChange('line')}
          >
            折线图
          </ControlButton>
        </ControlPanel>
      )}

      <ChartWrapper height={height}>
        <EChartsComponent
          option={chartOption}
          style={{ width: '100%', height: '100%' }}
        />
      </ChartWrapper>
    </ChartContainer>
  );
};

export default StatChart; 