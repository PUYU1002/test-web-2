import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
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

  /* 设置全局字体 */
  * {
    font-family: 'AaGuDianKeBenSong', serif !important;
  }
`

const DetailContainer = styled.div`
  height: 100vh;
  width: 100vw;
  background-image: ${(props) =>
    props.$backgroundUrl ? `url(${props.$backgroundUrl})` : 'none'};
  background-color: ${(props) =>
    props.$backgroundUrl ? 'transparent' : '#f5f5f5'};
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

// 头部容器
const HeaderContainer = styled.div`
  height: 4vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
`

// 头部标题组件（作为背景容器）
const HeaderTitle = styled.div`
  background-image: url('/assets/images/电影名称 年份 国内外评分.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: left center;
  height: 100%;
  width: 30vw;
  min-width: 18.75rem;
  display: flex;
  align-items: center;
  padding-left: 1.5vw;
`

// 返回按钮
const BackArrow = styled.button`
  background: none;
  border: none;
  color: #000000;
  font-size: clamp(1.2rem, 1.8vw, 1.5rem);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 0;
  margin-right: 0.5rem;

  &:hover {
    color: #666666;
    transform: translateX(-0.125rem);
    transition: all 0.2s ease;
  }
`

// 电影名称文字
const MovieNameText = styled.span`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: #000000;
  letter-spacing: 0.1em;
  font-weight: bold;
`

// 年份文字
const MovieYearText = styled.span`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: #000000;
  letter-spacing: 0.1em;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
`

// 评分容器
const RatingContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.8rem, 1.2vw, 1rem);
  color: #000000;
`

// 豆瓣评分
const DoubanRating = styled.span`
  display: flex;
  align-items: center;
  gap: 0.2rem;

  .rating-number {
    font-weight: bold;
    color: #000000;
  }

  .rating-label {
    font-size: 0.8em;
    color: #666666;
  }
`

// IMDB评分
const ImdbRating = styled.span`
  display: flex;
  align-items: center;
  gap: 0.2rem;

  .rating-number {
    font-weight: bold;
    color: #000000;
  }

  .rating-label {
    font-size: 0.8em;
    color: #666666;
  }
`

const HeaderSection = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.75rem;
  backdrop-filter: blur(0.625rem);
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
  text-shadow: 0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
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
  height: calc(
    100vh - 4vh - 2rem - 1vh
  ); /* 减去头部高度、容器padding和头部margin */
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
  gap: 0.5vh;
`

// 顶部标题区域
const TopLeftPanelHeader = styled.div`
  flex: 0 0 auto;
  height: 12%;
  background-image: url('/assets/images/电影词频统计气泡图.png');
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'AaGuDianKeBenSong', serif;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`

// 中间江湖门派区域
const TopLeftPanelSearch = styled.div`
  flex: 0 0 auto;
  height: 12%;
  background-image: url('/assets/images/气泡图-江湖门派.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
`

// 底部气泡图区域
const TopLeftPanelBubbles = styled.div`
  flex: 1;
  min-height: 60%;
`

// 搜索输入框样式
const SearchInput = styled.input`
  width: 100%;
  padding: 0.375rem 0.75rem;
  border: 0.0625rem solid #ccc;
  border-radius: 0.25rem;
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: 0.75rem;
  background: #f9f9f9;

  &::placeholder {
    color: #999;
  }

  &:focus {
    outline: none;
    border-color: #666;
    background: white;
  }
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
`

const BottomLeftPanel2 = styled.div`
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

// 底部面板标题容器
const BottomPanelTitle1 = styled.div`
  height: 3.75rem;
  background-image: url('/assets/images/气泡图-侠义精神.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
`

const BottomPanelTitle2 = styled.div`
  height: 3.75rem;
  background-image: url('/assets/images/气泡图-武林功夫.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
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
  display: flex;
  flex-direction: row;
  gap: 0.625rem;
`

// RightTopLeft 内部的两个容器
const RightTopLeftRadar = styled.div`
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
`

// 雷达图标题容器
const RadarTitleContainer = styled.div`
  height: 1.25rem;
  background-image: url('/assets/images/标题.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`

// 雷达图标题文字
const RadarTitleText = styled.span`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.8rem, 1vw, 1rem);
  font-weight: bold;
  color: #000000;
  text-align: center;
`

// 雷达图内容区域
const RadarContentArea = styled.div`
  flex: 1;
  position: relative;
`

const RightTopLeftInfo = styled.div`
  flex: 1;
  background-image: url('/assets/images/影片情绪多轴气泡图.png');
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
`

// 雷达图容器
const RadarChartContainer = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

// SVG雷达图
const RadarSVG = styled.svg`
  width: 90%;
  height: 90%;
  max-width: 18.75rem;
  max-height: 18.75rem;
`

// 雷达图网格线（多边形）
const RadarGridPolygon = styled.polygon`
  fill: none;
  stroke: #c3c1bf;
  stroke-width: 1;
`

// 雷达图轴线
const RadarAxisLine = styled.line`
  stroke: #c3c1bf;
  stroke-width: 1;
`

// 雷达图数据多边形
const RadarPolygon = styled.polygon`
  fill: rgba(195, 193, 191, 0.3);
  stroke: #c3c1bf;
  stroke-width: 2;
  stroke-linejoin: round;
`

// 雷达图数据点
const RadarDataPoint = styled.circle`
  fill: #c3c1bf;
  stroke: white;
  stroke-width: 2;
  r: 4;

  &:hover {
    r: 6;
    transition: r 0.2s ease;
  }
`

// 雷达图标签
const RadarLabel = styled.text`
  font-size: 0.75rem;
  font-weight: bold;
  fill: #545454;
  font-family: 'AaGuDianKeBenSong', serif;
  text-anchor: middle;
  dominant-baseline: central;
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
  border-left: 0.125rem solid transparent; /* Y轴透明 */
  border-bottom: 0.125rem solid transparent; /* X轴透明 */

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
  top: -1.25rem;
`

// 坐标轴标签（透明）
const AxisLabel = styled.div`
  position: absolute;
  font-size: 0.625rem;
  color: transparent; /* 标签透明 */
  pointer-events: none;

  &.x-axis {
    bottom: -0.9375rem;
    transform: translateX(-50%);
  }

  &.y-axis {
    left: -0.9375rem;
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
    boxShadow: 'none',
    fontSize: `${Math.max(8, props.$size / 6)}px`,
  },
}))`
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;

  &:hover {
    opacity: ${(props) => (props.$isPlaceholder ? 0 : 0.9)} !important;
    transform: ${(props) => (props.$isPlaceholder ? 'none' : 'scale(1.1)')};
    z-index: ${(props) => (props.$isPlaceholder ? 'auto' : 10)};
    box-shadow: none !important;
  }
`

// 台词提示框
const DialogueTooltip = styled.div`
  position: absolute;
  background: #f5f1e8;
  color: #333;
  border: 0.125rem solid #d0c0a8;
  border-radius: 0.5rem;
  font-family: 'AaGuDianKeBenSong', '宋体', serif;
  font-size: 0.875rem;
  min-width: 12.5rem;
  max-width: 21.875rem;
  padding: 1rem 1.25rem 1.25rem 1.25rem;
  word-wrap: break-word;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 0.375rem 1.25rem rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(0.3125rem);

  /* 小箭头 */
  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 0.5rem solid transparent;
    border-top-color: #d0c0a8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-0.125rem);
    border: 0.375rem solid transparent;
    border-top-color: #f5f1e8;
  }
`

// 情绪标签样式
const EmotionLabel = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.75rem;
  font-size: 0.6875rem;
  color: #999;
  font-weight: normal;
  opacity: 0.8;
`

// 台词内容样式
const DialogueContent = styled.div`
  margin-top: 0.75rem;
  line-height: 1.6;

  /* 台词引号样式 */
  .dialogue-line {
    margin: 0.375rem 0;
    padding: 0.125rem 0;
    position: relative;

    &::before {
      content: '"';
      color: #666;
    }

    &::after {
      content: '"';
      color: #666;
    }
  }
`

// 关键词标签样式 - 与情绪标签保持一致
const KeywordLabel = styled.div`
  position: absolute;
  top: 0.5rem;
  left: 0.75rem;
  font-size: 0.6875rem;
  color: #999;
  font-weight: normal;
  opacity: 0.8;
`

// 关键词内容样式 - 与台词内容保持一致
const KeywordContent = styled.div`
  margin-top: 0.75rem;
  line-height: 1.6;

  .keyword-info {
    margin: 0.25rem 0;
    padding: 0.125rem 0;
  }

  .keyword-word {
    font-weight: bold;
    font-size: 1em;
    color: #333;
  }

  .keyword-detail {
    font-size: 0.875em;
    color: #666;
  }
`

// 关键词气泡容器
const KeywordBubbleContainer = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible; /* 允许气泡完全显示 */
  display: flex;
  align-items: center;
  justify-content: center;
`

// 关键词气泡包装器
const KeywordBubbleWrapper = styled.div.attrs((props) => ({
  style: {
    left: `${props.$x}px`,
    top: `${props.$y}px`,
  },
}))`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: auto;
`

// 关键词文字容器
const KeywordBubbleText = styled.span`
  display: inline-block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: center;
  line-height: 1;
  z-index: 1;
  position: relative;
`

// 关键词气泡样式 - 与情绪气泡保持一致的浮动效果
const KeywordBubble = styled.div.attrs((props) => ({
  style: {
    width: `${props.$size}px`,
    height: `${props.$size}px`,
    fontSize: `${Math.max(9, props.$size / 6)}px`,
    backgroundColor: props.$color || '#f0f0f0',
  },
}))`
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #000000;
  font-weight: bold;
  text-shadow: none;
  font-family: 'AaGuDianKeBenSong', serif;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: none;
  opacity: 0.7;
  position: relative;

  /* 文字溢出处理 */
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 8%;
  box-sizing: border-box;

  /* 气泡背景图案 */
  background-image: url('/assets/images/气泡图图案.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  /* 与情绪气泡一致的hover效果 */
  &:hover {
    opacity: 0.9 !important;
    transform: scale(1.1);
    z-index: 10;
    box-shadow: none !important;
  }
`

// 关键词提示框 - 与台词提示框保持一致的样式
const KeywordTooltip = styled.div`
  position: absolute;
  background: #f5f1e8;
  color: #333;
  border: 0.125rem solid #d0c0a8;
  border-radius: 0.5rem;
  font-family: 'AaGuDianKeBenSong', '宋体', serif;
  font-size: 0.875rem;
  min-width: 8rem;
  max-width: 15rem;
  padding: 0.75rem 1rem;
  word-wrap: break-word;
  z-index: 1000;
  pointer-events: none;
  box-shadow: 0 0.375rem 1.25rem rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(0.3125rem);

  /* 小箭头 */
  &::before {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 0.5rem solid transparent;
    border-top-color: #d0c0a8;
  }

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-0.125rem);
    border: 0.375rem solid transparent;
    border-top-color: #f5f1e8;
  }
`

const RightPanelMiddle = styled.div`
  flex: 1;
  position: relative;
  margin-left: 3.75rem; /* 第二层左边间距 */
  margin-ringht: 1.25rem; /* 第二层上边距 */
`

const RightPanelBottom = styled.div`
  flex: 1;
  position: relative;
  margin-left: 3.75rem; /* 第三层左边间距 */
`

// 装饰元素已移除，右边弯曲线条现在作为RightPanel的背景

const DataSourcePanel = styled.div`
  position: absolute;
  bottom: 1vh;
  right: 1vw;
  width: 12vw;
  height: 6vh;
`

const MovieDetail = () => {
  const navigate = useNavigate()
  const { movieId } = useParams()
  const [searchParams] = useSearchParams()

  // 强制重新渲染的key，基于movieId和搜索参数变化
  const renderKey = React.useMemo(() => {
    return `${movieId || 'default'}-${
      searchParams.get('id') || ''
    }-${Date.now()}`
  }, [movieId, searchParams])

  // 重置所有状态的函数
  const resetAllStates = React.useCallback(() => {
    setCurrentMovieName('')
    setMovieData({
      title: '未知电影',
      year: '未知',
      rating: '0.0',
      imdbRating: '0.0',
    })
    setCurrentBackground('')
    setDialogueData({
      segment1: [],
      segment2: [],
      segment3: [],
    })
    setBubblePositions({
      segment1: [],
      segment2: [],
      segment3: [],
    })
    setContainerSizes({
      segment1: { width: 350, height: 180 },
      segment2: { width: 500, height: 250 },
      segment3: { width: 500, height: 250 },
    })
    setTooltip({
      visible: false,
      content: '',
      emotion: '',
      emotionValue: 0,
      dataIndex: 0,
      x: 0,
      y: 0,
    })
    setKeywordTooltip({
      visible: false,
      word: '',
      frequency: 0,
      category: '',
      x: 0,
      y: 0,
    })
    setIsLoading(false)
    setWordFrequencyData({
      门派: [],
      精神: [],
      武功: [],
    })
    setRadarData({
      南美: 5,
      北美: 6,
      亚洲: 3,
      欧洲: 4,
      南美洲: 5,
      大洋洲: 2,
      非洲: 1,
      中国: 0,
    })
    setKeywordBubbles({
      门派: { bubbles: [], containerSize: { width: 300, height: 200 } },
      精神: { bubbles: [], containerSize: { width: 300, height: 200 } },
      武功: { bubbles: [], containerSize: { width: 300, height: 200 } },
    })
  }, [])

  const [currentMovieName, setCurrentMovieName] = useState('')
  const [movieData, setMovieData] = useState({
    title: '未知电影',
    year: '未知',
    rating: '0.0',
    imdbRating: '0.0',
  })
  const [currentBackground, setCurrentBackground] = useState('')
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
    emotion: '',
    emotionValue: 0,
    dataIndex: 0,
    x: 0,
    y: 0,
  })
  const [keywordTooltip, setKeywordTooltip] = useState({
    visible: false,
    word: '',
    frequency: 0,
    category: '',
    x: 0,
    y: 0,
  })
  const [isLoading, setIsLoading] = useState(false)

  // 新增：词频数据状态
  const [wordFrequencyData, setWordFrequencyData] = useState({
    门派: [],
    精神: [],
    武功: [],
  })
  // 新增：雷达图数据状态（先设置测试数据）
  const [radarData, setRadarData] = useState({
    南美: 5,
    北美: 6,
    亚洲: 3,
    欧洲: 4,
    南美洲: 5,
    大洋洲: 2,
    非洲: 1,
    中国: 0,
  })
  const [keywordBubbles, setKeywordBubbles] = useState({
    门派: { bubbles: [], containerSize: { width: 300, height: 200 } },
    精神: { bubbles: [], containerSize: { width: 300, height: 200 } },
    武功: { bubbles: [], containerSize: { width: 300, height: 200 } },
  })

  // 监听路由参数变化，强制重置状态
  React.useEffect(() => {
    console.log('🔄 路由参数变化，重置所有状态:', {
      movieId,
      searchParams: searchParams.toString(),
    })
    resetAllStates()
  }, [movieId, searchParams.toString(), resetAllStates])

  const segment1Ref = useRef(null)
  const segment2Ref = useRef(null)
  const segment3Ref = useRef(null)

  // 添加关键词容器引用来获取真实尺寸
  const keywordContainer1Ref = useRef(null) // 门派容器
  const keywordContainer2Ref = useRef(null) // 精神容器
  const keywordContainer3Ref = useRef(null) // 武功容器

  // 电影名称到词频文件的映射 - 使用useMemo避免重复创建
  const movieToWordFreqFileMap = React.useMemo(
    () => ({
      倩女幽魂: '1-倩女幽魂_词频.xlsx',
      射雕英雄传之东成西就: '2-射雕英雄传之东成西就-新_词频.xlsx',
      新龙门客栈: '3-新龙门客栈_词频.xlsx',
      东邪西毒: '4-东邪西毒_词频.xlsx',
      '笑傲江湖2:东方不败': '5-笑傲江湖II东方不败_词频.xlsx',
      卧虎藏龙: '6-卧虎藏龙_词频.xlsx',
      侠女: '7-侠女_词频.xlsx',
      黄飞鸿: '8-黄飞鸿_词频.xlsx',
      少林寺: '9-少林寺_词频.xlsx',
      鹿鼎记: '10-鹿鼎记_词频.xlsx',
      '黄飞鸿之二：男儿当自强': '11-黄飞鸿之二：男儿当自强_词频.xlsx',
      双旗镇刀客: '12-双旗镇刀客_词频.xlsx',
      武状元苏乞儿: '13-武状元苏乞儿_词频.xlsx',
      '鹿鼎记2:神龙教': '14-鹿鼎记2神龙教_词频.xlsx',
      '黄飞鸿之三：狮王争霸': '15-黄飞鸿3狮王争霸 国语配音中字_词频.xlsx',
      师父: '17-师父_词频.xlsx',
      '倩女幽魂2:人间道': '18-倩女幽魂2人间道_词频.xlsx',
      太极张三丰: '19-太极张三丰_词频.xlsx',
      方世玉: '20-方世玉_词频.xlsx',
      笑傲江湖: '21-笑傲江湖_词频.xlsx',
      空山灵雨: '22-空山灵雨_词频.xlsx',
      倚天屠龙记之魔教教主: '23-倚天屠龙记之魔教教主_词频.xlsx',
      刀: '24-刀_词频.xlsx',
      洪熙官: '25-新少林五祖_词频.xlsx',
      龙门客栈: '26-龙门客栈-新_词频.xlsx',
      方世玉续集: '27-方世玉续集_词频.xlsx',
      白发魔女传: '28-白发魔女传_词频.xlsx',
      陆小凤传奇之陆小凤前传: '29-陆小凤传奇之陆小凤前传_词频.xlsx',
      绣春刀: '30-绣春刀_词频.xlsx',
      英雄: '31-英雄_词频.xlsx',
      剑雨: '32-剑雨-新_词频.xlsx',
      一刀倾城: '33-一刀倾城_词频.xlsx',
      陆小凤传奇之铁鞋传奇: '34-陆小凤传奇之铁鞋传奇_词频.xlsx',
      新独臂刀: '35-新独臂刀_词频.xlsx',
      新天龙八部之天山童姥: '36-新天龙八部之天山童姥_词频.xlsx',
      少年黄飞鸿之铁马骝: '37-少年黄飞鸿之铁马骝_词频.xlsx',
      东方三侠: '38-东方三侠_词频.xlsx',
      陆小凤传奇之大金鹏王: '39-陆小凤传奇之大金鹏王_词频.xlsx',
      迎春阁之风波: '40-迎春阁之风波_词频.xlsx',
      唐朝豪放女: '41-唐朝豪放女_词频.xlsx',
      东方不败之风云再起: '42-东方不败之风云再起_词频.xlsx',
      刺客聂隐娘: '43-刺客聂隐娘_词频.xlsx',
      陆小凤传奇之绣花大盗: '44-陆小凤传奇之绣花大盗_词频.xlsx',
      黄河大侠: '45-黄河大侠_词频.xlsx',
      水浒传之英雄本色: '46-水浒传之英雄本色_词频.xlsx',
      箭士柳白猿: '47-箭士柳白猿_词频.xlsx',
      六指琴魔: '48-六指琴魔_词频.xlsx',
    }),
    [],
  )

  // 电影名称到情绪数据文件的映射 - 使用useMemo避免重复创建
  const movieToEmotionFileMap = React.useMemo(
    () => ({
      倩女幽魂: '1-倩女幽魂_台词_情绪_整合.xlsx',
      射雕英雄传之东成西就: '2-射雕英雄传之东成西就-新_台词_情绪_整合.xlsx',
      新龙门客栈: '3-新龙门客栈_台词_情绪_整合.xlsx',
      东邪西毒: '4-东邪西毒_台词_情绪_整合.xlsx',
      '笑傲江湖2:东方不败': '5-笑傲江湖II东方不败_台词_情绪_整合.xlsx',
      卧虎藏龙: '6-卧虎藏龙_台词_情绪_整合.xlsx',
      侠女: '7-侠女_台词_情绪_整合.xlsx',
      黄飞鸿: '8-黄飞鸿_台词_情绪_整合.xlsx',
      少林寺: '9-少林寺_台词_情绪_整合.xlsx',
      鹿鼎记: '10-鹿鼎记_台词_情绪_整合.xlsx',
      '黄飞鸿之二：男儿当自强': '11-黄飞鸿之二：男儿当自强_台词_情绪_整合.xlsx',
      双旗镇刀客: '12-双旗镇刀客_台词_情绪_整合.xlsx',
      武状元苏乞儿: '13-武状元苏乞儿_台词_情绪_整合.xlsx',
      '鹿鼎记2:神龙教': '14-鹿鼎记2神龙教_台词_情绪_整合.xlsx',
      '黄飞鸿之三：狮王争霸':
        '15-黄飞鸿3狮王争霸 国语配音中字_台词_情绪_整合.xlsx',
      师父: '17-师父_台词_情绪_整合.xlsx',
      '倩女幽魂2:人间道': '18-倩女幽魂2人间道_台词_情绪_整合.xlsx',
      太极张三丰: '19-太极张三丰-新_台词_情绪_整合.xlsx',
      方世玉: '20-方世玉_台词_情绪_整合.xlsx',
      笑傲江湖: '21-笑傲江湖_台词_情绪_整合.xlsx',
      空山灵雨: '22-空山灵雨_台词_情绪_整合.xlsx',
      倚天屠龙记之魔教教主: '23-倚天屠龙记之魔教教主_台词_情绪_整合.xlsx',
      刀: '24-刀_台词_情绪_整合.xlsx',
      洪熙官: '25-新少林五祖_台词_情绪_整合.xlsx',
      龙门客栈: '26-龙门客栈-新_台词_情绪_整合.xlsx',
      方世玉续集: '27-方世玉续集_台词_情绪_整合.xlsx',
      白发魔女传: '28-白发魔女传_台词_情绪_整合.xlsx',
      陆小凤传奇之陆小凤前传: '29-陆小凤传奇之陆小凤前传_台词_情绪_整合.xlsx',
      绣春刀: '30-绣春刀_台词_情绪_整合.xlsx',
      英雄: '31-英雄_台词_情绪_整合.xlsx',
      剑雨: '32-剑雨_台词_情绪_整合.xlsx',
      一刀倾城: '33-一刀倾城_台词_情绪_整合.xlsx',
      陆小凤传奇之铁鞋传奇: '34-陆小凤传奇之铁鞋传奇_台词_情绪_整合.xlsx',
      新独臂刀: '35-新独臂刀_台词_情绪_整合.xlsx',
      新天龙八部之天山童姥: '36-新天龙八部之天山童姥_台词_情绪_整合.xlsx',
      少年黄飞鸿之铁马骝: '37-少年黄飞鸿之铁马骝_台词_情绪_整合.xlsx',
      东方三侠: '38-东方三侠_台词_情绪_整合.xlsx',
      陆小凤传奇之大金鹏王: '39-陆小凤传奇之大金鹏王_台词_情绪_整合.xlsx',
      迎春阁之风波: '40-迎春阁之风波_台词_情绪_整合.xlsx',
      唐朝豪放女: '41-唐朝豪放女_台词_情绪_整合.xlsx',
      东方不败之风云再起: '42-东方不败之风云再起_台词_情绪_整合.xlsx',
      刺客聂隐娘: '43-刺客聂隐娘_台词_情绪_整合.xlsx',
      陆小凤传奇之绣花大盗: '44-陆小凤传奇之绣花大盗_台词_情绪_整合.xlsx',
      黄河大侠: '45-黄河大侠_台词_情绪_整合.xlsx',
      水浒传之英雄本色: '46-水浒传之英雄本色_台词_情绪_整合.xlsx',
      箭士柳白猿: '47-箭士柳白猿_台词_情绪_整合.xlsx',
      六指琴魔: '48-六指琴魔_台词_情绪_整合.xlsx',
    }),
    [],
  )

  // 电影名称到详情背景图片的映射 - 使用useMemo避免重复创建
  const movieToDetailImageMap = React.useMemo(
    () => ({
      倩女幽魂: 'detail_1.png',
      射雕英雄传之东成西就: 'detail_2.png',
      新龙门客栈: 'detail_3.png',
      东邪西毒: 'detail_4.png',
      '笑傲江湖2:东方不败': 'detail_5.png',
      卧虎藏龙: 'detail_6.png',
      侠女: 'detail_7.png',
      黄飞鸿: 'detail_8.png',
      少林寺: 'detail_9.png',
      鹿鼎记: 'detail_10.png',
      '黄飞鸿之二：男儿当自强': 'detail_11.png',
      双旗镇刀客: 'detail_12.png',
      武状元苏乞儿: 'detail_13.png',
      '鹿鼎记2:神龙教': 'detail_14.png',
      '黄飞鸿之三：狮王争霸': 'detail_15.png',
      师父: 'detail_17.png',
      '倩女幽魂2:人间道': 'detail_18.png',
      太极张三丰: 'detail_19.png',
      方世玉: 'detail_20.png',
      笑傲江湖: 'detail_21.png',
      空山灵雨: 'detail_22.png',
      倚天屠龙记之魔教教主: 'detail_23.png',
      刀: 'detail_24.png',
      洪熙官: 'detail_25.png',
      龙门客栈: 'detail_26.png',
      方世玉续集: 'detail_27.png',
      白发魔女传: 'detail_28.png',
      陆小凤传奇之陆小凤前传: 'detail_29.png',
      绣春刀: 'detail_30.png',
      英雄: 'detail_31.png',
      剑雨: 'detail_32.png',
      一刀倾城: 'detail_33.png',
      陆小凤传奇之铁鞋传奇: 'detail_34.png',
      新独臂刀: 'detail_35.png',
      新天龙八部之天山童姥: 'detail_36.png',
      少年黄飞鸿之铁马骝: 'detail_37.png',
      东方三侠: 'detail_38.png',
      陆小凤传奇之大金鹏王: 'detail_39.png',
      迎春阁之风波: 'detail_40.png',
      唐朝豪放女: 'detail_41.png',
      东方不败之风云再起: 'detail_42.png',
      刺客聂隐娘: 'detail_43.png',
      陆小凤传奇之绣花大盗: 'detail_44.png',
      黄河大侠: 'detail_45.png',
      水浒传之英雄本色: 'detail_46.png',
      箭士柳白猿: 'detail_46.png', // 使用46号图片
      六指琴魔: 'detail_46.png', // 使用46号图片
    }),
    [],
  )

  // 情绪类型颜色映射
  const emotionColors = {
    喜: '#AAC5A7',
    怒: '#9CA79D',
    哀: '#A9AFC4',
    乐: '#B97D6B',
    恐: '#D8CCC4',
    厌: '#D8CCC4',
    惊: '#C3D4D5',
  }

  // 关键词类别颜色映射
  const keywordCategoryColors = {
    门派: '#8B4513', // 深棕色
    精神: '#2E8B57', // 海绿色
    武功: '#DC143C', // 深红色
  }

  // 这个旧的位置映射已不再使用，由generateBubblePositions函数内部动态计算

  // 重叠范围控制变量（减小随机偏移）
  const overlapSettings = {
    xRange: 20, // X轴重叠范围（±0.625rem）
    yRange: 1, // Y轴重叠范围（±0.15625rem）- 减小Y轴偏移确保在同一行
  }

  // 气泡展示范围控制变量
  const bubbleRangeSettings = {
    segment1: { width: '80%', height: '100%' }, // 第一段容器尺寸
    segment2: { width: '90%', height: '100%' }, // 第二段容器尺寸
    segment3: { width: '90%', height: '100%' }, // 第三段容器尺寸
  }

  // 每段气泡显示数量百分比控制变量（使用React.useMemo避免重复创建）
  const bubbleDisplaySettings = React.useMemo(
    () => ({
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
    }),
    [],
  )

  // 根据百分比和最大数量计算实际显示数量
  const calculateDisplayCount = React.useCallback(
    (dataLength, percentage, maxCount) => {
      const percentageCount = Math.floor(dataLength * percentage)
      return Math.min(percentageCount, maxCount)
    },
    [],
  )

  // 根据坐标系统生成气泡位置（同类型情绪在同一行）
  const generateBubblePositions = React.useCallback(
    (data, containerWidth = 300, containerHeight = 150) => {
      const positions = []
      const emotions = ['喜', '怒', '哀', '乐', '恐', '惊', '厌'] // 从上到下的正确顺序

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
    },
    [emotionColors, overlapSettings],
  )

  // 读取词频数据的函数 - 支持多工作表结构
  const loadWordFrequencyData = React.useCallback(
    async (movieName) => {
      console.log('📊 读取词频数据:', movieName)

      try {
        const fileName = movieToWordFreqFileMap[movieName]
        if (!fileName) {
          console.log('⚠️ 未找到对应的词频文件:', movieName)
          return null
        }

        const response = await fetch(`/assets/word-frequency/${fileName}`)
        if (!response.ok) {
          console.log('❌ 词频文件读取失败:', fileName)
          return null
        }

        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })

        console.log('📋 词频文件工作表列表:', workbook.SheetNames)

        // 工作表名称到类别的映射
        const sheetNameToCategoryMap = {
          门派: '门派',
          江湖门派: '门派',
          门派词频: '门派',
          精神: '精神',
          侠义精神: '精神',
          精神词频: '精神',
          武功: '武功',
          武林功夫: '武功',
          武功词频: '武功',
          Sheet1: '门派', // 默认第一个表为门派
          Sheet2: '精神', // 默认第二个表为精神
          Sheet3: '武功', // 默认第三个表为武功
        }

        const wordFreqInfo = {
          门派: [],
          精神: [],
          武功: [],
        }

        // 遍历所有工作表
        workbook.SheetNames.forEach((sheetName, index) => {
          try {
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            // 确定工作表对应的类别
            let category = sheetNameToCategoryMap[sheetName]
            if (!category && index < 3) {
              // 如果工作表名称不匹配，按顺序分配
              const defaultCategories = ['门派', '精神', '武功']
              category = defaultCategories[index]
            }

            if (category && jsonData.length > 0) {
              console.log(
                `📊 处理 ${sheetName} 工作表 -> ${category}类别:`,
                jsonData.length,
                '条数据',
              )

              // 处理词频数据
              const processedWords = jsonData
                .map((row) => {
                  const word =
                    row['关键词'] ||
                    row['词语'] ||
                    row['词汇'] ||
                    row['word'] ||
                    ''
                  const frequency = parseInt(
                    row['词频'] ||
                      row['频次'] ||
                      row['次数'] ||
                      row['frequency'] ||
                      0,
                  )

                  return {
                    word: String(word).trim(),
                    frequency: frequency,
                    category: category,
                  }
                })
                .filter((item) => item.word && item.frequency > 0)
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 20) // 取前20个高频词

              wordFreqInfo[category] = processedWords
              console.log(
                `✅ ${category}类别处理完成:`,
                processedWords.length,
                '个关键词',
              )
            }
          } catch (error) {
            console.error(`处理工作表 ${sheetName} 失败:`, error)
          }
        })

        return wordFreqInfo
      } catch (error) {
        console.error('❌ 词频文件读取失败:', movieName, error)
        return null
      }
    },
    [movieToWordFreqFileMap],
  )

  // 雷达图配置 - 使用动态数据
  const radarChartConfig = React.useMemo(() => {
    // 计算最大值用于标准化
    const maxValue = Math.max(
      radarData.亚洲 || 0,
      radarData.欧洲 || 0,
      radarData.北美 || 0,
      radarData.南美 || 0,
      radarData.非洲 || 0,
      radarData.大洋洲 || 0,
      10, // 至少为10，避免除零
    )

    return {
      // 电影在各大洲的分销国家数据
      dimensions: [
        { name: '亚洲', value: radarData.亚洲 || 0, maxValue: maxValue },
        { name: '欧洲', value: radarData.欧洲 || 0, maxValue: maxValue },
        { name: '北美', value: radarData.北美 || 0, maxValue: maxValue },
        { name: '南美', value: radarData.南美 || 0, maxValue: maxValue },
        { name: '非洲', value: radarData.非洲 || 0, maxValue: maxValue },
        { name: '大洋洲', value: radarData.大洋洲 || 0, maxValue: maxValue },
      ],
      center: { x: 150, y: 150 }, // SVG中心点
      radius: 120, // 最大半径
      levels: 5, // 网格层数
    }
  }, [radarData])

  // 生成雷达图数据
  const generateRadarChart = React.useCallback(() => {
    const { dimensions, center, radius, levels } = radarChartConfig
    const angleStep = (2 * Math.PI) / dimensions.length

    // 生成网格多边形
    const gridPolygons = []
    for (let i = 1; i <= levels; i++) {
      const currentRadius = (radius * i) / levels
      const points = []

      // 为每个层级生成多边形的各个顶点
      for (let j = 0; j < dimensions.length; j++) {
        const angle = j * angleStep - Math.PI / 2 // 从顶部开始
        const x = center.x + Math.cos(angle) * currentRadius
        const y = center.y + Math.sin(angle) * currentRadius
        points.push(`${x},${y}`)
      }

      gridPolygons.push({
        points: points.join(' '),
        key: `grid-${i}`,
      })
    }

    // 生成轴线和标签
    const axes = dimensions.map((dim, index) => {
      const angle = index * angleStep - Math.PI / 2 // 从顶部开始
      const x2 = center.x + Math.cos(angle) * radius
      const y2 = center.y + Math.sin(angle) * radius

      // 标签位置稍微向外一点
      const labelDistance = radius + 20
      const labelX = center.x + Math.cos(angle) * labelDistance
      const labelY = center.y + Math.sin(angle) * labelDistance

      return {
        line: {
          x1: center.x,
          y1: center.y,
          x2: x2,
          y2: y2,
          key: `axis-${index}`,
        },
        label: {
          x: labelX,
          y: labelY,
          text: dim.name,
          key: `label-${index}`,
        },
      }
    })

    // 生成数据多边形
    const dataPoints = dimensions.map((dim, index) => {
      const angle = index * angleStep - Math.PI / 2
      const normalizedValue = dim.value / dim.maxValue
      const distance = radius * normalizedValue
      const x = center.x + Math.cos(angle) * distance
      const y = center.y + Math.sin(angle) * distance

      return {
        x: x,
        y: y,
        value: dim.value,
        dimension: dim.name,
        key: `point-${index}`,
      }
    })

    // 创建多边形路径
    const polygonPoints = dataPoints
      .map((point) => `${point.x},${point.y}`)
      .join(' ')

    return {
      gridPolygons,
      axes,
      dataPoints,
      polygonPoints,
    }
  }, [radarChartConfig])

  // 生成关键词气泡数据 - 基于真实容器大小，智能分布，根据数据大小自适应
  const generateKeywordBubbles = React.useCallback(
    (wordData, realContainerWidth, realContainerHeight) => {
      if (!wordData || wordData.length === 0)
        return {
          bubbles: [],
          containerSize: {
            width: realContainerWidth || 300,
            height: realContainerHeight || 200,
          },
        }

      const bubbles = []
      const maxFreq = Math.max(...wordData.map((item) => item.frequency))
      const minFreq = Math.min(...wordData.map((item) => item.frequency))

      // 使用真实容器尺寸，如果没有提供则使用计算值
      let containerWidth, containerHeight

      if (realContainerWidth && realContainerHeight) {
        containerWidth = realContainerWidth
        containerHeight = realContainerHeight
      } else {
        containerWidth = 300
        containerHeight = 200
      }

      // 计算容器缩放因子，小容器时等比缩小
      const baseContainerSize = 300 * 200 // 基准容器面积
      const currentContainerSize = containerWidth * containerHeight
      const containerScale = Math.sqrt(currentContainerSize / baseContainerSize)
      const scaleFactor = Math.max(0.3, Math.min(1.2, containerScale)) // 限制缩放范围

      // 根据数据范围和容器大小动态计算气泡尺寸
      const bubbleCount = wordData.length
      const containerArea = containerWidth * containerHeight

      // 基础尺寸计算 - 更积极地利用容器空间
      const idealCoverage = Math.min(0.7, 0.85 - bubbleCount * 0.008) // 提高覆盖率，更充分利用空间
      const idealTotalArea = containerArea * idealCoverage
      const averageAreaPerBubble = idealTotalArea / bubbleCount
      const averageRadius = Math.sqrt(averageAreaPerBubble / Math.PI)

      // 应用缩放因子，使用更大的基础尺寸
      const baseMinSize = Math.max(16, averageRadius * 1.0) * scaleFactor
      const baseMaxSize =
        Math.max(baseMinSize + 16, averageRadius * 2.5) * scaleFactor

      // 确保最小和最大尺寸更大，更好地填充容器
      const minSize = Math.max(18, Math.min(baseMinSize, 35))
      const maxSize = Math.max(
        minSize + 20,
        Math.min(baseMaxSize, containerWidth * 0.32, containerHeight * 0.32),
      )

      console.log('🎯 气泡尺寸计算:', {
        容器尺寸: `${containerWidth}x${containerHeight}`,
        缩放因子: scaleFactor.toFixed(2),
        气泡数量: bubbleCount,
        频次范围: `${minFreq}-${maxFreq}`,
        尺寸范围: `${minSize.toFixed(1)}px - ${maxSize.toFixed(1)}px`,
        覆盖率: `${(idealCoverage * 100).toFixed(1)}%`,
      })

      const padding = Math.max(6, Math.min(15, containerWidth * 0.03)) // 减小边距，更好利用空间
      const distributionWidth = Math.max(0, containerWidth - padding * 2)
      const distributionHeight = Math.max(0, containerHeight - padding * 2)
      const offsetX = padding
      const offsetY = padding

      // 按频次排序，优先放置高频词
      const sortedWordData = [...wordData].sort(
        (a, b) => b.frequency - a.frequency,
      )

      // 改进的圆形碰撞检测函数
      const isOverlapping = (x1, y1, size1, x2, y2, size2, minSpacing = 2) => {
        const centerX1 = x1 + size1 / 2
        const centerY1 = y1 + size1 / 2
        const centerX2 = x2 + size2 / 2
        const centerY2 = y2 + size2 / 2

        const distance = Math.sqrt(
          Math.pow(centerX1 - centerX2, 2) + Math.pow(centerY1 - centerY2, 2),
        )
        const minDistance = (size1 + size2) / 2 + minSpacing

        return distance < minDistance
      }

      // 使用力导向布局算法进行气泡布局
      sortedWordData.forEach((item, index) => {
        // 根据频次计算气泡大小，使用对数缩放避免极端差异
        let sizeRatio
        if (maxFreq === minFreq) {
          sizeRatio = 0.7 // 如果所有频次相同，使用中等大小
        } else {
          // 使用对数缩放，让低频词也有合理大小
          const normalizedFreq =
            (item.frequency - minFreq) / (maxFreq - minFreq)
          sizeRatio = 0.3 + normalizedFreq * 0.7 // 范围从0.3到1.0
        }

        const size = minSize + (maxSize - minSize) * sizeRatio
        const minSpacing = Math.max(1, size * 0.05) // 减小最小间距，让气泡更紧密

        let x, y, overlapping
        let attemptCount = 0
        const maxAttempts = 200

        // 多种布局策略
        do {
          if (attemptCount < maxAttempts * 0.3) {
            // 策略1: 中心向外的螺旋布局
            const angle = index * 2.4 + attemptCount * 0.3
            const radius = Math.min(
              (attemptCount + 1) * 8,
              Math.min(distributionWidth, distributionHeight) / 3,
            )
            x =
              offsetX +
              distributionWidth / 2 +
              Math.cos(angle) * radius -
              size / 2
            y =
              offsetY +
              distributionHeight / 2 +
              Math.sin(angle) * radius -
              size / 2
          } else if (attemptCount < maxAttempts * 0.7) {
            // 策略2: 网格布局
            const gridSpacing = Math.max(size + minSpacing * 2, 15) // 使用当前气泡大小计算间距
            const gridCols = Math.max(
              1,
              Math.floor(distributionWidth / gridSpacing),
            )
            const gridRows = Math.max(
              1,
              Math.floor(distributionHeight / gridSpacing),
            )

            if (gridCols > 0 && gridRows > 0) {
              const gridIndex =
                (attemptCount - Math.floor(maxAttempts * 0.3)) %
                (gridCols * gridRows)
              const col = gridIndex % gridCols
              const row = Math.floor(gridIndex / gridCols)

              x = offsetX + col * gridSpacing + (gridSpacing - size) / 2
              y = offsetY + row * gridSpacing + (gridSpacing - size) / 2

              // 添加小量随机偏移
              const jitter = Math.min(4, gridSpacing * 0.1)
              x += (Math.random() - 0.5) * jitter
              y += (Math.random() - 0.5) * jitter
            } else {
              // 回退到随机位置
              x =
                offsetX + Math.random() * Math.max(0, distributionWidth - size)
              y =
                offsetY + Math.random() * Math.max(0, distributionHeight - size)
            }
          } else {
            // 策略3: 完全随机位置
            x = offsetX + Math.random() * Math.max(0, distributionWidth - size)
            y = offsetY + Math.random() * Math.max(0, distributionHeight - size)
          }

          // 确保在容器边界内
          x = Math.max(offsetX, Math.min(offsetX + distributionWidth - size, x))
          y = Math.max(
            offsetY,
            Math.min(offsetY + distributionHeight - size, y),
          )

          // 检查与现有气泡的重叠
          overlapping = bubbles.some((existingBubble) =>
            isOverlapping(
              x,
              y,
              size,
              existingBubble.x,
              existingBubble.y,
              existingBubble.size,
              minSpacing,
            ),
          )

          attemptCount++
        } while (overlapping && attemptCount < maxAttempts)

        // 如果仍然重叠，尝试缩小气泡
        if (overlapping && attemptCount >= maxAttempts) {
          const reducedSize = Math.max(minSize * 0.8, size * 0.85)
          console.warn(
            `⚠️ 气泡 "${item.word}" 布局困难，缩小尺寸: ${size.toFixed(
              1,
            )} → ${reducedSize.toFixed(1)}`,
          )

          // 最后尝试放置缩小后的气泡
          for (let finalAttempt = 0; finalAttempt < 50; finalAttempt++) {
            x =
              offsetX +
              Math.random() * Math.max(0, distributionWidth - reducedSize)
            y =
              offsetY +
              Math.random() * Math.max(0, distributionHeight - reducedSize)

            const finalOverlapping = bubbles.some((existingBubble) =>
              isOverlapping(
                x,
                y,
                reducedSize,
                existingBubble.x,
                existingBubble.y,
                existingBubble.size,
                1,
              ),
            )

            if (!finalOverlapping) {
              bubbles.push({
                x: x,
                y: y,
                size: reducedSize,
                word: item.word,
                frequency: item.frequency,
                category: item.category,
              })
              break
            }
          }
        } else {
          bubbles.push({
            x: x,
            y: y,
            size: size,
            word: item.word,
            frequency: item.frequency,
            category: item.category,
          })
        }
      })

      console.log('🎯 关键词气泡布局完成:', {
        容器尺寸: `${containerWidth}x${containerHeight}`,
        成功布局: `${bubbles.length}/${wordData.length}`,
        尺寸分布: bubbles.map((b) => b.size.toFixed(0)).join(','),
        平均尺寸: (
          bubbles.reduce((sum, b) => sum + b.size, 0) / bubbles.length
        ).toFixed(1),
      })

      return {
        bubbles,
        containerSize: { width: containerWidth, height: containerHeight },
      }
    },
    [],
  )

  // 根据URL参数初始化电影信息
  useEffect(() => {
    const initializeMovieData = async () => {
      // 从URL参数获取电影名称，如果没有则使用默认值
      const movieName = decodeURIComponent(movieId || '六指琴魔')
      console.log('🎬 初始化电影数据:', { movieId, movieName, renderKey })
      setCurrentMovieName(movieName)

      // 等待电影名称设置后再读取数据
      if (!movieName) return

      // 临时设置电影名称以供loadMovieRatingData使用
      const tempCurrentMovieName = movieName

      // 尝试从Excel文件读取豆瓣和IMDB数据
      let excelData = null
      try {
        console.log(
          `🎬 开始从Excel读取电影 "${tempCurrentMovieName}" 的豆瓣和IMDB数据...`,
        )

        const response = await fetch('/assets/data/子页面基础信息总表.xlsx')
        if (response.ok) {
          const arrayBuffer = await response.arrayBuffer()
          const workbook = XLSX.read(arrayBuffer, { type: 'array' })

          console.log('📋 Excel工作表列表:', workbook.SheetNames)

          for (let sheetName of workbook.SheetNames) {
            console.log(`\n📊 正在检查工作表: ${sheetName}`)
            const worksheet = workbook.Sheets[sheetName]
            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            if (jsonData.length > 0) {
              console.log(
                `📏 工作表 "${sheetName}" 包含 ${jsonData.length} 行数据`,
              )
              console.log('📝 列名:', Object.keys(jsonData[0]))

              // 显示前3行数据以便调试
              console.log('📄 前3行数据示例:')
              jsonData.slice(0, 3).forEach((row, index) => {
                console.log(`  第${index + 1}行:`, row)
              })

              // 查找评分相关的列
              const ratingColumns = Object.keys(jsonData[0]).filter(
                (col) =>
                  col.includes('评分') ||
                  col.includes('豆瓣') ||
                  col.includes('IMDB') ||
                  col.includes('国内') ||
                  col.includes('国外'),
              )
              console.log('🎯 找到的评分相关列:', ratingColumns)
              const movieData = jsonData.find(
                (row) =>
                  row['电影名'] === tempCurrentMovieName ||
                  row['电影名称'] === tempCurrentMovieName ||
                  row['影片名称'] === tempCurrentMovieName ||
                  row['片名'] === tempCurrentMovieName,
              )

              if (movieData) {
                console.log(`✅ 找到电影数据:`, movieData)

                // 显示电影的关键信息
                console.log('🎬 电影关键信息:')
                console.log(
                  `  - 电影名: ${
                    movieData['电影名'] ||
                    movieData['电影名称'] ||
                    movieData['影片名称']
                  }`,
                )
                console.log(
                  `  - 上映年份: ${
                    movieData['上映年份'] || movieData['年份'] || '未知'
                  }`,
                )
                console.log(
                  `  - 国内评分: ${
                    movieData['国内评分'] || movieData['豆瓣评分'] || '未找到'
                  }`,
                )
                console.log(
                  `  - 国外评分: ${
                    movieData['国外评分'] || movieData['IMDB评分'] || '未找到'
                  }`,
                )
                console.log(
                  `  - 分销大洲: ${movieData['分销大洲'] || '未找到'}`,
                )

                const ratingData = {}
                Object.keys(movieData).forEach((key) => {
                  // 豆瓣评分 - 国内数据
                  if (
                    key.includes('豆瓣') ||
                    key === '豆瓣评分' ||
                    key === '国内评分'
                  ) {
                    ratingData.doubanRating = movieData[key]
                    console.log(`📊 找到豆瓣评分(国内): ${movieData[key]}`)
                  }
                  // IMDB评分 - 国外数据
                  if (
                    key.includes('IMDB') ||
                    key.includes('IMDb') ||
                    key === 'IMDB评分' ||
                    key === '国外评分'
                  ) {
                    ratingData.imdbRating = movieData[key]
                    console.log(`📊 找到IMDB评分(国外): ${movieData[key]}`)
                  }
                })
                excelData = { ...movieData, ...ratingData }
                break
              }
            }
          }
        }
      } catch (error) {
        console.error('❌ 读取Excel数据失败:', error)
      }

      // 设置电影基本信息（硬编码作为备用数据）
      const movieInfoMap = {
        倩女幽魂: {
          title: '倩女幽魂',
          year: '1987',
          rating: '8.7',
          imdbRating: '7.4',
        },
        射雕英雄传之东成西就: {
          title: '射雕英雄传之东成西就',
          year: '1993',
          rating: '8.8',
          imdbRating: '7.1',
        },
        新龙门客栈: {
          title: '新龙门客栈',
          year: '1992',
          rating: '8.5',
          imdbRating: '7.3',
        },
        东邪西毒: {
          title: '东邪西毒',
          year: '1994',
          rating: '8.0',
          imdbRating: '7.0',
        },
        '笑傲江湖2:东方不败': {
          title: '笑傲江湖2:东方不败',
          year: '1992',
          rating: '8.3',
          imdbRating: '7.2',
        },
        卧虎藏龙: {
          title: '卧虎藏龙',
          year: '2000',
          rating: '8.8',
          imdbRating: '7.9',
        },
        侠女: { title: '侠女', year: '1971', rating: '8.2', imdbRating: '7.5' },
        黄飞鸿: {
          title: '黄飞鸿',
          year: '1991',
          rating: '8.1',
          imdbRating: '7.3',
        },
        少林寺: {
          title: '少林寺',
          year: '1982',
          rating: '7.8',
          imdbRating: '6.9',
        },
        六指琴魔: {
          title: '六指琴魔',
          year: '1994',
          rating: '8.8',
          imdbRating: '7.9',
        },
        '倩女幽魂2:人间道': {
          title: '倩女幽魂2:人间道',
          year: '1990',
          rating: '8.2',
          imdbRating: '7.0',
        },
      }

      // 优先使用Excel数据，否则使用硬编码数据
      let movieInfo
      if (excelData) {
        console.log('🎬 使用Excel数据:', excelData)
        movieInfo = {
          title: movieName,
          year:
            excelData['年份'] ||
            excelData['上映年份'] ||
            excelData['制作年份'] ||
            '未知',
          // 豆瓣评分 - 国内数据
          doubanRating:
            excelData.doubanRating ||
            excelData['豆瓣评分'] ||
            excelData['豆瓣'] ||
            excelData['国内评分'] ||
            '0.0',
          // IMDB评分 - 国外数据
          imdbRating:
            excelData.imdbRating ||
            excelData['IMDB评分'] ||
            excelData['IMDB'] ||
            excelData['国外评分'] ||
            '0.0',
          // 保持rating字段用于其他组件兼容性
          rating:
            excelData.doubanRating ||
            excelData['豆瓣评分'] ||
            excelData['豆瓣'] ||
            excelData['国内评分'] ||
            '0.0',
          dataSource: 'Excel文件',
        }
      } else {
        console.log('🎬 使用硬编码数据')
        const hardcodedData = movieInfoMap[movieName] || {
          title: movieName,
          year: '未知',
          rating: '0.0',
          imdbRating: '0.0',
          dataSource: '硬编码数据',
        }
        movieInfo = {
          ...hardcodedData,
          doubanRating: hardcodedData.rating, // 将rating复制为doubanRating
          dataSource: '硬编码数据',
        }
      }

      setMovieData(movieInfo)

      // 设置对应的背景图片，如果没有对应的图片则不设置背景
      const backgroundImage = movieToDetailImageMap[movieName]
      if (backgroundImage) {
        setCurrentBackground(`/assets/images/detail/${backgroundImage}`)
      } else {
        setCurrentBackground('') // 没有对应背景图片时清空背景
      }

      console.log('初始化电影数据:', { movieName, movieInfo, backgroundImage })
    }

    // 延迟执行，确保状态重置完成
    const timer = setTimeout(() => {
      initializeMovieData()
    }, 50)

    return () => clearTimeout(timer)
  }, [movieId, renderKey]) // 添加renderKey依赖确保路由变化时重新初始化

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

  // 读取词频数据 - 当电影名称确定后
  useEffect(() => {
    const loadWordFreqData = async () => {
      if (!currentMovieName || isLoading) return

      try {
        console.log(`📊 开始加载电影 "${currentMovieName}" 的词频数据`)
        const wordFreqData = await loadWordFrequencyData(currentMovieName)

        if (wordFreqData) {
          setWordFrequencyData(wordFreqData)
          console.log('✅ 词频数据加载完成:', wordFreqData)
        } else {
          // 如果没有找到对应的词频文件，使用默认数据
          console.log('⚠️ 使用默认词频数据')
          setWordFrequencyData({
            门派: [],
            精神: [],
            武功: [],
          })
        }
      } catch (error) {
        console.error('❌ 词频数据加载失败:', error)
        setWordFrequencyData({
          门派: [],
          精神: [],
          武功: [],
        })
      }
    }

    // 延迟执行，确保电影名称已设置
    const timer = setTimeout(() => {
      loadWordFreqData()
    }, 100)

    return () => clearTimeout(timer)
  }, [currentMovieName, loadWordFrequencyData, renderKey])

  // 读取雷达图数据
  const loadRadarData = useCallback(async () => {
    if (!currentMovieName) return

    try {
      console.log(`🎯 开始加载电影 "${currentMovieName}" 的雷达图数据...`)

      const response = await fetch('/assets/data/子页面基础信息总表.xlsx')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log('📊 雷达图原始数据:', jsonData.slice(0, 3))
      console.log(
        '📊 所有列名:',
        jsonData.length > 0 ? Object.keys(jsonData[0]) : [],
      )
      console.log('📊 当前电影名:', currentMovieName)

      // 查找豆瓣和IMDB相关的列
      if (jsonData.length > 0) {
        const firstRow = jsonData[0]
        const allColumns = Object.keys(firstRow)

        console.log('🔍 查找豆瓣和IMDB相关数据:')
        const ratingColumns = allColumns.filter(
          (col) =>
            col.includes('豆瓣') ||
            col.includes('IMDB') ||
            col.includes('IMDb') ||
            col.includes('评分') ||
            col.toLowerCase().includes('rating'),
        )

        if (ratingColumns.length > 0) {
          console.log('⭐ 找到评分相关列:', ratingColumns)
          ratingColumns.forEach((col) => {
            console.log(`  - ${col}: ${firstRow[col]}`)
          })
        } else {
          console.log('⚠️ 未找到明显的豆瓣/IMDB评分列')
        }

        console.log('📋 完整列名列表:')
        allColumns.forEach((col, idx) => {
          console.log(`  ${idx + 1}. ${col}: ${firstRow[col]}`)
        })
      }

      // 显示所有电影名称，帮助调试
      const allMovieNames = jsonData
        .map((row) => row['电影名'] || row['电影名称'] || row['影片名称'])
        .filter(Boolean)
      console.log('📊 Excel中所有电影名 (前10个):', allMovieNames.slice(0, 10))
      console.log('📊 Excel中所有电影名 (完整列表):', allMovieNames)

      // 查找当前电影的数据 - 优先使用id，其次使用名称匹配
      let movieData = null
      const movieId_from_url = searchParams.get('id')

      console.log('📊 URL参数:', { movieId, id: movieId_from_url })
      console.log('📊 当前搜索的电影名:', `"${currentMovieName}"`)

      // 首先尝试通过id精确匹配
      if (movieId_from_url) {
        const targetId = parseInt(movieId_from_url)
        movieData = jsonData.find(
          (row) =>
            row['序号'] === targetId ||
            row['id'] === targetId ||
            row['原始序号'] === targetId,
        )
        console.log('📊 通过ID查找结果:', movieData)
      }

      // 如果通过id没找到，尝试电影名称精确匹配
      if (!movieData) {
        movieData = jsonData.find(
          (row) =>
            row['电影名'] === currentMovieName ||
            row['电影名称'] === currentMovieName ||
            row['影片名称'] === currentMovieName,
        )
        console.log('📊 通过名称精确匹配结果:', movieData)
      }

      // 如果精确匹配失败，尝试包含匹配
      if (!movieData) {
        movieData = jsonData.find(
          (row) =>
            (row['电影名'] && row['电影名'].includes(currentMovieName)) ||
            (row['电影名称'] && row['电影名称'].includes(currentMovieName)) ||
            (row['影片名称'] && row['影片名称'].includes(currentMovieName)) ||
            (currentMovieName.includes(row['电影名']) && row['电影名']) ||
            (currentMovieName.includes(row['电影名称']) && row['电影名称']) ||
            (currentMovieName.includes(row['影片名称']) && row['影片名称']),
        )
        console.log('📊 通过名称模糊匹配结果:', movieData)
      }

      console.log('📊 最终找到的电影数据:', movieData)

      if (movieData) {
        const newRadarData = {
          南美: parseInt(movieData['分销大洲']) || 0, // 南美数据
          北美: parseInt(movieData['__EMPTY']) || 0, // 北美数据
          亚洲: parseInt(movieData['__EMPTY_1']) || 0, // 亚洲数据
          欧洲: parseInt(movieData['__EMPTY_2']) || 0, // 欧洲数据
          大洋洲: parseInt(movieData['__EMPTY_3']) || 0, // 大洋洲数据
          非洲: parseInt(movieData['__EMPTY_4']) || 0, // 非洲数据
        }

        setRadarData(newRadarData)
        console.log(
          `✅ 电影 "${currentMovieName}" 雷达图数据加载完成:`,
          newRadarData,
        )
      } else {
        console.warn(`⚠️ 未找到电影 "${currentMovieName}" 的雷达图数据`)
        // 设置测试数据以验证雷达图显示
        setRadarData({
          南美: 2,
          北美: 4,
          亚洲: 3,
          欧洲: 5,
          大洋洲: 1,
          非洲: 1,
        })
      }
    } catch (error) {
      console.error(`❌ 加载电影 "${currentMovieName}" 雷达图数据失败:`, error)
      // 设置测试数据以验证雷达图显示
      setRadarData({
        南美: 2,
        北美: 4,
        亚洲: 3,
        欧洲: 5,
        大洋洲: 1,
        非洲: 1,
      })
    }
  }, [searchParams, movieId, currentMovieName])

  // 加载雷达图数据
  useEffect(() => {
    console.log(
      '🚀 useEffect 触发，开始加载雷达图数据，当前电影:',
      currentMovieName,
    )
    if (currentMovieName) {
      // 延迟执行，确保电影名称已设置
      const timer = setTimeout(() => {
        loadRadarData()
      }, 150)

      return () => clearTimeout(timer)
    }
  }, [currentMovieName, loadRadarData, renderKey])

  // 生成关键词气泡位置 - 当词频数据加载完成后
  useEffect(() => {
    if (
      !wordFrequencyData.门派.length &&
      !wordFrequencyData.精神.length &&
      !wordFrequencyData.武功.length
    ) {
      return // 数据还没有加载完成
    }

    // 延迟执行，确保容器尺寸已经稳定
    const timer = setTimeout(() => {
      try {
        console.log('🎯 开始生成关键词气泡位置...')

        // 获取容器真实尺寸
        const getContainerSize = (ref) => {
          if (ref.current) {
            const rect = ref.current.getBoundingClientRect()
            return { width: rect.width, height: rect.height }
          }
          return null
        }

        const container1Size = getContainerSize(keywordContainer1Ref)
        const container2Size = getContainerSize(keywordContainer2Ref)
        const container3Size = getContainerSize(keywordContainer3Ref)

        console.log('📏 容器尺寸:', {
          门派: container1Size,
          精神: container2Size,
          武功: container3Size,
        })

        setKeywordBubbles({
          门派: generateKeywordBubbles(
            wordFrequencyData.门派,
            container1Size?.width,
            container1Size?.height,
          ),
          精神: generateKeywordBubbles(
            wordFrequencyData.精神,
            container2Size?.width,
            container2Size?.height,
          ),
          武功: generateKeywordBubbles(
            wordFrequencyData.武功,
            container3Size?.width,
            container3Size?.height,
          ),
        })

        console.log('✅ 关键词气泡位置生成完成')
      } catch (error) {
        console.error('❌ 生成关键词气泡位置失败:', error)
      }
    }, 200) // 增加延迟确保容器已渲染

    return () => clearTimeout(timer)
  }, [wordFrequencyData, generateKeywordBubbles])

  // 读取Excel数据并分段
  useEffect(() => {
    const loadDialogueData = async () => {
      if (!currentMovieName || isLoading) return

      setIsLoading(true)
      try {
        // 目前只有卧虎藏龙的数据文件，所有电影都使用这个数据作为演示
        const defaultFileName = '6-卧虎藏龙_台词_情绪_整合.xlsx'

        console.log(
          `加载电影 "${currentMovieName}" 的数据，使用默认数据文件: ${defaultFileName}`,
        )

        const response = await fetch(`/assets/data/${defaultFileName}`)

        // 检查响应是否成功
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const arrayBuffer = await response.arrayBuffer()
        const workbook = XLSX.read(arrayBuffer, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        // 直接处理数据分段逻辑，避免函数依赖
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

        console.log(`加载电影 "${currentMovieName}" 的情绪数据:`, {
          fileName: defaultFileName,
          dataLength: jsonData.length,
        })

        // 输出数据样本，用于了解数据结构
        if (jsonData.length > 0) {
          console.log('数据样本 (前3条):', jsonData.slice(0, 3))
          console.log('数据列名:', Object.keys(jsonData[0]))
        }

        console.log('数据分段完成:', {
          总数据量: totalLength,
          第一段: segment1.length,
          第二段: segment2.length,
          第三段: segment3.length,
        })
      } catch (error) {
        console.error(`读取电影 "${currentMovieName}" 的Excel文件失败:`, error)

        // 如果数据加载失败，设置空数据避免界面崩溃
        setDialogueData({
          segment1: [],
          segment2: [],
          segment3: [],
        })
        setBubblePositions({
          segment1: [],
          segment2: [],
          segment3: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    // 延迟执行，确保电影名称已设置
    const timer = setTimeout(() => {
      loadDialogueData()
    }, 200)

    return () => clearTimeout(timer)
  }, [currentMovieName, renderKey]) // 添加renderKey依赖确保路由变化时重新加载

  // 生成气泡位置 - 当数据加载完成后延迟执行
  useEffect(() => {
    if (
      !dialogueData.segment1.length &&
      !dialogueData.segment2.length &&
      !dialogueData.segment3.length
    ) {
      return // 数据还没有加载完成
    }

    // 延迟一点执行，确保容器尺寸已经稳定
    const timer = setTimeout(() => {
      try {
        console.log('开始生成气泡位置...')

        // 根据百分比设置计算每段显示的数据量
        const segment1Count = calculateDisplayCount(
          dialogueData.segment1.length,
          bubbleDisplaySettings.segment1.percentage,
          bubbleDisplaySettings.segment1.maxCount,
        )
        const segment2Count = calculateDisplayCount(
          dialogueData.segment2.length,
          bubbleDisplaySettings.segment2.percentage,
          bubbleDisplaySettings.segment2.maxCount,
        )
        const segment3Count = calculateDisplayCount(
          dialogueData.segment3.length,
          bubbleDisplaySettings.segment3.percentage,
          bubbleDisplaySettings.segment3.maxCount,
        )

        // 生成所有段落的气泡位置 - 使用百分比控制显示数量
        setBubblePositions({
          segment1:
            dialogueData.segment1.length > 0
              ? generateBubblePositions(
                  dialogueData.segment1.slice(0, segment1Count),
                  containerSizes.segment1.width,
                  containerSizes.segment1.height,
                )
              : [],
          segment2:
            dialogueData.segment2.length > 0
              ? generateBubblePositions(
                  dialogueData.segment2.slice(0, segment2Count),
                  containerSizes.segment2.width,
                  containerSizes.segment2.height,
                )
              : [],
          segment3:
            dialogueData.segment3.length > 0
              ? generateBubblePositions(
                  dialogueData.segment3.slice(0, segment3Count),
                  containerSizes.segment3.width,
                  containerSizes.segment3.height,
                )
              : [],
        })

        console.log('气泡显示数量:', {
          第一段: `${segment1Count}/${dialogueData.segment1.length} (${(
            bubbleDisplaySettings.segment1.percentage * 100
          ).toFixed(0)}%)`,
          第二段: `${segment2Count}/${dialogueData.segment2.length} (${(
            bubbleDisplaySettings.segment2.percentage * 100
          ).toFixed(0)}%)`,
          第三段: `${segment3Count}/${dialogueData.segment3.length} (${(
            bubbleDisplaySettings.segment3.percentage * 100
          ).toFixed(0)}%)`,
        })
      } catch (error) {
        console.error('生成气泡位置失败:', error)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [
    dialogueData.segment1.length,
    dialogueData.segment2.length,
    dialogueData.segment3.length,
  ])

  // 删除旧的示例数据，现在使用动态的movieData状态

  const handleBack = () => {
    navigate('/')
  }

  // 处理气泡鼠标悬停事件
  const handleBubbleMouseEnter = (event, bubble) => {
    if (bubble.isPlaceholder) return

    const rect = event.currentTarget.getBoundingClientRect()

    // 根据气泡的情绪类型，获取对应的台词内容
    const emotion = bubble.emotion
    // 尝试多种可能的列名格式
    const possibleColumns = [
      `${emotion}_台词`, // 喜_台词
      `${emotion}台词`, // 喜台词
      `${emotion}_内容`, // 喜_内容
      `${emotion}内容`, // 喜内容
      '台词', // 通用台词
      '对话', // 通用对话
      '内容', // 通用内容
    ]

    let dialogue = ''
    for (const column of possibleColumns) {
      if (bubble.data[column] && String(bubble.data[column]).trim()) {
        dialogue = String(bubble.data[column]).trim()
        break
      }
    }

    // 如果还是没找到，使用fallback
    if (!dialogue) {
      dialogue = `${emotion}情绪对应的台词暂无`
    }

    // 处理台词格式，如果包含多个句子，用换行分隔
    if (dialogue && typeof dialogue === 'string') {
      // 将句号、感叹号、问号后面的内容分行显示
      dialogue = dialogue
        .replace(/([。！？])\s*/g, '$1\n')
        .replace(/\n+/g, '\n')
        .trim()
    }

    console.log('气泡台词显示:', {
      情绪: emotion,
      台词: dialogue,
      原始数据: bubble.data,
    })

    setTooltip({
      visible: true,
      content: dialogue,
      emotion: emotion,
      emotionValue: bubble.emotionValue,
      dataIndex: bubble.dataIndex + 1, // 显示从1开始的序号
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleBubbleMouseLeave = () => {
    setTooltip({
      visible: false,
      content: '',
      emotion: '',
      emotionValue: 0,
      dataIndex: 0,
      x: 0,
      y: 0,
    })
  }

  // 处理关键词气泡鼠标悬停事件
  const handleKeywordBubbleMouseEnter = (event, bubble) => {
    const rect = event.currentTarget.getBoundingClientRect()

    setKeywordTooltip({
      visible: true,
      word: bubble.word,
      frequency: bubble.frequency,
      category: bubble.category,
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })
  }

  const handleKeywordBubbleMouseLeave = () => {
    setKeywordTooltip({
      visible: false,
      word: '',
      frequency: 0,
      category: '',
      x: 0,
      y: 0,
    })
  }

  return (
    <>
      <GlobalStyle />
      <DetailContainer key={renderKey} $backgroundUrl={currentBackground}>
        {/* 头部区域 */}
        <HeaderContainer>
          <HeaderTitle style={{ position: 'relative' }}>
            <BackArrow onClick={handleBack}>←</BackArrow>
            <MovieNameText>{currentMovieName}</MovieNameText>
            <span
              style={{
                position: 'absolute',
                right: '50%',
              }}
            >
              {movieData.year || '未知年份'}
            </span>
            <span
              style={{
                position: 'absolute',
                right: '30%',
              }}
            >
              {movieData.doubanRating || '未知'}
            </span>
            <span
              style={{
                position: 'absolute',
                right: '10%',
              }}
            >
              {movieData.imdbRating || '未知'}
            </span>
          </HeaderTitle>
        </HeaderContainer>

        {/* 主要内容区域 */}
        <MainContent>
          {/* 左侧区域 */}
          <LeftSection>
            {/* 上部：各大洲分销国家数 */}
            <TopLeftPanel>
              {/* 第1部分：标题区域 */}
              <TopLeftPanelHeader></TopLeftPanelHeader>
              {/* 第2部分：江湖门派区域 */}
              <TopLeftPanelSearch></TopLeftPanelSearch>

              {/* 第3部分：气泡图区域 */}
              <TopLeftPanelBubbles ref={keywordContainer1Ref}>
                {/* 江湖门派关键词气泡 */}
                <KeywordBubbleContainer>
                  {keywordBubbles.门派.bubbles?.map((bubble, index) => (
                    <KeywordBubbleWrapper
                      key={index}
                      $x={bubble.x}
                      $y={bubble.y}
                    >
                      <KeywordBubble
                        $size={bubble.size}
                        $color={keywordCategoryColors.门派}
                        onMouseEnter={(e) =>
                          handleKeywordBubbleMouseEnter(e, bubble)
                        }
                        onMouseLeave={handleKeywordBubbleMouseLeave}
                        title={`${bubble.word} (${bubble.frequency}次)`}
                      >
                        <KeywordBubbleText>{bubble.word}</KeywordBubbleText>
                      </KeywordBubble>
                    </KeywordBubbleWrapper>
                  )) || []}
                </KeywordBubbleContainer>
              </TopLeftPanelBubbles>
            </TopLeftPanel>

            {/* 下部：分为两个小面板 */}
            <BottomLeftSection>
              <BottomLeftPanel1>
                {/* 侠义精神标题 */}
                <BottomPanelTitle1></BottomPanelTitle1>
                {/* 侠义精神关键词气泡 */}
                <div ref={keywordContainer2Ref} style={{ flex: 1 }}>
                  <KeywordBubbleContainer>
                    {keywordBubbles.精神.bubbles?.map((bubble, index) => (
                      <KeywordBubbleWrapper
                        key={index}
                        $x={bubble.x}
                        $y={bubble.y}
                      >
                        <KeywordBubble
                          $size={bubble.size}
                          $color={keywordCategoryColors.精神}
                          onMouseEnter={(e) =>
                            handleKeywordBubbleMouseEnter(e, bubble)
                          }
                          onMouseLeave={handleKeywordBubbleMouseLeave}
                          title={`${bubble.word} (${bubble.frequency}次)`}
                        >
                          <KeywordBubbleText>{bubble.word}</KeywordBubbleText>
                        </KeywordBubble>
                      </KeywordBubbleWrapper>
                    )) || []}
                  </KeywordBubbleContainer>
                </div>
              </BottomLeftPanel1>
              <BottomLeftPanel2>
                {/* 武林功夫标题 */}
                <BottomPanelTitle2></BottomPanelTitle2>
                {/* 武林功夫关键词气泡 */}
                <div ref={keywordContainer3Ref} style={{ flex: 1 }}>
                  <KeywordBubbleContainer>
                    {keywordBubbles.武功.bubbles?.map((bubble, index) => (
                      <KeywordBubbleWrapper
                        key={index}
                        $x={bubble.x}
                        $y={bubble.y}
                      >
                        <KeywordBubble
                          $size={bubble.size}
                          $color={keywordCategoryColors.武功}
                          onMouseEnter={(e) =>
                            handleKeywordBubbleMouseEnter(e, bubble)
                          }
                          onMouseLeave={handleKeywordBubbleMouseLeave}
                          title={`${bubble.word} (${bubble.frequency}次)`}
                        >
                          <KeywordBubbleText>{bubble.word}</KeywordBubbleText>
                        </KeywordBubble>
                      </KeywordBubbleWrapper>
                    )) || []}
                  </KeywordBubbleContainer>
                </div>
              </BottomLeftPanel2>
            </BottomLeftSection>
          </LeftSection>

          {/* 右侧面板 */}
          <RightPanel>
            <RightPanelTop>
              <RightTopLeft>
                {/* 第一个容器：雷达图 */}
                <RightTopLeftRadar>
                  {/* 雷达图标题 */}
                  <RadarTitleContainer>
                    <RadarTitleText></RadarTitleText>
                  </RadarTitleContainer>

                  {/* 雷达图内容 */}
                  <RadarContentArea>
                    <RadarChartContainer>
                      <RadarSVG viewBox="0 0 300 300">
                        {/* 网格多边形 */}
                        {generateRadarChart().gridPolygons.map((polygon) => (
                          <RadarGridPolygon
                            key={polygon.key}
                            points={polygon.points}
                          />
                        ))}

                        {/* 轴线 */}
                        {generateRadarChart().axes.map((axis) => (
                          <RadarAxisLine
                            key={axis.line.key}
                            x1={axis.line.x1}
                            y1={axis.line.y1}
                            x2={axis.line.x2}
                            y2={axis.line.y2}
                          />
                        ))}

                        {/* 数据多边形 */}
                        <RadarPolygon
                          points={generateRadarChart().polygonPoints}
                        />

                        {/* 数据点 */}
                        {generateRadarChart().dataPoints.map((point) => (
                          <RadarDataPoint
                            key={point.key}
                            cx={point.x}
                            cy={point.y}
                            title={`${point.dimension}: ${point.value}`}
                          />
                        ))}

                        {/* 标签 */}
                        {generateRadarChart().axes.map((axis) => (
                          <RadarLabel
                            key={axis.label.key}
                            x={axis.label.x}
                            y={axis.label.y}
                          >
                            {axis.label.text}
                          </RadarLabel>
                        ))}
                      </RadarSVG>
                    </RadarChartContainer>
                  </RadarContentArea>
                </RightTopLeftRadar>
                {/* 第二个容器：电影基本信息 */}
                <RightTopLeftInfo>
                  {/* <div
                    style={{
                      padding: '1rem',
                      color: 'white',
                      backgroundColor: 'rgba(0,0,0,0.7)',
                      borderRadius: '0.5rem',
                      margin: '1rem',
                    }}
                  >
                    <div
                      style={{
                        fontSize: '1.25rem',
                        fontWeight: 'bold',
                        marginBottom: '0.5rem',
                      }}
                    >
                      {movieData.title}
                    </div>
                    <div
                      style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}
                    >
                      年份: {movieData.year}
                    </div>
                    <div
                      style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}
                    >
                      豆瓣评分(国内): {movieData.rating}
                    </div>
                    <div
                      style={{ fontSize: '0.875rem', marginBottom: '0.25rem' }}
                    >
                      IMDB评分(国外): {movieData.imdbRating}
                    </div>
                    <div
                      style={{
                        fontSize: '0.6875rem',
                        color: '#ccc',
                        marginTop: '0.5rem',
                      }}
                    >
                      数据来源: {movieData.dataSource || '硬编码数据'}
                    </div>
                  </div> */}
                </RightTopLeftInfo>
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
                    <AxisLabel className="x-axis" style={{ left: '1.5625rem' }}>
                      开始
                    </AxisLabel>
                    <AxisLabel className="x-axis" style={{ left: '50%' }}>
                      时间轴
                    </AxisLabel>
                    <AxisLabel
                      className="x-axis"
                      style={{ right: '1.5625rem' }}
                    >
                      结束
                    </AxisLabel>
                    {/* Y轴情绪类型标签 */}
                    <AxisLabel className="y-axis" style={{ top: '1.875rem' }}>
                      喜
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '3.125rem' }}>
                      怒
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '4.375rem' }}>
                      哀
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '5.625rem' }}>
                      乐
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '6.875rem' }}>
                      恐
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '8.125rem' }}>
                      惊
                    </AxisLabel>
                    <AxisLabel className="y-axis" style={{ top: '9.375rem' }}>
                      厌
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
                  <AxisLabel className="x-axis" style={{ left: '1.5625rem' }}>
                    开始
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ left: '50%' }}>
                    时间轴
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ right: '1.5625rem' }}>
                    结束
                  </AxisLabel>
                  {/* Y轴情绪类型标签 */}
                  <AxisLabel className="y-axis" style={{ top: '2.5rem' }}>
                    喜
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '4.0625rem' }}>
                    怒
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '5.625rem' }}>
                    哀
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '7.1875rem' }}>
                    乐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '8.75rem' }}>
                    恐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '10.3125rem' }}>
                    惊
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '11.875rem' }}>
                    厌
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
                  <AxisLabel className="x-axis" style={{ left: '1.5625rem' }}>
                    开始
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ left: '50%' }}>
                    时间轴
                  </AxisLabel>
                  <AxisLabel className="x-axis" style={{ right: '1.5625rem' }}>
                    结束
                  </AxisLabel>
                  {/* Y轴情绪类型标签 */}
                  <AxisLabel className="y-axis" style={{ top: '2.5rem' }}>
                    喜
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '4.0625rem' }}>
                    怒
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '5.625rem' }}>
                    哀
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '7.1875rem' }}>
                    乐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '8.75rem' }}>
                    恐
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '10.3125rem' }}>
                    惊
                  </AxisLabel>
                  <AxisLabel className="y-axis" style={{ top: '11.875rem' }}>
                    厌
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
            <EmotionLabel>
              {tooltip.emotion}/{tooltip.dataIndex}
            </EmotionLabel>
            <DialogueContent>
              {tooltip.content.split('\n').map((line, index) => (
                <div key={index} className="dialogue-line">
                  {line.trim()}
                </div>
              ))}
            </DialogueContent>
          </DialogueTooltip>
        )}

        {/* 关键词提示框 */}
        {keywordTooltip.visible && (
          <KeywordTooltip
            style={{
              left: keywordTooltip.x,
              top: keywordTooltip.y,
              transform: 'translateX(-50%) translateY(-100%)',
            }}
          >
            <KeywordLabel>{keywordTooltip.category}关键词</KeywordLabel>
            <KeywordContent>
              <div className="keyword-info">
                <div className="keyword-word">{keywordTooltip.word}</div>
              </div>
              <div className="keyword-info">
                <div className="keyword-detail">
                  频次: {keywordTooltip.frequency}
                </div>
              </div>
              <div className="keyword-info">
                <div className="keyword-detail">
                  类别: {keywordTooltip.category}
                </div>
              </div>
            </KeywordContent>
          </KeywordTooltip>
        )}
      </DetailContainer>
    </>
  )
}

export default MovieDetail
