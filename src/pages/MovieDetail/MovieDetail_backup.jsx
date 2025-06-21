import React, { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import * as XLSX from 'xlsx'

// 全局字体样式
const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'AaGuDianKeBenSong';
    src: url('/assets/fonts/AaGuDianKeBenSong-2(1).ttf') format('truetype');
    font-weight: normal;
    font-style: normal;
  }
`

const DetailContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-image: url(${(props) => props.$backgroundUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding: 1rem;
  transition: background-image 2s ease-in-out;
`

const HeaderSection = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 8vh;
  margin: 2vh 2vw 1vh 2vw;
  flex-shrink: 0;
  padding: 0 2vw;
`

const BackButton = styled.button`
  background: none;
  border: none;
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: #8b4513;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5vw;

  &:hover {
    color: #d2691e;
  }
`

const MovieTitle = styled.h1`
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(1.5rem, 3vw, 2.5rem);
  font-weight: bold;
  color: #8b4513;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  margin: 0;
  letter-spacing: 0.2em;
`

const MovieInfo = styled.div`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: #696969;
  display: flex;
  gap: 2vw;
  align-items: center;
`

const MainContent = styled.div`
  display: flex;
  gap: 2vw;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 2vh 2vw;
`

const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 1vh;
  height: 70vh;
  min-height: 70vh;
  max-height: 70vh;
  overflow: hidden;
`

const TopLeftPanel = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 2;
  min-height: 0;
  background-image: url('/assets/images/各大洲分销国家数.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`

const BottomLeftSection = styled.div`
  display: flex;
  gap: 1vw;
  flex: 1;
  min-height: 0;
`

const BottomLeftPanel1 = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-image: url('/assets/images/气泡图-江湖门派.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`

const BottomLeftPanel2 = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  background-image: url('/assets/images/气泡图-侠义精神.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`

const RightPanel = styled.div`
  background-image: url('/assets/images/右边弯曲线条.png');
  background-size: 100% 100%;
  background-repeat: no-repeat;
  background-position: center;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 2;
  min-height: 0;
  position: relative;
  gap: 1vh;
`

// 右侧面板内的组件容器
const RightPanelTop = styled.div`
  flex: 1;
  display: flex;
  gap: 1vw;
`

// RightPanelTop 内部的两个子组件
const RightTopLeft = styled.div`
  flex: 4;
  padding: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
`

const RightTopRight = styled.div`
  flex: 6;
  position: relative;
`

// 坐标轴容器（透明）
const CoordinateContainer = styled.div`
  width: ${(props) => props.$width || '100%'};
  height: ${(props) => props.$height || '100%'};
  position: relative;
  overflow: visible;
  border-left: 2px solid transparent; /* Y轴透明 */
  border-bottom: 2px solid transparent; /* X轴透明 */

  /* X轴刻度线（透明） */
  &::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(
      to right,
      transparent,
      transparent 9%,
      transparent 9%,
      transparent 10%
    );
    pointer-events: none;
  }

  /* Y轴刻度线（透明） */
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: repeating-linear-gradient(
      to top,
      transparent,
      transparent 13%,
      transparent 13%,
      transparent 14%
    );
    pointer-events: none;
  }
`

// 气泡图容器
const BubbleContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  top: -20px;
`

// 坐标轴标签（透明）
const AxisLabel = styled.div`
  position: absolute;
  font-size: 10px;
  color: transparent; /* 标签透明 */
  pointer-events: none;

  &.x-axis {
    bottom: -15px;
    transform: translateX(-50%);
  }

  &.y-axis {
    left: -15px;
    transform: translateY(50%);
  }
`

// 气泡容器（固定高度，确保底部对齐）- 使用attrs优化性能
const BubbleWrapper = styled.div.attrs((props) => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
    width: `${props.$maxSize}px`,
    height: `${props.$maxSize / 2}px`,
  },
}))`
  position: absolute;
  display: flex;
  align-items: flex-end; /* 气泡对齐到容器底部 */
  justify-content: center;
`

// 单个气泡（半圆形状）- 使用attrs优化性能
const Bubble = styled.div.attrs((props) => ({
  style: {
    borderRadius: `${props.$size}px ${props.$size}px 0 0`,
    backgroundColor: props.$color,
    width: `${props.$size}px`,
    height: `${props.$size / 2}px`,
    opacity: props.$isPlaceholder ? 0 : 0.7,
    cursor: props.$isPlaceholder ? 'default' : 'pointer',
    boxShadow: props.$isPlaceholder ? 'none' : '0 2px 8px rgba(0,0,0,0.2)',
    fontSize: `${Math.max(8, props.$size / 6)}px`,
  },
}))`
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);

  &:hover {
    opacity: ${(props) => (props.$isPlaceholder ? 0 : 0.9)} !important;
    transform: ${(props) => (props.$isPlaceholder ? 'none' : 'scale(1.1)')};
    z-index: ${(props) => (props.$isPlaceholder ? 'auto' : 10)};
    box-shadow: ${(props) =>
      props.$isPlaceholder ? 'none' : '0 4px 16px rgba(0,0,0,0.3)'} !important;
  }
`

// 台词提示框
const DialogueTooltip = styled.div`
  position: absolute;
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
  max-width: 200px;
  word-wrap: break-word;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);

  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 6px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.9);
  }
`

const RightPanelMiddle = styled.div`
  flex: 1;
  position: relative;
  margin-left: 60px; /* 第二层左边间距 */
  margin-ringht: 20px; /* 第二层上边距 */
`

const RightPanelBottom = styled.div`
  flex: 1;
  position: relative;
  margin-left: 60px; /* 第三层左边间距 */
`

// 装饰元素已移除，右边弯曲线条现在作为RightPanel的背景

const DataSourcePanel = styled.div`
  position: absolute;
  bottom: 1vh;
  right: 1vw;
  width: 12vw;
  height: 6vh;
  background-image: url('/assets/images/图右下角数据来源.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  z-index: 200;
`

const MovieDetail = () => {
  const navigate = useNavigate()
  const { movieId } = useParams()
  const [currentBackground, setCurrentBackground] = useState(
    '/assets/images/detail/detail_1.png',
  )
  const [dialogueData, setDialogueData] = useState({
    segment1: [], // 25%
    segment2: [], // 35%
    segment3: [], // 40%
  })
  const [bubblePositions, setBubblePositions] = useState({
    segment1: [],
    segment2: [],
    segment3: [],
  })
  const [containerSizes, setContainerSizes] = useState({
    segment1: { width: 350, height: 180 },
    segment2: { width: 500, height: 250 },
    segment3: { width: 500, height: 250 },
  })
  const [tooltip, setTooltip] = useState({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  })

  const segment1Ref = useRef(null)
  const segment2Ref = useRef(null)
  const segment3Ref = useRef(null)

  // 情绪类型颜色映射
  const emotionColors = {
    喜: '#AAC5A7',
    怒: '#9CA79D',
    哀: '#A9AFC4',
    乐: '#B97D6B',
    恐: '#D8CCC4',
    惊: '#C6C0B9',
    厌: '#C3D4D5',
  }

  // 这个旧的位置映射已不再使用，由generateBubblePositions函数内部动态计算

  // 重叠范围控制变量（减小随机偏移）
  const overlapSettings = {
    xRange: 20, // X轴重叠范围（±10px）
    yRange: 1, // Y轴重叠范围（±2.5px）- 减小Y轴偏移确保在同一行
  }

  // 气泡展示范围控制变量
  const bubbleRangeSettings = {
    segment1: { width: '80%', height: '100%' }, // 第一段容器尺寸
    segment2: { width: '90%', height: '100%' }, // 第二段容器尺寸
    segment3: { width: '90%', height: '100%' }, // 第三段容器尺寸
  }

  // 每段气泡显示数量百分比控制变量
  const bubbleDisplaySettings = {
    segment1: {
      percentage: 0.6, // 显示60%的数据
      maxCount: 15, // 最大显示15个
    },
    segment2: {
      percentage: 0.8, // 显示80%的数据
      maxCount: 25, // 最大显示25个
    },
    segment3: {
      percentage: 1.0, // 显示100%的数据
      maxCount: 30, // 最大显示30个
    },
  }

  // 根据百分比和最大数量计算实际显示数量
  const calculateDisplayCount = (dataLength, percentage, maxCount) => {
    const percentageCount = Math.floor(dataLength * percentage)
    return Math.min(percentageCount, maxCount)
  }

  // 根据坐标系统生成气泡位置（同类型情绪在同一行）
  const generateBubblePositions = (
    data,
    containerWidth = 300,
    containerHeight = 150,
  ) => {
    const positions = []
    const emotions = ['喜', '怒', '哀', '乐', '厌', '恐', '惊'] // 从上到下的正确顺序

    // 坐标系设置
    const margin = 25 // 坐标轴边距
    const plotWidth = containerWidth - margin * 2
    const plotHeight = containerHeight - margin * 2

    // 计算最大气泡尺寸
    let maxBubbleSize = 15
    data.forEach((item) => {
      emotions.forEach((emotion) => {
        const value = parseFloat(item[emotion]) || 0
        if (value > 0) {
          const size = Math.max(15, Math.min(50, value * 20))
          if (size > maxBubbleSize) maxBubbleSize = size
        }
      })
    })

    // 为每种情绪类型分配固定的Y轴位置（7个情绪类型均匀分布，增加上下间距）
    const emotionYPositions = {}
    const emotionSpacing = 20 // 每种情绪类型之间的额外间距
    emotions.forEach((emotion, index) => {
      // 从顶部开始，每种情绪占据一个水平带
      // 计算基础位置，总体向上靠
      const ySpacing = plotHeight * 0.2 // 使用50%的高度来分布，更紧凑
      const yRatio = (index + 0.5) / emotions.length
      const baseY = margin * 0.2 + yRatio * ySpacing // 大幅减少顶部边距，整体上移

      // 添加累积的间距：每个情绪类型都比前一个多一些间距
      const additionalSpacing = index * emotionSpacing
      emotionYPositions[emotion] = baseY + additionalSpacing
    })

    console.log('情绪Y轴位置分配:', emotionYPositions)
    console.log('数据范围分析:', {
      数据条数: data.length,
      最大气泡尺寸: maxBubbleSize,
    })

    data.forEach((item, dataIndex) => {
      // 为每种情绪类型创建气泡（包括0值的透明占位）
      emotions.forEach((emotion) => {
        const value = parseFloat(item[emotion]) || 0

        // 计算气泡大小，基于情绪值
        const size = value === 0 ? 10 : Math.max(15, Math.min(50, value * 20)) // 0值时使用小尺寸占位

        // X轴坐标：基于数据序号（时间轴），均匀分布
        const xCoord =
          margin + (dataIndex / Math.max(1, data.length - 1)) * plotWidth
        const xOffset = (Math.random() - 0.5) * overlapSettings.xRange
        const x = xCoord + xOffset - maxBubbleSize / 2 // 居中对齐容器

        // Y轴坐标：直接使用情绪类型的固定位置（容器位置）
        const y = emotionYPositions[emotion]

        // 确保容器在坐标系范围内
        const finalX = Math.max(
          margin,
          Math.min(containerWidth - maxBubbleSize, x),
        )
        const finalY = Math.max(
          margin,
          Math.min(containerHeight - margin - maxBubbleSize / 2, y),
        )

        positions.push({
          x: finalX,
          y: finalY,
          size: size,
          maxSize: maxBubbleSize, // 最大气泡尺寸
          data: item,
          emotion: emotion,
          emotionValue: value,
          index: dataIndex,
          dataIndex: dataIndex,
          emotionType: emotion, // 情绪类型
          isPlaceholder: value === 0, // 标记是否为占位元素
        })
      })
    })

    console.log('生成气泡位置:', positions.length, '个气泡')
    return positions
  }

  // 详情页背景图片列表
  const detailBackgrounds = [
    'detail_1.png',
    'detail_2.png',
    'detail_3.png',
    'detail_4.png',
    'detail_5.png',
    'detail_6.png',
    'detail_7.png',
    'detail_8.png',
    'detail_9.png',
    'detail_10.png',
    'detail_11.png',
    'detail_12.png',
    'detail_13.png',
    'detail_14.png',
    'detail_15.png',
    'detail_16.png',
    'detail_17.png',
    'detail_18.png',
    'detail_19.png',
    'detail_20.png',
    'detail_21.png',
    'detail_22.png',
    'detail_23.png',
    'detail_24.png',
    'detail_25.png',
    'detail_26.png',
    'detail_27.png',
    'detail_28.png',
    'detail_29.png',
    'detail_30.png',
    'detail_31.png',
    'detail_32.png',
    'detail_33.png',
    'detail_34.png',
    'detail_35.png',
    'detail_36.png',
    'detail_37.png',
    'detail_38.png',
    'detail_39.png',
    'detail_40.png',
    'detail_41.png',
    'detail_42.png',
    'detail_43.png',
    'detail_44.png',
    'detail_45.png',
    'detail_46.png',
  ]

  // 动态获取容器尺寸
  useEffect(() => {
    const updateContainerSizes = () => {
      const sizes = { ...containerSizes }

      if (segment1Ref.current) {
        const rect = segment1Ref.current.getBoundingClientRect()
        sizes.segment1 = { width: rect.width, height: rect.height }
      }

      if (segment2Ref.current) {
        const rect = segment2Ref.current.getBoundingClientRect()
        sizes.segment2 = { width: rect.width, height: rect.height }
      }

      if (segment3Ref.current) {
        const rect = segment3Ref.current.getBoundingClientRect()
        sizes.segment3 = { width: rect.width, height: rect.height }
      }

      setContainerSizes(sizes)
    }

    // 初始化时获取尺寸
    setTimeout(updateContainerSizes, 100)

    // 监听窗口大小变化
    window.addEventListener('resize', updateContainerSizes)
    return () => window.removeEventListener('resize', updateContainerSizes)
  }, [])

  // 读取Excel数据并分段
  useEffect(() => {
    const loadDialogueData = async () => {
      try {
        const response = await fetch(
          '/assets/data/6-卧虎藏龙_台词_情绪_整合.xlsx',
        )
        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // 按照25%, 35%, 40%分段
        const totalLength = jsonData.length
        const segment1Length = Math.floor(totalLength * 0.25)
        const segment2Length = Math.floor(totalLength * 0.3)

        const segment1 = jsonData.slice(0, segment1Length)
        const segment2 = jsonData.slice(
          segment1Length,
          segment1Length + segment2Length,
        )
        const segment3 = jsonData.slice(segment1Length + segment2Length)

        setDialogueData({
          segment1,
          segment2,
          segment3,
        })

        // 根据百分比设置计算每段显示的数据量
        const segment1Count = calculateDisplayCount(
          segment1.length,
          bubbleDisplaySettings.segment1.percentage,
          bubbleDisplaySettings.segment1.maxCount,
        )
        const segment2Count = calculateDisplayCount(
          segment2.length,
          bubbleDisplaySettings.segment2.percentage,
          bubbleDisplaySettings.segment2.maxCount,
        )
        const segment3Count = calculateDisplayCount(
          segment3.length,
          bubbleDisplaySettings.segment3.percentage,
          bubbleDisplaySettings.segment3.maxCount,
        )

        // 生成所有段落的气泡位置 - 使用百分比控制显示数量
        setBubblePositions({
          segment1:
            segment1.length > 0
              ? generateBubblePositions(
                  segment1.slice(0, segment1Count),
                  containerSizes.segment1.width,
                  containerSizes.segment1.height,
                )
              : [],
          segment2:
            segment2.length > 0
              ? generateBubblePositions(
                  segment2.slice(0, segment2Count),
                  containerSizes.segment2.width,
                  containerSizes.segment2.height,
                )
              : [],
          segment3:
            segment3.length > 0
              ? generateBubblePositions(
                  segment3.slice(0, segment3Count),
                  containerSizes.segment3.width,
                  containerSizes.segment3.height,
                )
              : [],
        })

        console.log('气泡显示数量:', {
          第一段: `${segment1Count}/${segment1.length} (${(
            bubbleDisplaySettings.segment1.percentage * 100
          ).toFixed(0)}%)`,
          第二段: `${segment2Count}/${segment2.length} (${(
            bubbleDisplaySettings.segment2.percentage * 100
          ).toFixed(0)}%)`,
          第三段: `${segment3Count}/${segment3.length} (${(
            bubbleDisplaySettings.segment3.percentage * 100
          ).toFixed(0)}%)`,
        })

        console.log('数据分段完成:', {
          总数据量: totalLength,
          第一段: segment1.length,
          第二段: segment2.length,
          第三段: segment3.length,
        })
      } catch (error) {
        console.error('读取Excel文件失败:', error)
      }
    }

    loadDialogueData()
  }, [containerSizes])

  // 背景切换逻辑
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBackground((prev) => {
        const currentIndex = detailBackgrounds.findIndex((img) =>
          prev.includes(img),
        )
        const nextIndex = (currentIndex + 1) % detailBackgrounds.length
        return `/assets/images/detail/${detailBackgrounds[nextIndex]}`
      })
    }, 8000) // 每8秒切换一次

    return () => clearInterval(interval)
  }, [detailBackgrounds])

  // 示例数据
  const movieData = {
    title: '六指琴魔',
    year: '1994',
    rating: '8.8',
    imdbRating: '7.9',
  }

  const handleBack = () => {
    navigate('/')
  }

  // 处理气泡鼠标悬停事件
  const handleBubbleMouseEnter = (event, bubble) => {
    if (bubble.isPlaceholder) return

    const rect = event.currentTarget.getBoundingClientRect()
    const dialogue =
      bubble.data['台词'] ||
      bubble.data['对话'] ||
      bubble.data['内容'] ||
      '暂无台词'

    setTooltip({
      visible: true,
      content: dialogue,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleBubbleMouseLeave = () => {
    setTooltip({
      visible: false,
      content: '',
      x: 0,
      y: 0,
    })
  }

  return (
    <>
      <GlobalStyle />
      <DetailContainer $backgroundUrl={currentBackground}>
        {/* 主要内容区域 */}
        <MainContent>
          {/* 左侧区域 */}
          <LeftSection>
            {/* 上部：各大洲分销国家数 */}
            <TopLeftPanel>{/* 背景图片已通过CSS设置 */}</TopLeftPanel>

            {/* 下部：分为两个小面板 */}
            <BottomLeftSection>
              <BottomLeftPanel1>{/* 江湖门派气泡图 */}</BottomLeftPanel1>
              <BottomLeftPanel2>{/* 侠义精神气泡图 */}</BottomLeftPanel2>
            </BottomLeftSection>
          </LeftSection>

          {/* 右侧面板 */}
          <RightPanel>
            <RightPanelTop>
              <RightTopLeft>
                <div
                  style={{
                    fontSize: '14px',
                    color: '#333',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                    第一段数据统计
                  </div>
                  <div style={{ marginBottom: '5px' }}>
                    数据量: {dialogueData.segment1.length}
                  </div>
                  {dialogueData.segment1.length > 0 &&
                    (() => {
                      const emotionStats = {}
                      const emotions = [
                        '喜',
                        '怒',
                        '哀',
                        '乐',
                        '恐',
                        '惊',
                        '厌',
                      ]
                      emotions.forEach((emotion) => {
                        emotionStats[emotion] = dialogueData.segment1.reduce(
                          (sum, item) => {
                            const value = parseFloat(item[emotion]) || 0
                            return sum + value
                          },
                          0,
                        )
                      })
                      return (
                        <div>
                          {Object.entries(emotionStats).map(
                            ([emotion, value]) => (
                              <div
                                key={emotion}
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  marginBottom: '3px',
                                  fontSize: '12px',
                                }}
                              >
                                <span style={{ color: emotionColors[emotion] }}>
                                  ■ {emotion}
                                </span>
                                <span>{Number(value).toFixed(2)}</span>
                              </div>
                            ),
                          )}
                        </div>
                      )
                    })()}
                </div>
              </RightTopLeft>
              <RightTopRight>
                <CoordinateContainer
                  $width={bubbleRangeSettings.segment1.width}
                  $height={bubbleRangeSettings.segment1.height}
                >
                  <BubbleContainer ref={segment1Ref}>
                    {bubblePositions.segment1.map((bubble, index) => (
                      <BubbleWrapper
                        key={index}
                        $x={bubble.x}
                        $y={bubble.y}
                        $maxSize={bubble.maxSize}
                      >
                        <Bubble
                          $color={emotionColors[bubble.emotion]}
                          $size={bubble.size}
                          $isPlaceholder={bubble.isPlaceholder}
                          title={
                            bubble.isPlaceholder
                              ? ''
                              : `序号: ${bubble.dataIndex}, 情绪: ${
                                  bubble.emotion
                                }, 强度: ${Number(bubble.emotionValue).toFixed(
                                  2,
                                )}`
                          }
                          onMouseEnter={(e) =>
                            handleBubbleMouseEnter(e, bubble)
                          }
                          onMouseLeave={handleBubbleMouseLeave}
                        ></Bubble>
                      </BubbleWrapper>
                    ))}
                    {/* X轴标签 */}
                    <AxisLabel className="x-axis" style={{ left: '25px' }}>
                      开始
                    </AxisLabel>
                    <AxisLabel className="x-axis" style={{ left: '50%' }}>
                      时间轴
                    </AxisLabel>
                    <AxisLabel className="x-axis" style={{ right: '25px' }}>
                      结束
                    </AxisLabel>
                    {/* Y轴情绪类型标签 */}
                    <AxisLabel className="y-axis" style={{ top: '30px' }}>
                      喜
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '50px' }}>
                      怒
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '70px' }}>
                      哀
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '90px' }}>
                      乐
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '110px' }}>
                      厌
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '130px' }}>
                      恐
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '150px' }}>
                      惊
                    </AxisLabel>
                  </BubbleContainer>
                </CoordinateContainer>
              </RightTopRight>
            </RightPanelTop>
            <RightPanelMiddle>
              <CoordinateContainer
                $width={bubbleRangeSettings.segment2.width}
                $height={bubbleRangeSettings.segment2.height}
              >
                <BubbleContainer ref={segment2Ref}>
                  {bubblePositions.segment2.map((bubble, index) => (
                    <BubbleWrapper
                      key={index}
                      $x={bubble.x}
                      $y={bubble.y}
                      $maxSize={bubble.maxSize}
                    >
                      <Bubble
                        $color={emotionColors[bubble.emotion]}
                        $size={bubble.size}
                        $isPlaceholder={bubble.isPlaceholder}
                        title={
                          bubble.isPlaceholder
                            ? ''
                            : `序号: ${bubble.dataIndex}, 情绪: ${
                                bubble.emotion
                              }, 强度: ${Number(bubble.emotionValue).toFixed(
                                2,
                              )}`
                        }
                        onMouseEnter={(e) => handleBubbleMouseEnter(e, bubble)}
                        onMouseLeave={handleBubbleMouseLeave}
                      ></Bubble>
                    </BubbleWrapper>
                  ))}
                  {/* X轴标签 */}
                  <AxisLabel className="x-axis" style={{ left: '25px' }}>
                    开始
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ left: '50%' }}>
                    时间轴
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ right: '25px' }}>
                    结束
                  </AxisLabel>
                  {/* Y轴情绪类型标签 */}
                  <AxisLabel className="y-axis" style={{ top: '40px' }}>
                    喜
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '65px' }}>
                    怒
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '90px' }}>
                    哀
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '115px' }}>
                    乐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '140px' }}>
                    厌
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '165px' }}>
                    恐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '190px' }}>
                    惊
                  </AxisLabel>
                </BubbleContainer>
              </CoordinateContainer>
            </RightPanelMiddle>
            <RightPanelBottom>
              <CoordinateContainer
                $width={bubbleRangeSettings.segment3.width}
                $height={bubbleRangeSettings.segment3.height}
              >
                <BubbleContainer ref={segment3Ref}>
                  {bubblePositions.segment3.map((bubble, index) => (
                    <BubbleWrapper
                      key={index}
                      $x={bubble.x}
                      $y={bubble.y}
                      $maxSize={bubble.maxSize}
                    >
                      <Bubble
                        $color={emotionColors[bubble.emotion]}
                        $size={bubble.size}
                        $isPlaceholder={bubble.isPlaceholder}
                        title={
                          bubble.isPlaceholder
                            ? ''
                            : `序号: ${bubble.dataIndex}, 情绪: ${
                                bubble.emotion
                              }, 强度: ${Number(bubble.emotionValue).toFixed(
                                2,
                              )}`
                        }
                        onMouseEnter={(e) => handleBubbleMouseEnter(e, bubble)}
                        onMouseLeave={handleBubbleMouseLeave}
                      ></Bubble>
                    </BubbleWrapper>
                  ))}
                  {/* X轴标签 */}
                  <AxisLabel className="x-axis" style={{ left: '25px' }}>
                    开始
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ left: '50%' }}>
                    时间轴
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ right: '25px' }}>
                    结束
                  </AxisLabel>
                  {/* Y轴情绪类型标签 */}
                  <AxisLabel className="y-axis" style={{ top: '40px' }}>
                    喜
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '65px' }}>
                    怒
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '90px' }}>
                    哀
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '115px' }}>
                    乐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '140px' }}>
                    厌
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '165px' }}>
                    恐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '190px' }}>
                    惊
                  </AxisLabel>
                </BubbleContainer>
              </CoordinateContainer>
            </RightPanelBottom>
          </RightPanel>
        </MainContent>

        {/* 数据来源标注 */}
        <DataSourcePanel />

        {/* 台词提示框 */}
        {tooltip.visible && (
          <DialogueTooltip
            style={{
              left: tooltip.x,
              top: tooltip.y,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            {tooltip.content}
          </DialogueTooltip>
        )}
      </DetailContainer>
    </>
  )
}

export default MovieDetail
