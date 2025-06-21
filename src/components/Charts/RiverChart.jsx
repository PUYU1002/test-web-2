import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const ChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  overflow: hidden;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
  background: transparent;
`;

const TimelineContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.9);
  border-top: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  font-family: 'SimSun', '宋体', serif;
  font-size: 0.8rem;
  color: #2F4F4F;
`;

function RiverChart({ data, category = '门派', colors = ['#D2691E', '#CD853F', '#B0C4DE', '#708090'] }) {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });
  const [hoveredPoint, setHoveredPoint] = useState(null);

  // 模拟武侠电影数据
  const movieData = [
    // 1967-1990年代经典武侠片
    { year: 1967, movie: '龙门客栈', value1: 85, value2: 45, value3: 30, value4: 20 },
    { year: 1970, movie: '侠女', value1: 90, value2: 50, value3: 35, value4: 25 },
    { year: 1971, movie: '新独臂刀', value1: 80, value2: 60, value3: 40, value4: 30 },
    { year: 1973, movie: '四大名捕之血滴子', value1: 75, value2: 65, value3: 45, value4: 35 },
    { year: 1979, movie: '空山灵雨', value1: 70, value2: 70, value3: 50, value4: 40 },
    { year: 1982, movie: '少林寺', value1: 95, value2: 75, value3: 55, value4: 45 },
    { year: 1984, movie: '蜀山剑侠传', value1: 85, value2: 80, value3: 60, value4: 50 },
    { year: 1987, movie: '倩女幽魂', value1: 90, value2: 85, value3: 65, value4: 55 },
    { year: 1988, movie: '黄飞鸿', value1: 100, value2: 90, value3: 70, value4: 60 },
    { year: 1990, movie: '笑傲江湖', value1: 95, value2: 95, value3: 75, value4: 65 },
    
    // 1991-1993年武侠片黄金时期
    { year: 1991, movie: '黄飞鸿', value1: 100, value2: 100, value3: 80, value4: 70 },
    { year: 1991, movie: '双镖记', value1: 85, value2: 90, value3: 70, value4: 60 },
    { year: 1992, movie: '新龙门客栈', value1: 95, value2: 95, value3: 85, value4: 75 },
    { year: 1992, movie: '黄飞鸿之二男儿当自强', value1: 90, value2: 100, value3: 90, value4: 80 },
    { year: 1992, movie: '武状元苏乞儿', value1: 85, value2: 85, value3: 75, value4: 65 },
    { year: 1992, movie: '鹿鼎记', value1: 80, value2: 80, value3: 70, value4: 60 },
    { year: 1992, movie: '武侠七公主', value1: 75, value2: 75, value3: 65, value4: 55 },
    { year: 1993, movie: '青蛇', value1: 90, value2: 85, value3: 80, value4: 70 },
    { year: 1993, movie: '太极张三丰', value1: 85, value2: 80, value3: 75, value4: 65 },
    { year: 1993, movie: '方世玉', value1: 80, value2: 75, value3: 70, value4: 60 },
    { year: 1993, movie: '倚天屠龙记之魔教教主', value1: 75, value2: 70, value3: 65, value4: 55 },
    { year: 1993, movie: '方世玉续集', value1: 70, value2: 65, value3: 60, value4: 50 },
    
    // 1993-2015年现代武侠发展
    { year: 1993, movie: '白发魔女传', value1: 80, value2: 75, value3: 70, value4: 60 },
    { year: 1993, movie: '少林足球', value1: 85, value2: 80, value3: 75, value4: 65 },
    { year: 1993, movie: '天龙八部之天山童姥', value1: 75, value2: 70, value3: 65, value4: 55 },
    { year: 1994, movie: '东邪西毒', value1: 95, value2: 90, value3: 85, value4: 75 },
    { year: 1994, movie: '新仙鹤神针', value1: 70, value2: 65, value3: 60, value4: 50 },
    { year: 1994, movie: '六指琴魔', value1: 75, value2: 70, value3: 65, value4: 55 },
    { year: 1995, movie: '刀', value1: 80, value2: 75, value3: 70, value4: 60 },
    { year: 2000, movie: '卧虎藏龙', value1: 100, value2: 95, value3: 90, value4: 80 },
    { year: 2002, movie: '英雄', value1: 95, value2: 90, value3: 85, value4: 75 },
    { year: 2007, movie: '投名状', value1: 85, value2: 80, value3: 75, value4: 65 },
    { year: 2007, movie: '墨攻', value1: 80, value2: 75, value3: 70, value4: 60 },
    { year: 2007, movie: '见龙卸甲', value1: 75, value2: 70, value3: 65, value4: 55 },
    { year: 2010, movie: '剑雨', value1: 85, value2: 80, value3: 75, value4: 65 },
    { year: 2012, movie: '一代宗师', value1: 95, value2: 90, value3: 85, value4: 75 },
    { year: 2012, movie: '四大名捕', value1: 80, value2: 75, value3: 70, value4: 60 },
    { year: 2015, movie: '师父', value1: 85, value2: 80, value3: 75, value4: 65 },
    { year: 2015, movie: '绣春刀', value1: 90, value2: 85, value3: 80, value4: 70 }
  ];

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: width - 40, height: height - 100 });
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!movieData.length || !dimensions.width) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 40, right: 40, bottom: 80, left: 40 };
    const width = dimensions.width - margin.left - margin.right;
    const height = dimensions.height - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 创建比例尺
    const xScale = d3.scaleLinear()
      .domain(d3.extent(movieData, d => d.year))
      .range([0, width]);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(movieData, d => d.value1 + d.value2 + d.value3 + d.value4)])
      .range([height, 0]);

    // 创建堆叠数据
    const stack = d3.stack()
      .keys(['value1', 'value2', 'value3', 'value4'])
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetWiggle);

    const stackedData = stack(movieData);

    // 创建区域生成器
    const area = d3.area()
      .x(d => xScale(d.data.year))
      .y0(d => yScale(d[0]))
      .y1(d => yScale(d[1]))
      .curve(d3.curveBasis);

    // 绘制河流图层
    stackedData.forEach((layer, i) => {
      g.append('path')
        .datum(layer)
        .attr('fill', colors[i])
        .attr('opacity', 0.8)
        .attr('d', area)
        .style('mix-blend-mode', 'multiply');
    });

    // 添加数据点和标签
    movieData.forEach((d, i) => {
      const x = xScale(d.year);
      const y = yScale((d.value1 + d.value2 + d.value3 + d.value4) / 2);

      // 添加数据点
      g.append('circle')
        .attr('cx', x)
        .attr('cy', y)
        .attr('r', 3)
        .attr('fill', 'white')
        .attr('stroke', '#2F4F4F')
        .attr('stroke-width', 1)
        .style('cursor', 'pointer')
        .on('mouseover', function(event) {
          setHoveredPoint({ x: event.pageX, y: event.pageY, data: d });
          d3.select(this).attr('r', 5);
        })
        .on('mouseout', function() {
          setHoveredPoint(null);
          d3.select(this).attr('r', 3);
        });

      // 添加电影名称标签（选择性显示）
      if (i % 3 === 0 || d.value1 > 90) {
        g.append('text')
          .attr('x', x)
          .attr('y', y - 10)
          .attr('text-anchor', 'middle')
          .attr('font-family', 'SimSun, 宋体, serif')
          .attr('font-size', '10px')
          .attr('fill', '#2F4F4F')
          .text(d.movie);
      }
    });

    // 添加时间轴
    const xAxis = d3.axisBottom(xScale)
      .tickFormat(d3.format('d'))
      .ticks(10);

    g.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('font-family', 'SimSun, 宋体, serif')
      .attr('font-size', '12px')
      .attr('fill', '#2F4F4F');

    // 添加网格线
    g.selectAll('.grid-line')
      .data(xScale.ticks(10))
      .enter()
      .append('line')
      .attr('class', 'grid-line')
      .attr('x1', d => xScale(d))
      .attr('x2', d => xScale(d))
      .attr('y1', 0)
      .attr('y2', height)
      .attr('stroke', '#E0E0E0')
      .attr('stroke-width', 1)
      .attr('opacity', 0.5);

  }, [movieData, dimensions, colors, category]);

  return (
    <ChartContainer ref={containerRef}>
      <ChartSvg ref={svgRef} />
      
      {hoveredPoint && (
        <div
          style={{
            position: 'fixed',
            left: hoveredPoint.x + 10,
            top: hoveredPoint.y - 10,
            background: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #D3D3D3',
            borderRadius: '4px',
            padding: '8px',
            fontSize: '12px',
            fontFamily: 'SimSun, 宋体, serif',
            color: '#2F4F4F',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
            {hoveredPoint.data.movie}
          </div>
          <div>年份: {hoveredPoint.data.year}</div>
          <div>门派影响: {hoveredPoint.data.value1}</div>
          <div>精神内核: {hoveredPoint.data.value2}</div>
          <div>武功展现: {hoveredPoint.data.value3}</div>
          <div>文化传承: {hoveredPoint.data.value4}</div>
        </div>
      )}

      <TimelineContainer>
        <div>1967年 - 武侠电影起源</div>
        <div>1991-1993年 - 黄金时代</div>
        <div>2000年后 - 现代武侠</div>
      </TimelineContainer>
    </ChartContainer>
  );
}

export default RiverChart; 