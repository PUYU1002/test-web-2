import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import styled from 'styled-components';

const PanelContainer = styled.div`
  width: 100%;
  height: 200px;
  background: transparent;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ChartContainer = styled.div`
  flex: 1;
  position: relative;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 4px;
  padding: 0.5rem;
`;

const ChartSvg = styled.svg`
  width: 100%;
  height: 100%;
`;

function StatisticsPanel({ data }) {
  const svgRef = useRef();

  // 模拟统计数据
  const statsData = [
    { category: '青春朝圣', domestic: 85, foreign: 65 },
    { category: '江湖民间', domestic: 92, foreign: 78 },
    { category: '玄幻奇侠', domestic: 78, foreign: 88 },
    { category: '正统门派', domestic: 95, foreign: 82 }
  ];

  useEffect(() => {
    if (!statsData.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 10, right: 10, bottom: 30, left: 10 };
    const width = 300 - margin.left - margin.right;
    const height = 120 - margin.top - margin.bottom;

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // 创建比例尺
    const xScale = d3.scaleBand()
      .domain(statsData.map(d => d.category))
      .range([0, width])
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);

    // 绘制国内评分柱状图
    g.selectAll('.bar-domestic')
      .data(statsData)
      .enter()
      .append('rect')
      .attr('class', 'bar-domestic')
      .attr('x', d => xScale(d.category))
      .attr('y', d => yScale(d.domestic))
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', d => height - yScale(d.domestic))
      .attr('fill', '#2F4F4F')
      .attr('opacity', 0.8);

    // 绘制国外评分柱状图
    g.selectAll('.bar-foreign')
      .data(statsData)
      .enter()
      .append('rect')
      .attr('class', 'bar-foreign')
      .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.foreign))
      .attr('width', xScale.bandwidth() / 2)
      .attr('height', d => height - yScale(d.foreign))
      .attr('fill', '#A9A9A9')
      .attr('opacity', 0.8);

    // 添加标签
    g.selectAll('.label')
      .data(statsData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
      .attr('y', height + 15)
      .attr('text-anchor', 'middle')
      .attr('font-family', 'SimSun, 宋体, serif')
      .attr('font-size', '8px')
      .attr('fill', '#2F4F4F')
      .text(d => d.category);

  }, [statsData]);

  return (
    <PanelContainer>
      <ChartContainer>
        <ChartSvg ref={svgRef} />
      </ChartContainer>
    </PanelContainer>
  );
}

export default StatisticsPanel; 