import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';
import Loading from '../Common/Loading';

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
  font-size: 24px;
  font-weight: 600;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 500px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 100%);
  border: 1px solid rgba(212, 175, 55, 0.1);
  
  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
`;

const TooltipContainer = styled.div`
  position: absolute;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: #e2e8f0;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  pointer-events: none;
  z-index: 1000;
  opacity: 0;
  transition: opacity 0.3s ease;
  border: 1px solid rgba(212, 175, 55, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  max-width: 250px;
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

const WuxiaRiverChart = ({ 
  dimension = 'sect', 
  width = 1000, 
  height = 600,
  onMovieClick 
}) => {
  const svgRef = useRef();
  const tooltipRef = useRef();
  const [riverData, setRiverData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('value'); // value, rating, year
  const [animationSpeed, setAnimationSpeed] = useState('normal');

  // 维度标题映射
  const dimensionTitles = {
    sect: '门派河流图',
    martialArts: '武功河流图',
    chivalry: '侠义精神河流图'
  };

  // 颜色方案映射
  const colorSchemes = {
    sect: {
      primary: '#d4af37',
      secondary: '#f6e05e',
      gradient: ['#8b4513', '#d4af37', '#f6e05e']
    },
    martialArts: {
      primary: '#e53e3e',
      secondary: '#fc8181',
      gradient: ['#742a2a', '#e53e3e', '#fc8181']
    },
    chivalry: {
      primary: '#3182ce',
      secondary: '#63b3ed',
      gradient: ['#2c5282', '#3182ce', '#63b3ed']
    }
  };

  // 生成模拟数据
  const generateMockData = (dimension) => {
    const movies = [
      { title: '龙门客栈', year: 1967, rating: 8.5, category: '门派', value: 95 },
      { title: '独臂刀', year: 1967, rating: 8.2, category: '武功', value: 88 },
      { title: '大醉侠', year: 1966, rating: 8.0, category: '精神', value: 82 },
      { title: '侠女', year: 1971, rating: 8.8, category: '门派', value: 92 },
      { title: '天涯明月刀', year: 1976, rating: 8.3, category: '武功', value: 85 },
      { title: '楚留香', year: 1977, rating: 8.1, category: '精神', value: 80 },
      { title: '倚天屠龙记', year: 1978, rating: 8.4, category: '门派', value: 87 },
      { title: '射雕英雄传', year: 1983, rating: 8.6, category: '门派', value: 90 },
      { title: '笑傲江湖', year: 1990, rating: 8.7, category: '精神', value: 93 },
      { title: '东方不败', year: 1992, rating: 8.9, category: '武功', value: 96 },
      { title: '新龙门客栈', year: 1992, rating: 8.8, category: '门派', value: 94 },
      { title: '白发魔女传', year: 1993, rating: 8.2, category: '精神', value: 83 },
      { title: '东邪西毒', year: 1994, rating: 8.5, category: '精神', value: 89 },
      { title: '刀', year: 1995, rating: 8.1, category: '武功', value: 81 },
      { title: '大话西游', year: 1995, rating: 9.2, category: '精神', value: 98 },
      { title: '风云雄霸天下', year: 1998, rating: 8.0, category: '武功', value: 78 },
      { title: '卧虎藏龙', year: 2000, rating: 8.6, category: '门派', value: 91 },
      { title: '英雄', year: 2002, rating: 8.3, category: '精神', value: 86 },
      { title: '十面埋伏', year: 2004, rating: 8.1, category: '武功', value: 79 },
      { title: '叶问', year: 2008, rating: 8.4, category: '武功', value: 88 },
      { title: '一代宗师', year: 2013, rating: 8.5, category: '武功', value: 90 },
      { title: '绣春刀', year: 2014, rating: 8.1, category: '门派', value: 82 }
    ];
    return movies;
  };

  useEffect(() => {
    setLoading(true);
    try {
      const data = generateMockData(dimension);
      
      // 按年份分组数据
      const groupedByYear = d3.group(data, d => d.year);
      const processedData = Array.from(groupedByYear, ([year, movies]) => {
        const categories = d3.group(movies, d => d.category);
        const categoryData = Array.from(categories, ([category, categoryMovies]) => ({
          category,
          count: categoryMovies.length,
          totalValue: d3.sum(categoryMovies, d => d.value),
          avgValue: d3.mean(categoryMovies, d => d.value),
          avgRating: d3.mean(categoryMovies, d => d.rating),
          movies: categoryMovies
        }));
        
        return {
          year,
          categories: categoryData,
          totalMovies: movies.length,
          totalValue: d3.sum(movies, d => d.value)
        };
      }).sort((a, b) => a.year - b.year);

      setRiverData(processedData);
    } catch (error) {
      console.error('Error loading river chart data:', error);
    } finally {
      setLoading(false);
    }
  }, [dimension]);

  useEffect(() => {
    if (!riverData || riverData.length === 0) return;

    const renderChart = () => {
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove();

      // 获取容器的实际尺寸
      const containerRect = svgRef.current.parentElement.getBoundingClientRect();
      const actualWidth = containerRect.width;
      const actualHeight = containerRect.height;

      if (actualWidth <= 0 || actualHeight <= 0) return;

      const margin = { top: 40, right: 80, bottom: 80, left: 80 };
      const innerWidth = actualWidth - margin.left - margin.right;
      const innerHeight = actualHeight - margin.top - margin.bottom;

      // 创建主容器
      const g = svg
        .attr('width', actualWidth)
        .attr('height', actualHeight)
        .attr('viewBox', `0 0 ${actualWidth} ${actualHeight}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);

      // 获取所有类别
      const allCategories = [...new Set(riverData.flatMap(d => 
        d.categories.map(c => c.category)
      ))];

      // 创建堆叠数据
      const stackData = riverData.map(d => {
        const yearData = { year: d.year };
        allCategories.forEach(category => {
          const categoryInfo = d.categories.find(c => c.category === category);
          yearData[category] = categoryInfo ? 
            (viewMode === 'value' ? categoryInfo.totalValue :
             viewMode === 'rating' ? categoryInfo.avgRating * 10 :
             categoryInfo.count) : 0;
        });
        return yearData;
      });

      // 创建堆叠生成器
      const stack = d3.stack()
        .keys(allCategories)
        .order(d3.stackOrderNone)
        .offset(d3.stackOffsetWiggle);

      const stackedData = stack(stackData);

      // 比例尺
      const xScale = d3.scaleLinear()
        .domain(d3.extent(riverData, d => d.year))
        .range([0, innerWidth]);

      const yExtent = d3.extent(stackedData.flat(2));
      const yScale = d3.scaleLinear()
        .domain(yExtent)
        .range([innerHeight, 0]);

      // 颜色比例尺
      const colorScale = d3.scaleOrdinal()
        .domain(allCategories)
        .range(d3.schemeSet3);

      // 创建区域生成器
      const area = d3.area()
        .x(d => xScale(d.data.year))
        .y0(d => yScale(d[0]))
        .y1(d => yScale(d[1]))
        .curve(d3.curveCatmullRom);

      // 添加渐变定义
      const defs = svg.append('defs');
      allCategories.forEach((category, i) => {
        const gradient = defs.append('linearGradient')
          .attr('id', `gradient-${category.replace(/\s+/g, '-')}`)
          .attr('gradientUnits', 'userSpaceOnUse')
          .attr('x1', 0).attr('y1', innerHeight)
          .attr('x2', 0).attr('y2', 0);

        const color = colorScale(category);
        gradient.append('stop')
          .attr('offset', '0%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.3);

        gradient.append('stop')
          .attr('offset', '100%')
          .attr('stop-color', color)
          .attr('stop-opacity', 0.8);
      });

      // 绘制河流区域
      const rivers = g.selectAll('.river')
        .data(stackedData)
        .enter()
        .append('path')
        .attr('class', 'river')
        .attr('d', area)
        .attr('fill', d => `url(#gradient-${d.key.replace(/\s+/g, '-')})`)
        .attr('stroke', d => colorScale(d.key))
        .attr('stroke-width', 1)
        .style('cursor', 'pointer');

      // 添加电影数据点（角色头像位置）
      const moviePoints = g.selectAll('.movie-point')
        .data(riverData.flatMap(yearData => 
          yearData.categories.flatMap(category => 
            category.movies.map(movie => ({
              ...movie,
              year: yearData.year,
              category: category.category,
              categoryData: category
            }))
          )
        ))
        .enter()
        .append('circle')
        .attr('class', 'movie-point')
        .attr('cx', d => xScale(d.year))
        .attr('cy', d => {
          // 计算在河流中的位置
          const stackLayer = stackedData.find(layer => layer.key === d.category);
          if (!stackLayer) return yScale(0);
          
          const yearIndex = riverData.findIndex(yd => yd.year === d.year);
          if (yearIndex === -1) return yScale(0);
          
          const layerData = stackLayer[yearIndex];
          return yScale((layerData[0] + layerData[1]) / 2);
        })
        .attr('r', 0)
        .attr('fill', '#d4af37')
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer');

      // 添加坐标轴
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d'))
        .ticks(8);

      g.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(xAxis)
        .selectAll('text')
        .style('font-size', '12px')
        .style('fill', '#e2e8f0');

      // 添加轴标签
      g.append('text')
        .attr('class', 'x-label')
        .attr('x', innerWidth / 2)
        .attr('y', innerHeight + 50)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('fill', '#d4af37')
        .text('年份');

      // 添加图例
      const legend = g.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth + 20}, 20)`);

      allCategories.forEach((category, i) => {
        const legendItem = legend.append('g')
          .attr('transform', `translate(0, ${i * 25})`);

        legendItem.append('rect')
          .attr('width', 15)
          .attr('height', 15)
          .attr('fill', colorScale(category))
          .attr('opacity', 0.8);

        legendItem.append('text')
          .attr('x', 20)
          .attr('y', 12)
          .style('font-size', '12px')
          .style('fill', '#e2e8f0')
          .text(category);
      });

      // 动画效果
      const animationDuration = animationSpeed === 'slow' ? 2000 : 
                               animationSpeed === 'fast' ? 500 : 1000;

      // 河流区域动画
      rivers
        .style('opacity', 0)
        .transition()
        .duration(animationDuration)
        .delay((d, i) => i * 100)
        .style('opacity', 1);

      // 电影点动画
      moviePoints
        .transition()
        .duration(animationDuration)
        .delay((d, i) => i * 50)
        .attr('r', 4);

      // 交互事件
      moviePoints
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)
            .attr('stroke-width', 3);

          // 显示工具提示
          const tooltip = d3.select(tooltipRef.current);
          tooltip
            .style('opacity', 1)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 10) + 'px')
            .html(`
              <div style="color: #d4af37; font-weight: bold; margin-bottom: 8px;">${d.title}</div>
              <div><strong>年份:</strong> ${d.year}</div>
              <div><strong>评分:</strong> ${d.rating}</div>
              <div><strong>类别:</strong> ${d.category}</div>
              <div><strong>得分:</strong> ${d.value.toFixed(1)}</div>
              <div style="margin-top: 8px; font-size: 11px; color: #a0aec0;">
                点击查看详情
              </div>
            `);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 4)
            .attr('stroke-width', 2);

          d3.select(tooltipRef.current)
            .style('opacity', 0);
        })
        .on('click', function(event, d) {
          if (onMovieClick) {
            onMovieClick(d);
          }
        });

      // 河流区域交互
      rivers
        .on('mouseover', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.9)
            .attr('stroke-width', 2);
        })
        .on('mouseout', function(event, d) {
          d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('stroke-width', 1);
        });

    };

    renderChart();

    // 添加窗口resize事件监听器
    const handleResize = () => {
      setTimeout(renderChart, 100); // 延迟重新渲染以避免频繁调用
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };

  }, [riverData, viewMode, animationSpeed, dimension]);

  if (loading) {
    return (
      <ChartContainer>
        <Loading text="生成武侠河流图数据中..." />
      </ChartContainer>
    );
  }

  if (!riverData || riverData.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>{dimensionTitles[dimension]}</ChartTitle>
        <div style={{ textAlign: 'center', color: '#a0aec0', padding: '40px' }}>
          暂无数据显示
        </div>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>{dimensionTitles[dimension]}</ChartTitle>
      
      <ControlPanel>
        <ControlButton 
          $active={viewMode === 'value'}
          onClick={() => setViewMode('value')}
        >
          按得分显示
        </ControlButton>
        <ControlButton 
          $active={viewMode === 'rating'}
          onClick={() => setViewMode('rating')}
        >
          按评分显示
        </ControlButton>
        <ControlButton 
          $active={viewMode === 'count'}
          onClick={() => setViewMode('count')}
        >
          按数量显示
        </ControlButton>
        
        <div style={{ width: '20px' }} />
        
        <ControlButton 
          $active={animationSpeed === 'slow'}
          onClick={() => setAnimationSpeed('slow')}
        >
          慢速
        </ControlButton>
        <ControlButton 
          $active={animationSpeed === 'normal'}
          onClick={() => setAnimationSpeed('normal')}
        >
          正常
        </ControlButton>
        <ControlButton 
          $active={animationSpeed === 'fast'}
          onClick={() => setAnimationSpeed('fast')}
        >
          快速
        </ControlButton>
      </ControlPanel>

      <ChartWrapper>
        <svg ref={svgRef}></svg>
        <TooltipContainer ref={tooltipRef} />
      </ChartWrapper>

      <div style={{ 
        textAlign: 'center', 
        marginTop: '15px', 
        color: '#a0aec0', 
        fontSize: '14px' 
      }}>
        💡 提示：鼠标悬停查看电影详情，点击圆点可跳转到电影详情页
      </div>
    </ChartContainer>
  );
};

export default WuxiaRiverChart; 