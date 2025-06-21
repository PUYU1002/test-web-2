import React, { useEffect, useRef, useImperativeHandle, forwardRef, useCallback, useMemo } from 'react';
import * as echarts from 'echarts';
import 'echarts-wordcloud';

// 生成唯一ID的工具函数
const generateUUID = () => {
  return 'echarts-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
};

const EChartsComponent = forwardRef(({ 
  option, 
  style = { width: '100%', height: '100%' },
  className = '',
  onChartReady,
  onEvents = {},
  parentRef = null,        // 父容器引用，用于动态计算尺寸
  overHeight = 0,          // 需要减去的高度（如标题、边距等）
  autoResize = true,       // 是否自动响应尺寸变化
  theme = null,            // ECharts主题
  notMerge = false,        // setOption时是否不合并
  lazyUpdate = false       // setOption时是否延迟更新
}, ref) => {
  const chartRef = useRef();
  const chartInstance = useRef();
  const containerRef = useRef();
  const resizeTimerRef = useRef();
  
  // 生成唯一ID
  const chartId = useMemo(() => generateUUID(), []);

  // 暴露图表实例给父组件
  useImperativeHandle(ref, () => ({
    getEchartsInstance: () => chartInstance.current,
    resize: (opts) => {
      if (chartInstance.current) {
        if (opts) {
          chartInstance.current.resize(opts);
        } else {
          chartInstance.current.resize();
        }
      }
    },
    dispose: () => {
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    },
    setOption: (newOption, notMerge = false, lazyUpdate = false) => {
      if (chartInstance.current) {
        chartInstance.current.setOption(newOption, notMerge, lazyUpdate);
      }
    },
    getOption: () => {
      return chartInstance.current ? chartInstance.current.getOption() : null;
    },
    clear: () => {
      if (chartInstance.current) {
        chartInstance.current.clear();
      }
    }
  }));

  // 计算图表尺寸
  const calculateSize = useCallback(() => {
    if (!parentRef?.current || !containerRef.current) return null;
    
    const parentWidth = parentRef.current.offsetWidth;
    const parentHeight = parentRef.current.offsetHeight;
    
    return {
      width: parentWidth,
      height: Math.max(parentHeight - overHeight, 100) // 最小高度100px
    };
  }, [parentRef, overHeight]);

  // 更新图表尺寸
  const updateChartSize = useCallback(() => {
    if (!chartInstance.current) return;

    // 清除之前的定时器
    if (resizeTimerRef.current) {
      clearTimeout(resizeTimerRef.current);
    }

    // 使用防抖优化性能
    resizeTimerRef.current = setTimeout(() => {
      if (chartInstance.current) {
        const size = calculateSize();
        if (size) {
          chartInstance.current.resize(size);
        } else {
          chartInstance.current.resize();
        }
      }
    }, 100);
  }, [calculateSize]);

  // 初始化图表
  const initChart = useCallback(() => {
    if (!containerRef.current) return;

    // 如果实例已存在，先销毁
    if (chartInstance.current) {
      chartInstance.current.dispose();
    }

    // 创建新实例
    chartInstance.current = echarts.init(containerRef.current, theme);

    // 设置配置项
    if (option) {
      chartInstance.current.setOption(option, notMerge, lazyUpdate);
    }

    // 绑定事件
    Object.keys(onEvents).forEach(eventName => {
      if (typeof onEvents[eventName] === 'function') {
        chartInstance.current.on(eventName, onEvents[eventName]);
      }
    });

    // 初始化尺寸
    const size = calculateSize();
    if (size) {
      chartInstance.current.resize(size);
    }

    // 通知父组件图表已准备好
    if (onChartReady && typeof onChartReady === 'function') {
      onChartReady(chartInstance.current);
    }
  }, [option, theme, onEvents, onChartReady, calculateSize, notMerge, lazyUpdate]);

  // 初始化图表
  useEffect(() => {
    initChart();

    // 清理函数
    return () => {
      if (resizeTimerRef.current) {
        clearTimeout(resizeTimerRef.current);
      }
      if (chartInstance.current) {
        chartInstance.current.dispose();
        chartInstance.current = null;
      }
    };
  }, [initChart]);

  // 更新配置项
  useEffect(() => {
    if (chartInstance.current && option) {
      chartInstance.current.setOption(option, notMerge, lazyUpdate);
    }
  }, [option, notMerge, lazyUpdate]);

  // 处理窗口大小变化
  useEffect(() => {
    if (!autoResize) return;

    // 使用 passive 事件监听器优化性能
    window.addEventListener('resize', updateChartSize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', updateChartSize);
    };
  }, [autoResize, updateChartSize]);

  // 监听父容器尺寸变化（如果提供了parentRef）
  useEffect(() => {
    if (!parentRef?.current || !autoResize) return;

    // 使用ResizeObserver监听父容器尺寸变化
    const resizeObserver = new ResizeObserver(() => {
      updateChartSize();
    });

    resizeObserver.observe(parentRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [parentRef, autoResize, updateChartSize]);

  return (
    <div 
      id={chartId}
      ref={containerRef}
      style={style} 
      className={className}
    />
  );
});

EChartsComponent.displayName = 'EChartsComponent';

export default EChartsComponent; 