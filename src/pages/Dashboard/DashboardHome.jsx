import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'
import * as XLSX from 'xlsx'

// 移除全局变量，改用 useState 在组件内部管理

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

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const DashboardContainer = styled.div`
  height: 100vh;
  width: 100vw;
  padding: 1rem;
  background-image: url(${(props) => props.$backgroundUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  transition: ${(props) =>
    props.$isHovering
      ? 'background-image 0.5s ease-in-out'
      : 'background-image 2s ease-in-out'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  /* 强制重新渲染的动画 */
  animation: ${(props) =>
    props.$isHovering ? 'backgroundRefresh 0.1s ease-in-out' : 'none'};

  @keyframes backgroundRefresh {
    0% {
      opacity: 0.98;
    }
    100% {
      opacity: 1;
    }
  }
`

const HeaderSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 12vh;
  margin-bottom: 1vh;
  flex-shrink: 0;
  border-bottom: 0.0625rem solid rgba(139, 69, 19, 0.2);
  padding: 1vh 2vw;
  gap: 1vh;
`

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
`

const MainTitle = styled.h1`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(1.8rem, 4vw, 3.2rem);
  font-weight: bold;
  color: #8b4513;
  text-shadow: 0.125rem 0.125rem 0.25rem rgba(0, 0, 0, 0.1);
  margin: 0;
  letter-spacing: 0.2em;
  line-height: 1;
  white-space: nowrap;
`

const Subtitle = styled.div`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.8rem, 1.2vw, 1.1rem);
  color: #696969;
  margin: 0.5vh 0 0 0;
  line-height: 1.2;
  letter-spacing: 0.1em;
  white-space: nowrap;
`

const ControlSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2vw;
  width: 100%;
`

const HintText = styled.div`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.7rem, 1vw, 0.9rem);
  color: #696969;
  white-space: nowrap;
  margin-right: 1vw;
`

const IconGroup = styled.div`
  display: flex;
  gap: 1.2vw;
  align-items: center;
`

const DiamondIcon = styled.div`
  width: clamp(2rem, 3vw, 2.5rem);
  height: clamp(2rem, 3vw, 2.5rem);
  background: ${(props) => (props.$active ? '#D2691E' : '#B0C4DE')};
  transform: rotate(45deg);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.2vh 0.8vh rgba(0, 0, 0, 0.1);
  position: relative;

  &:hover {
    background: #d2691e;
    transform: rotate(45deg) scale(1.1);
  }

  span {
    transform: rotate(-45deg);
    font-family: 'AaGuDianKeBenSong', serif;
    font-size: clamp(0.6rem, 0.8vw, 0.8rem);
    color: white;
    font-weight: bold;
  }

  /* 门派图标特殊样式 */
  ${(props) =>
    props.$category === '门派' &&
    `
    background: ${props.$active ? '#D2691E' : '#CD853F'};
    
    &::before {
      content: '◆';
      position: absolute;
      font-size: clamp(0.4rem, 0.6vw, 0.6rem);
      color: rgba(255,255,255,0.3);
      transform: rotate(-45deg);
      top: 0.2vh;
      left: 0.2vw;
    }
  `}

  /* 精神图标特殊样式 */
  ${(props) =>
    props.$category === '精神' &&
    `
    background: ${props.$active ? '#D2691E' : '#708090'};
    
    &::before {
      content: '◇';
      position: absolute;
      font-size: clamp(0.4rem, 0.6vw, 0.6rem);
      color: rgba(255,255,255,0.3);
      transform: rotate(-45deg);
      top: 0.2vh;
      left: 0.2vw;
    }
  `}

  /* 武功图标特殊样式 */
  ${(props) =>
    props.$category === '武功' &&
    `
    background: ${props.$active ? '#D2691E' : '#B0C4DE'};
    
    &::before {
      content: '⬟';
      position: absolute;
      font-size: clamp(0.4rem, 0.6vw, 0.6rem);
      color: rgba(255,255,255,0.3);
      transform: rotate(-45deg);
      top: 0.2vh;
      left: 0.2vw;
    }
  `}
`

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  padding: 1vh 1vw;
`

// 数据展示面板样式
const DataPanel = styled.div`
  position: fixed;
  background: rgba(255, 255, 255, 0.95);
  border: 0.125rem solid #e2d8d5;
  border-radius: 0.5rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);
  z-index: 1000;
  font-family: 'AaGuDianKeBenSong', serif;
  min-width: 12.5rem;
  max-width: 18.75rem;
  max-height: 80vh;
  overflow-y: auto;
  pointer-events: none;

  .movie-title {
    font-size: 0.875rem;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 0.25rem;
    text-align: center;
  }

  .movie-year {
    font-size: 0.75rem;
    color: #696969;
    text-align: center;
    margin-bottom: 0.5rem;
  }

  .movie-quote {
    font-size: 0.6875rem;
    color: #534c4c;
    font-style: italic;
    text-align: center;
    margin-bottom: 0.625rem;
    padding: 0.25rem 0.5rem;
    background: rgba(221, 181, 170, 0.1);
    border-radius: 0.25rem;
  }

  .data-section {
    margin-bottom: 0.5rem;
  }

  .category-title {
    font-size: 0.75rem;
    font-weight: bold;
    color: #8b4513;
    margin-bottom: 0.25rem;
  }

  .data-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.125rem 0;
    font-size: 0.6875rem;
  }

  .data-label {
    color: #534c4c;
  }

  .data-value {
    font-weight: bold;
    color: #8b4513;
    min-width: 1.25rem;
    text-align: right;
  }

  .data-bar {
    flex: 1;
    height: 0.25rem;
    background: #e1d7d4;
    margin: 0 0.5rem;
    border-radius: 0.125rem;
    overflow: hidden;
  }

  .data-fill {
    height: 100%;
    background: #e2d8d5;
    transition: width 0.3s ease;
  }
`

// 头部区域组件
const HeaderArea = styled.div`
  position: relative;
  width: 100%;
  height: 12vh;
  flex-shrink: 0;
`

const LegendTitle = styled.h3`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: 1rem;
  color: #8b4513;
  margin-bottom: 0.8rem;
  text-align: center;
  line-height: 1.3;
`

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: 0.9rem;
  color: #2f4f4f;
`

const LegendColor = styled.div`
  width: 1.25rem;
  height: 0.75rem;
  background: ${(props) => props.color};
  margin-right: 0.8rem;
  border-radius: 0.125rem;
`

const DataSource = styled.div`
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 0.0625rem solid #d3d3d3;
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: 0.8rem;
  color: #696969;
  line-height: 1.4;
`

// 中间区域组件
const MiddleArea = styled.div`
  display: flex;
  gap: 1vh;
  align-items: stretch;
  flex: 3;
  min-height: 0;
  overflow: hidden;
`

const LeftMiddlePanel = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 1vh;
`

const LeftTopPanel = styled.div`
  background: transparent;
  border-radius: 0.5rem;
  padding: 1.5vh 1.5vw;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex: 1;
`

const LeftBottomPanel = styled.div`
  background: transparent;
  border-radius: 0.5rem;
  padding: 1vh 1vw;
  position: relative;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
`

const RightMiddlePanel = styled.div`
  background: transparent;
  border-radius: 0.5rem;
  padding: 1.5vh 1.5vw;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  height: 100%;
  max-height: 100%;
  min-height: 0;
`

// 内容容器 - 使用河流图背景，去掉装饰样式
const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1vh;
  flex: 1;
  min-height: 0;
  overflow: hidden;

  /* 河流图背景 */
  background-image: url(${(props) =>
    `/assets/images/${
      props.$activeCategory === '门派'
        ? '门派.png'
        : props.$activeCategory === '精神'
        ? '精神.png'
        : '武功.png'
    }`});
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: local;
`

// 底部区域组件
const BottomChartPanel = styled.div`
  background: transparent;
  border-radius: 0.5rem;
  padding: 1vh 1vw;
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1.5;
`

const StatsTitle = styled.h3`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: clamp(0.9rem, 1.2vw, 1.1rem);
  color: #8b4513;
  margin-bottom: 1vh;
  text-align: center;
  line-height: 1.3;
`

const StatsCard = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 0.5rem;
  padding: 1vh 1vw;
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(0.625rem);
  overflow-y: auto;
  min-height: 0;
`

const SourceNote = styled.div`
  font-family: 'AaGuDianKeBenSong', serif;
  font-size: 0.7rem;
  color: #696969;
  margin-bottom: 1rem;
`

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(246, 240, 231, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(0.25rem);
  z-index: 10;
`

const LoadingSpinner = styled.div`
  width: 3.75rem;
  height: 3.75rem;
  border: 0.1875rem solid rgba(210, 105, 30, 0.3);
  border-top: 0.1875rem solid #d2691e;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`

const LoadingText = styled.div`
  margin-top: 1.25rem;
  color: #8b4513;
  font-size: 1rem;
  text-align: center;
  font-family: 'AaGuDianKeBenSong', serif;
`

const ErrorMessage = styled.div`
  background: rgba(205, 92, 92, 0.1);
  border: 0.0625rem solid rgba(205, 92, 92, 0.3);
  border-radius: 0.5rem;
  padding: 1.25rem;
  margin: 1.25rem;
  color: #cd5c5c;
  text-align: center;
  font-family: 'AaGuDianKeBenSong', serif;

  h3 {
    margin: 0 0 0.625rem 0;
    color: #b22222;
  }

  p {
    margin: 0;
    opacity: 0.8;
    font-family: 'AaGuDianKeBenSong', serif;
  }

  button {
    margin-top: 0.9375rem;
    background: rgba(205, 92, 92, 0.2);
    border: 0.0625rem solid rgba(205, 92, 92, 0.4);
    color: #cd5c5c;

    &:hover {
      background: rgba(205, 92, 92, 0.3);
      border-color: rgba(205, 92, 92, 0.6);
    }
  }
`

const DashboardHome = () => {
  const navigate = useNavigate()

  // 数据状态
  const [excelData, setExcelData] = useState([])
  const [wordFrequencyData, setWordFrequencyData] = useState({}) // 词频数据缓存
  const [segmentedData, setSegmentedData] = useState({
    segment1: { data: [], count: 0, percentage: 0 },
    segment2: { data: [], count: 0, percentage: 0 },
    segment3: { data: [], count: 0, percentage: 0 },
  })

  // 控制状态
  const [activeCategory, setActiveCategory] = useState('门派')
  const [viewMode, setViewMode] = useState('国内外观众')
  const [segment1Percentage, setSegment1Percentage] = useState(0.229) // 11个数据
  const [segment2Percentage, setSegment2Percentage] = useState(0.292) // 14个数据
  const [segment3Percentage, setSegment3Percentage] = useState(0.479) // 23个数据

  // 使用 useState 定义电影名称到背景图片的映射表
  const [movieBackgroundMap, setMovieBackgroundMap] = useState(() => {
    console.log('🎬 初始化电影背景映射表...')

    try {
      // 根据实际Excel数据中的电影名称创建映射表 (按序号1-48对应)
      const movieMap = {
        // 1-10
        倩女幽魂: require('../../assets/images/backgrounds/1.png'),
        射雕英雄传之东成西就: require('../../assets/images/backgrounds/2.png'),
        新龙门客栈: require('../../assets/images/backgrounds/3.png'),
        东邪西毒: require('../../assets/images/backgrounds/4.png'),
        '笑傲江湖2:东方不败': require('../../assets/images/backgrounds/5.png'),
        卧虎藏龙: require('../../assets/images/backgrounds/6.png'),
        侠女: require('../../assets/images/backgrounds/7.png'),
        黄飞鸿: require('../../assets/images/backgrounds/8.png'),
        少林寺: require('../../assets/images/backgrounds/9.png'),
        鹿鼎记: require('../../assets/images/backgrounds/10.png'),

        // 11-20
        '黄飞鸿之二：男儿当自强': require('../../assets/images/backgrounds/11.png'),
        双旗镇刀客: require('../../assets/images/backgrounds/12.png'),
        武状元苏乞儿: require('../../assets/images/backgrounds/13.png'),
        '鹿鼎记2:神龙教': require('../../assets/images/backgrounds/14.png'),
        '黄飞鸿之三：狮王争霸': require('../../assets/images/backgrounds/15.png'),
        // 16号位置没有图片，跳过
        师父: require('../../assets/images/backgrounds/17.png'),
        '倩女幽魂2:人间道': require('../../assets/images/backgrounds/18.png'),
        太极张三丰: require('../../assets/images/backgrounds/19.png'),
        方世玉: require('../../assets/images/backgrounds/20.png'),

        // 21-30
        笑傲江湖: require('../../assets/images/backgrounds/21.png'),
        空山灵雨: require('../../assets/images/backgrounds/22.png'),
        倚天屠龙记之魔教教主: require('../../assets/images/backgrounds/23.png'),
        刀: require('../../assets/images/backgrounds/24.png'),
        洪熙官: require('../../assets/images/backgrounds/25.png'),
        龙门客栈: require('../../assets/images/backgrounds/26.png'),
        方世玉续集: require('../../assets/images/backgrounds/27.png'),
        白发魔女传: require('../../assets/images/backgrounds/28.png'),
        陆小凤传奇之陆小凤前传: require('../../assets/images/backgrounds/29.png'),
        绣春刀: require('../../assets/images/backgrounds/30.png'),

        // 31-40
        英雄: require('../../assets/images/backgrounds/31.png'),
        剑雨: require('../../assets/images/backgrounds/32.png'),
        一刀倾城: require('../../assets/images/backgrounds/33.png'),
        陆小凤传奇之铁鞋传奇: require('../../assets/images/backgrounds/34.png'),
        新独臂刀: require('../../assets/images/backgrounds/35.png'),
        新天龙八部之天山童姥: require('../../assets/images/backgrounds/36.png'),
        少年黄飞鸿之铁马骝: require('../../assets/images/backgrounds/37.png'),
        东方三侠: require('../../assets/images/backgrounds/38.png'),
        陆小凤传奇之大金鹏王: require('../../assets/images/backgrounds/39.png'),
        迎春阁之风波: require('../../assets/images/backgrounds/40.png'),

        // 41-48
        唐朝豪放女: require('../../assets/images/backgrounds/41.png'),
        东方不败之风云再起: require('../../assets/images/backgrounds/42.png'),
        刺客聂隐娘: require('../../assets/images/backgrounds/43.png'),
        陆小凤传奇之绣花大盗: require('../../assets/images/backgrounds/44.png'),
        黄河大侠: require('../../assets/images/backgrounds/45.png'),
        水浒传之英雄本色: require('../../assets/images/backgrounds/46.png'),
        箭士柳白猿: require('../../assets/images/backgrounds/47.png'),
        六指琴魔: require('../../assets/images/backgrounds/47.png'), // 48号使用47号图片
      }

      console.log('✅ 电影背景映射表初始化成功!')
      console.log('📊 映射表条目数:', Object.keys(movieMap).length)
      console.log('🎬 部分映射示例:')
      Object.entries(movieMap)
        .slice(0, 3)
        .forEach(([name, path]) => {
          console.log(`  "${name}" → ${path}`)
        })

      return movieMap
    } catch (error) {
      console.error('❌ 电影背景映射表初始化失败:', error)
      return {}
    }
  })

  // 背景状态，初始化为第一张图片
  const [currentBackground, setCurrentBackground] = useState(() => {
    try {
      return require('../../assets/images/backgrounds/1.png')
    } catch (error) {
      console.error('❌ 默认背景图片加载失败:', error)
      return '/assets/images/backgrounds/1.png'
    }
  })

  // 添加强制刷新状态
  const [backgroundKey, setBackgroundKey] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const [imagesLoaded, setImagesLoaded] = useState(true) // 由于使用直接映射，设置为true

  // 数据展示面板状态
  const [showDataPanel, setShowDataPanel] = useState(false)
  const [hoveredMovieData, setHoveredMovieData] = useState(null)
  const [panelPosition, setPanelPosition] = useState({ x: 0, y: 0 })
  const [hoverTimeout, setHoverTimeout] = useState(null)
  const [recordedMousePos, setRecordedMousePos] = useState({ x: 0, y: 0 })
  const dataPanelRef = React.useRef(null)

  // 类别索引常量定义
  const CATEGORY_INDICES = {
    门派: 0,
    精神: 1,
    武功: 2,
  }

  // 子类别索引常量定义 - 按Excel字段顺序重新排列
  const SUBCATEGORY_INDICES = {
    门派: {
      玄门别派: 0, // 对应__EMPTY (索引0)
      江湖民间: 1, // 对应__EMPTY_1 (索引1)
      官府朝廷: 2, // 对应__EMPTY_2 (索引2)
      正统门派: 3, // 对应门派字段 (索引3)
    },
    精神: {
      义: 0, // 对应__EMPTY (索引0)
      信: 1, // 对应__EMPTY_1 (索引1)
      仁: 2, // 对应精神字段 (索引2)
    },
    武功: {
      武器技法: 0, // 对应__EMPTY (索引0)
      拳脚搏击: 1, // 对应__EMPTY_1 (索引1)
      奇门异术: 2, // 对应__EMPTY_2 (索引2)
      内功心法: 3, // 对应武功字段 (索引3)
    },
  }

  // 类别顺序数组（用于遍历和排序）
  const CATEGORY_ORDER = ['门派', '精神', '武功']

  // 固定的类别子类别映射表 - 基于河流图总表.xlsx实际数据
  const [categorySubcategoryMap] = useState(() => {
    console.log('🗂️ 初始化类别子类别映射表（基于真实Excel数据）...')

    const mapping = {
      门派: {
        index: CATEGORY_INDICES['门派'],
        subcategories: {
          正统门派: {
            index: SUBCATEGORY_INDICES['门派']['正统门派'],
            description: '名门正派，武林正宗',
            color: '#CD853F',
            key: '正统门派',
            excelKey: '正统门派', // Excel表格中的列名
            movies: ['少林寺', '黄飞鸿', '武当山', '峨眉派', '华山派'],
          },
          玄门别派: {
            index: SUBCATEGORY_INDICES['门派']['玄门别派'],
            description: '道家旁门，另辟蹊径',
            color: '#D2691E',
            key: '玄门别派',
            excelKey: '玄门别派',
            movies: ['笑傲江湖', '东方不败', '任我行'],
          },
          江湖民间: {
            index: SUBCATEGORY_INDICES['门派']['江湖民间'],
            description: '草莽英雄，江湖儿女',
            color: '#B8860B',
            key: '江湖民间',
            excelKey: '江湖民间',
            movies: ['新龙门客栈', '龙门客栈', '侠女', '刀客'],
          },
          官府朝廷: {
            index: SUBCATEGORY_INDICES['门派']['官府朝廷'],
            description: '朝廷鹰犬，官府走狗',
            color: '#8B4513',
            key: '官府朝廷',
            excelKey: '官府朝廷',
            movies: ['绣春刀', '锦衣卫', '东厂西厂'],
          },
        },
      },
      精神: {
        index: CATEGORY_INDICES['精神'],
        subcategories: {
          仁: {
            index: SUBCATEGORY_INDICES['精神']['仁'],
            description: '仁者爱人，慈悲为怀',
            color: '#4682B4',
            key: '仁',
            excelKey: '仁',
            movies: ['卧虎藏龙', '英雄', '侠女'],
          },
          义: {
            index: SUBCATEGORY_INDICES['精神']['义'],
            description: '义薄云天，义气千秋',
            color: '#5F9EA0',
            key: '义',
            excelKey: '义',
            movies: ['黄飞鸿', '方世玉', '新龙门客栈'],
          },
          信: {
            index: SUBCATEGORY_INDICES['精神']['信'],
            description: '一诺千金，言而有信',
            color: '#6495ED',
            key: '信',
            excelKey: '信',
            movies: ['倩女幽魂', '射雕英雄传', '天龙八部'],
          },
        },
      },
      武功: {
        index: CATEGORY_INDICES['武功'],
        subcategories: {
          内功心法: {
            index: SUBCATEGORY_INDICES['武功']['内功心法'],
            description: '内力深厚，以气御敌',
            color: '#DC143C',
            key: '内功心法',
            excelKey: '内功心法',
            movies: ['一代宗师', '太极张三丰', '少林寺'],
          },
          武器技法: {
            index: SUBCATEGORY_INDICES['武功']['武器技法'],
            description: '兵器精通，技法高超',
            color: '#B22222',
            key: '武器技法',
            excelKey: '武器技法',
            movies: ['笑傲江湖', '新龙门客栈', '侠女', '绣春刀'],
          },
          拳脚搏击: {
            index: SUBCATEGORY_INDICES['武功']['拳脚搏击'],
            description: '拳脚功夫，近身搏击',
            color: '#CD5C5C',
            key: '拳脚搏击',
            excelKey: '拳脚搏击',
            movies: ['黄飞鸿', '叶问', '方世玉', '武状元苏乞儿'],
          },
          奇门异术: {
            index: SUBCATEGORY_INDICES['武功']['奇门异术'],
            description: '奇门遁甲，异术神功',
            color: '#F08080',
            key: '奇门异术',
            excelKey: '奇门异术',
            movies: ['倩女幽魂', '东方不败', '白发魔女传'],
          },
        },
      },
    }

    console.log('✅ 类别子类别映射表初始化完成!')
    console.log('📊 映射表结构:')
    Object.entries(mapping).forEach(([category, categoryConfig]) => {
      console.log(
        `  ${category}: ${
          Object.keys(categoryConfig.subcategories || {}).length
        }个子类别`,
      )
      if (categoryConfig.subcategories) {
        Object.entries(categoryConfig.subcategories).forEach(
          ([subcat, info]) => {
            console.log(`    - ${subcat}: ${info.movies?.length || 0}部电影`)
          },
        )
      }
    })

    return mapping
  })

  // 加载状态
  const [dataLoading, setDataLoading] = useState(true)
  const [dataError, setDataError] = useState(null)

  // 工具函数：根据索引获取类别名称
  const getCategoryByIndex = (index) => {
    return CATEGORY_ORDER[index] || null
  }

  // 工具函数：根据类别和索引获取子类别名称
  const getSubcategoryByIndex = (category, index) => {
    const categoryConfig = categorySubcategoryMap[category]
    if (!categoryConfig || !categoryConfig.subcategories) return null

    for (const [name, info] of Object.entries(categoryConfig.subcategories)) {
      if (info.index === index) return name
    }
    return null
  }

  // 工具函数：获取所有类别的完整信息
  const getAllCategoriesInfo = () => {
    return CATEGORY_ORDER.map((categoryName, index) => ({
      name: categoryName,
      index: index,
      subcategoryCount: Object.keys(
        categorySubcategoryMap[categoryName]?.subcategories || {},
      ).length,
      subcategories: getCategorySubcategories(categoryName),
    }))
  }

  // 工具函数：验证索引有效性
  const isValidCategoryIndex = (index) => {
    return index >= 0 && index < CATEGORY_ORDER.length
  }

  const isValidSubcategoryIndex = (category, index) => {
    const categoryConfig = categorySubcategoryMap[category]
    if (!categoryConfig || !categoryConfig.subcategories) return false

    const maxIndex = Math.max(
      ...Object.values(categoryConfig.subcategories).map((info) => info.index),
    )
    return index >= 0 && index <= maxIndex
  }

  // 旧的初始化函数已移除，现在使用 useState 直接定义映射表

  // 根据Excel数据的数值结果确定电影的主要子类别
  const getMovieSubcategoryFromData = (item, category) => {
    const movieName = item?.['电影名'] || item?.['电影'] || '未知电影'
    console.log('🔍 根据数据值确定电影子类别:', {
      电影: movieName,
      类别: category,
      有原始数据: !!item?.原始数据,
    })

    // 优先使用新的子类别数据结构
    if (item.子类别数据) {
      console.log('📊 使用子类别数据结构:', item.子类别数据)

      let maxValue = 0
      let dominantSubcategory = null
      let allSubcategoryValues = {}

      // 获取当前类别的子类别配置
      const categoryConfig = categorySubcategoryMap[category]
      if (!categoryConfig || !categoryConfig.subcategories) {
        console.log('⚠️ 未找到类别配置:', category)
        return null
      }

      // 遍历子类别数据，找到最大值
      Object.entries(item.子类别数据).forEach(([subcategoryName, value]) => {
        if (subcategoryName !== '结果' && typeof value === 'number') {
          allSubcategoryValues[subcategoryName] = value
          console.log(`📊 ${subcategoryName}: ${value}`)

          if (value > maxValue) {
            maxValue = value
            dominantSubcategory = subcategoryName
          }
        }
      })

      console.log('📈 所有数值:', allSubcategoryValues)
      console.log('🏆 最大值子类别:', {
        名称: dominantSubcategory,
        数值: maxValue,
      })

      if (
        dominantSubcategory &&
        categoryConfig.subcategories[dominantSubcategory]
      ) {
        const subcategoryInfo =
          categoryConfig.subcategories[dominantSubcategory]
        const result = {
          name: dominantSubcategory,
          index: subcategoryInfo.index,
          description: subcategoryInfo.description,
          color: subcategoryInfo.color,
          value: maxValue,
          key: subcategoryInfo.key,
          excelKey: subcategoryInfo.excelKey,
          categoryIndex: categoryConfig.index,
          movieName: movieName,
          allValues: allSubcategoryValues,
        }

        console.log('✅ 成功确定主导子类别:', result)
        return result
      }
    }

    // 如果没有子类别数据，尝试从原始数据中获取（向后兼容）
    if (!item || !item.原始数据) {
      console.log('⚠️ 缺少原始数据，尝试输出可用字段:')
      if (item) {
        console.log('📋 数据项字段:', Object.keys(item))
      }
      return null
    }

    const originalData = item.原始数据
    console.log('📋 原始数据字段:', Object.keys(originalData))

    let maxValue = 0
    let dominantSubcategory = null
    let dominantSubcategoryIndex = -1
    let allSubcategoryValues = {}

    // 获取当前类别的子类别配置
    const categoryConfig = categorySubcategoryMap[category]
    if (!categoryConfig || !categoryConfig.subcategories) {
      console.log('⚠️ 未找到类别配置:', category)
      return null
    }

    // 动态分析所有子类别的数值
    const subcategoryValues = {}
    let hasAnyValue = false

    for (const [subcatName, subcatInfo] of Object.entries(
      categoryConfig.subcategories,
    )) {
      const excelKey = subcatInfo.excelKey || subcatName
      let value = 0

      // 尝试多种方式获取数值
      if (originalData[excelKey] !== undefined) {
        value = parseFloat(originalData[excelKey]) || 0
      } else if (originalData[subcatName] !== undefined) {
        value = parseFloat(originalData[subcatName]) || 0
      } else {
        // 尝试模糊匹配
        for (const [key, val] of Object.entries(originalData)) {
          if (key.includes(subcatName) || subcatName.includes(key)) {
            value = parseFloat(val) || 0
            console.log(`🔍 模糊匹配: ${excelKey} -> ${key} = ${value}`)
            break
          }
        }
      }

      subcategoryValues[subcatName] = value
      allSubcategoryValues[subcatName] = value

      if (value > 0) {
        hasAnyValue = true
      }

      // 找到数值最高的子类别
      if (value > maxValue) {
        maxValue = value
        dominantSubcategory = subcatName
        dominantSubcategoryIndex = subcatInfo.index
      }

      console.log(`📊 ${subcatName} (${excelKey}): ${value}`)
    }

    console.log(`📊 ${category}数值分析完成:`, {
      电影: movieName,
      数值分布: subcategoryValues,
      主导子类别: dominantSubcategory,
      最大数值: maxValue,
      索引: dominantSubcategoryIndex,
      有效数值: hasAnyValue,
    })

    // 如果没有任何有效数值，返回null
    if (!hasAnyValue) {
      console.log('⚠️ 所有子类别数值都为0或无效')
      return null
    }

    // 返回主导子类别的详细信息
    if (
      dominantSubcategory &&
      categoryConfig.subcategories[dominantSubcategory]
    ) {
      const subcategoryInfo = categoryConfig.subcategories[dominantSubcategory]
      const result = {
        name: dominantSubcategory,
        index: dominantSubcategoryIndex,
        description: subcategoryInfo.description,
        color: subcategoryInfo.color,
        value: maxValue,
        key: subcategoryInfo.key,
        excelKey: subcategoryInfo.excelKey,
        categoryIndex: categoryConfig.index,
        movieName: movieName,
        allValues: allSubcategoryValues,
      }

      console.log('✅ 成功确定主导子类别:', result)
      return result
    }

    console.log('⚠️ 未找到主导子类别')
    return null
  }

  // 根据电影名称获取其所属的子类别（备用方法）
  const getMovieSubcategory = (movieName, category) => {
    console.log('🔍 查找电影子类别:', { movieName, category })

    const categoryConfig = categorySubcategoryMap[category]
    if (!categoryConfig || !categoryConfig.subcategories) {
      console.log('⚠️ 未找到类别配置:', category)
      return null
    }

    // 遍历该类别下的所有子类别
    for (const [subcategoryName, subcategoryInfo] of Object.entries(
      categoryConfig.subcategories,
    )) {
      if (subcategoryInfo.movies.includes(movieName)) {
        console.log('✅ 找到电影子类别:', {
          movieName,
          category,
          subcategory: subcategoryName,
        })
        return {
          name: subcategoryName,
          index: subcategoryInfo.index,
          description: subcategoryInfo.description,
          color: subcategoryInfo.color,
          movies: subcategoryInfo.movies,
          key: subcategoryInfo.key,
          excelKey: subcategoryInfo.excelKey,
          categoryIndex: categoryConfig.index,
        }
      }
    }

    // 如果没有找到精确匹配，尝试模糊匹配
    for (const [subcategoryName, subcategoryInfo] of Object.entries(
      categoryConfig.subcategories,
    )) {
      for (const movie of subcategoryInfo.movies) {
        if (movie.includes(movieName) || movieName.includes(movie)) {
          console.log('✅ 模糊匹配找到电影子类别:', {
            movieName,
            category,
            subcategory: subcategoryName,
            matchedMovie: movie,
          })
          return {
            name: subcategoryName,
            index: subcategoryInfo.index,
            description: subcategoryInfo.description,
            color: subcategoryInfo.color,
            movies: subcategoryInfo.movies,
            key: subcategoryInfo.key,
            excelKey: subcategoryInfo.excelKey,
            categoryIndex: categoryConfig.index,
          }
        }
      }
    }

    console.log('⚠️ 未找到电影子类别:', { movieName, category })
    return null
  }

  // 获取类别下的所有子类别
  const getCategorySubcategories = (category) => {
    console.log('📋 获取类别子类别列表:', category)

    const categoryConfig = categorySubcategoryMap[category]
    if (!categoryConfig || !categoryConfig.subcategories) {
      console.log('⚠️ 未找到类别配置:', category)
      return []
    }

    const subcategories = Object.entries(categoryConfig.subcategories)
      .map(([name, info]) => ({
        name,
        index: info.index,
        description: info.description,
        color: info.color,
        movieCount: info.movies.length,
        movies: info.movies,
        key: info.key,
        excelKey: info.excelKey,
        categoryIndex: categoryConfig.index,
      }))
      .sort((a, b) => a.index - b.index) // 按索引排序

    console.log(
      `✅ ${category}类别包含 ${subcategories.length} 个子类别:`,
      subcategories.map((s) => `${s.name}(${s.index})`),
    )
    return subcategories
  }

  // 读取词频文件的函数 - 支持多工作表结构
  const loadWordFrequencyFile = async (movieName) => {
    console.log('📊 读取词频文件:', movieName)

    try {
      // 构建文件名映射
      const movieNameToFileMap = {
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
      }

      const fileName = movieNameToFileMap[movieName]
      if (!fileName) {
        console.log('⚠️ 未找到对应的词频文件:', movieName)
        return null
      }

      // 检查是否已缓存
      if (wordFrequencyData[movieName]) {
        console.log('✅ 使用缓存的词频数据:', movieName)
        return wordFrequencyData[movieName]
      }

      const response = await fetch(`/assets/word-frequency/${fileName}`)
      if (!response.ok) {
        console.log('❌ 词频文件读取失败:', fileName)
        return null
      }

      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      console.log('📋 词频文件工作表列表:', workbook.SheetNames)

      // 处理词频数据，支持多工作表结构
      const wordFrequencyInfo = {
        电影名: movieName,
        所有类别数据: {},
        子类别台词: {},
        台词统计: {},
      }

      // 工作表名称到类别的映射（可能的变体）
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
        // 可能的英文或其他变体
        Sheet1: '门派', // 默认第一个表为门派
        Sheet2: '精神', // 默认第二个表为精神
        Sheet3: '武功', // 默认第三个表为武功
      }

      // 遍历所有工作表
      workbook.SheetNames.forEach((sheetName, index) => {
        console.log(`📄 处理工作表: ${sheetName} (索引: ${index})`)

        // 确定工作表对应的类别
        let category = sheetNameToCategoryMap[sheetName]
        if (!category) {
          // 如果没有精确匹配，使用索引默认映射
          const defaultCategories = ['门派', '精神', '武功']
          category = defaultCategories[index] || '未知'
          console.log(
            `⚠️ 工作表"${sheetName}"未找到精确映射，使用默认类别: ${category}`,
          )
        }

        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        console.log(
          `📊 工作表"${sheetName}"(${category})包含 ${jsonData.length} 条数据`,
        )

        if (jsonData.length > 0) {
          // 存储原始数据
          wordFrequencyInfo.所有类别数据[category] = jsonData

          // 处理该类别的子类别数据
          const categoryConfig = categorySubcategoryMap[category]
          if (categoryConfig && categoryConfig.subcategories) {
            Object.entries(categoryConfig.subcategories).forEach(
              ([subcategoryName, subcategoryInfo]) => {
                // 从词频数据中提取与子类别相关的台词和统计
                const relevantWords = jsonData
                  .filter((row) => {
                    const wordText =
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
                    const rowCategory =
                      row['归属类别'] ||
                      row['分类'] ||
                      row['类别'] ||
                      row['category'] ||
                      ''

                    // 根据归属类别字段匹配子分类，或者如果没有归属类别字段，则包含所有数据
                    const categoryMatch =
                      rowCategory === '' || rowCategory === subcategoryName
                    return (
                      categoryMatch && frequency > 0 && wordText.trim() !== ''
                    )
                  })
                  .sort((a, b) => {
                    const freqA = parseInt(
                      a['词频'] ||
                        a['频次'] ||
                        a['次数'] ||
                        a['frequency'] ||
                        0,
                    )
                    const freqB = parseInt(
                      b['词频'] ||
                        b['频次'] ||
                        b['次数'] ||
                        b['frequency'] ||
                        0,
                    )
                    return freqB - freqA
                  })
                  .slice(0, 10) // 取前10个高频词汇

                if (relevantWords.length > 0) {
                  const key = `${category}-${subcategoryName}`
                  wordFrequencyInfo.子类别台词[key] = relevantWords.map(
                    (row) => {
                      const word =
                        row['关键词'] ||
                        row['词语'] ||
                        row['词汇'] ||
                        row['word'] ||
                        ''
                      const freq = parseInt(
                        row['词频'] ||
                          row['频次'] ||
                          row['次数'] ||
                          row['frequency'] ||
                          0,
                      )
                      return `${word}(${freq}次)`
                    },
                  )

                  // 统计信息
                  const totalFreq = relevantWords.reduce((sum, row) => {
                    return (
                      sum +
                      parseInt(
                        row['词频'] ||
                          row['频次'] ||
                          row['次数'] ||
                          row['frequency'] ||
                          0,
                      )
                    )
                  }, 0)

                  wordFrequencyInfo.台词统计[key] = {
                    词汇数: relevantWords.length,
                    总频次: totalFreq,
                    平均频次: Math.round(totalFreq / relevantWords.length),
                  }

                  console.log(
                    `✅ ${category}-${subcategoryName}: ${relevantWords.length}个词汇, 总频次${totalFreq}`,
                  )
                } else {
                  // 如果没有找到相关词汇，使用空数据
                  const key = `${category}-${subcategoryName}`
                  wordFrequencyInfo.子类别台词[key] = []
                  wordFrequencyInfo.台词统计[key] = {
                    词汇数: 0,
                    总频次: 0,
                    平均频次: 0,
                  }
                  console.log(
                    `⚠️ ${category}-${subcategoryName}: 未找到相关词汇`,
                  )
                }
              },
            )
          }
        }
      })

      // 缓存数据
      setWordFrequencyData((prev) => ({
        ...prev,
        [movieName]: wordFrequencyInfo,
      }))

      console.log('✅ 词频数据处理完成:', movieName)
      console.log('📊 处理结果统计:', {
        类别数: Object.keys(wordFrequencyInfo.所有类别数据).length,
        子类别数: Object.keys(wordFrequencyInfo.子类别台词).length,
        统计数: Object.keys(wordFrequencyInfo.台词统计).length,
      })

      return wordFrequencyInfo
    } catch (error) {
      console.error('❌ 词频文件读取失败:', movieName, error)
      return null
    }
  }

  // 处理数据点悬浮显示数据面板
  const handleDataPointEnter = async (movieData, subcategoryPoint, event) => {
    console.log('🎯 数据点悬浮进入:', { movieData, subcategoryPoint })

    // 清除之前的隐藏定时器
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
      setHoverTimeout(null)
    }

    // 记录鼠标进入时的坐标
    const mouseX = event.clientX
    const mouseY = event.clientY
    setRecordedMousePos({ x: mouseX, y: mouseY })
    console.log('📍 记录鼠标坐标:', { x: mouseX, y: mouseY })

    const movieName = movieData?.['电影名'] || movieData?.['电影'] || '未知电影'

    // 加载词频数据
    const wordFreqData = await loadWordFrequencyFile(movieName)

    // 设置悬浮的电影数据
    setHoveredMovieData({
      电影名: movieName,
      上映年份: movieData?.['上映年份'] || '未知',
      子类别数据: movieData?.['子类别数据'] || {},
      词频数据: wordFreqData,
      当前类别: activeCategory,
      悬浮子类别: subcategoryPoint?.子类别 || '未知',
      悬浮数值: subcategoryPoint?.数值 || 0,
    })

    // 设置面板位置
    const rect = event.target.getBoundingClientRect()
    setPanelPosition({
      x: rect.right + 10,
      y: rect.top - 50,
    })

    setShowDataPanel(true)

    // 调用原有的背景切换逻辑
    if (handleDataPointHover) {
      handleDataPointHover(movieData, 0)
    }
  }

  // 处理数据点悬浮离开
  const handleDataPointLeave = () => {
    console.log('🎯 数据点悬浮离开')

    // 清除之前的定时器
    if (hoverTimeout) {
      clearTimeout(hoverTimeout)
    }

    // 设置延迟隐藏，防止快速移动鼠标时出现闪烁
    const timeoutId = setTimeout(() => {
      setShowDataPanel(false)
      setHoveredMovieData(null)
      setIsHovering(false)
      setBackgroundKey((prev) => prev + 1)
      setHoverTimeout(null)
    }, 50) // 50ms延迟

    setHoverTimeout(timeoutId)
  }

  // 处理数据点点击跳转
  const handleDataPointClick = (movieData, subcategoryPoint) => {
    const movieName = movieData?.['电影名'] || movieData?.['电影'] || '未知电影'
    // 尝试多种可能的序号字段
    const movieIndex =
      movieData?.['原始序号'] ||
      movieData?.['序号'] ||
      movieData?.['index'] ||
      movieData?.['电影ID'] ||
      0
    console.log('🎬 点击数据点跳转到电影详情:', {
      movieName,
      movieIndex,
      movieData,
    })

    // 使用电影名称作为路由参数，同时添加id参数
    const encodedMovieName = encodeURIComponent(movieName)
    navigate(`/movie/${encodedMovieName}?id=${movieIndex}`)
  }

  // 台词数据缓存
  const [dialogueData, setDialogueData] = useState({})

  // 读取首页台词显示Excel文件
  const loadDialogueData = async () => {
    console.log('📖 读取台词数据文件...')

    try {
      const response = await fetch('/首页台词显示.xlsx')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      console.log('📋 台词文件工作表列表:', workbook.SheetNames)

      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      console.log(`📊 台词数据条数: ${jsonData.length}`)

      // 处理数据，建立电影名称到台词的映射
      const dialogueMap = {}

      // 第一行是子类别名称，从第二行开始是电影数据
      const movieRows = jsonData.slice(1).filter((row) => row['电影名'])

      movieRows.forEach((row, index) => {
        const movieName = row['电影名']
        if (!movieName) return

        console.log(`🎬 处理电影: ${movieName}`)

        // 构建子类别台词映射
        const movieDialogues = {
          门派: {
            正统门派: row['门派'] || '',
            玄门别派: row['__EMPTY'] || '',
            江湖民间: row['__EMPTY_1'] || '',
            官府朝廷: row['__EMPTY_2'] || '',
          },
          精神: {
            仁: row['精神'] || '',
            义: row['__EMPTY_3'] || '',
            信: row['__EMPTY_4'] || '',
          },
          武功: {
            内功心法: row['武功'] || '',
            武器技法: row['__EMPTY_5'] || '',
            拳脚搏击: row['__EMPTY_6'] || '',
            奇门异术: row['__EMPTY_7'] || '',
          },
        }

        dialogueMap[movieName] = movieDialogues

        // 输出调试信息
        console.log(`📝 ${movieName} 台词数据:`)
        Object.entries(movieDialogues).forEach(([category, subcats]) => {
          Object.entries(subcats).forEach(([subcat, dialogue]) => {
            if (
              dialogue &&
              dialogue !== '0' &&
              dialogue.toString().trim() !== ''
            ) {
              console.log(`  ${category}-${subcat}: "${dialogue}"`)
            }
          })
        })
      })

      console.log(
        `✅ 台词数据处理完成，共 ${Object.keys(dialogueMap).length} 部电影`,
      )
      setDialogueData(dialogueMap)
      return dialogueMap
    } catch (error) {
      console.error('❌ 台词数据读取失败:', error)
      return {}
    }
  }

  // 根据电影名称、类别和子类别获取台词
  const getMovieQuote = (movieName, category = null, subcategory = null) => {
    console.log('🎭 获取电影台词:', { movieName, category, subcategory })

    // 如果有台词数据
    if (dialogueData[movieName]) {
      const movieDialogues = dialogueData[movieName]

      // 如果指定了类别和子类别，返回对应台词
      if (
        category &&
        subcategory &&
        movieDialogues[category] &&
        movieDialogues[category][subcategory]
      ) {
        const dialogue = movieDialogues[category][subcategory]
        if (dialogue && dialogue !== '0' && dialogue.toString().trim() !== '') {
          console.log(`✅ 找到指定台词: ${category}-${subcategory}`)
          return `"${dialogue}"`
        }
      }

      // 如果没有指定或指定的台词为空，寻找该电影的任意有效台词
      const allDialogues = []
      Object.entries(movieDialogues).forEach(([cat, subcats]) => {
        Object.entries(subcats).forEach(([subcat, dialogue]) => {
          if (
            dialogue &&
            dialogue !== '0' &&
            dialogue.toString().trim() !== ''
          ) {
            allDialogues.push({
              category: cat,
              subcategory: subcat,
              dialogue: dialogue,
              priority:
                cat === category
                  ? 2
                  : subcategory && subcat === subcategory
                  ? 1
                  : 0,
            })
          }
        })
      })

      if (allDialogues.length > 0) {
        // 按优先级排序，优先返回当前类别的台词
        allDialogues.sort((a, b) => b.priority - a.priority)
        const selectedDialogue = allDialogues[0]
        console.log(
          `✅ 找到台词: ${selectedDialogue.category}-${selectedDialogue.subcategory}`,
        )
        return `"${selectedDialogue.dialogue}"`
      }
    }

    // 备用台词
    const fallbackQuotes = {
      六指琴魔: '"琴魔你为了独霸武林就滥杀无辜"',
      倩女幽魂: '"人鬼情未了，此恨绵绵无绝期"',
      东邪西毒: '"任何人都可以变得狠毒，只要你尝试过什么叫嫉妒"',
      新龙门客栈: '"刀不是好刀，人却是好人"',
      笑傲江湖: '"有人的地方就有恩怨，有恩怨就有江湖"',
      卧虎藏龙: '"真正的武功，是心中的宁静"',
      英雄: '"剑的最高境界就是无剑"',
    }

    console.log('⚠️ 使用备用台词')
    return fallbackQuotes[movieName] || `"${movieName}，江湖传奇永不落幕"`
  }

  // 为每条虚线生成子类别数据点
  const generateSubcategoryDataPoints = (movieItem, category) => {
    console.log('🔢 为电影生成子类别数据点:', {
      电影: movieItem?.['电影名'],
      类别: category,
    })

    // 获取当前类别的子类别配置
    const categoryConfig = categorySubcategoryMap[category]
    if (!categoryConfig || !categoryConfig.subcategories) {
      console.log('⚠️ 未找到类别配置')
      return []
    }

    const subcategories = Object.entries(categoryConfig.subcategories).sort(
      ([, a], [, b]) => a.index - b.index,
    ) // 按索引排序

    console.log(
      `📊 ${category}类别子类别:`,
      subcategories.map(([name, info]) => `${name}(${info.index})`),
    )

    // 为每个子类别创建数据点，但只显示有数值的数据点
    const dataPoints = subcategories
      .map(([subcategoryName, subcategoryInfo], index) => {
        // 尝试从电影的子类别数据中获取数值
        let value = 0
        if (
          movieItem?.['子类别数据'] &&
          movieItem['子类别数据'][subcategoryName] !== undefined
        ) {
          value = parseInt(movieItem['子类别数据'][subcategoryName]) || 0
        }

        return {
          电影名: movieItem?.['电影名'] || '未知电影',
          上映年份: movieItem?.['上映年份'] || '未知',
          子类别: subcategoryName,
          子类别索引: subcategoryInfo.index,
          子类别描述: subcategoryInfo.description,
          子类别颜色: subcategoryInfo.color,
          数值: value,
          原始电影数据: movieItem,
          显示: value > 0, // 只有数值大于0才显示
        }
      })
      .filter((point) => point.显示) // 过滤掉数值为0的数据点

    console.log(
      `✅ 生成了 ${dataPoints.length} 个有效数据点（过滤掉了${
        subcategories.length - dataPoints.length
      }个零值数据点）`,
    )
    return dataPoints
  }

  // 根据当前类别的子类别数量限制显示的数据 - 修改为不限制数量，显示所有有效数据
  const getLimitedDataBySubcategories = (segmentData, category) => {
    console.log('🔢 处理分段数据显示:', {
      类别: category,
      原始数据长度: segmentData.length,
    })

    // 不再限制数据数量，返回所有数据让每部电影显示其有效的子类别数据点
    console.log(
      `✅ 返回所有 ${segmentData.length} 条数据，每条数据将显示其有效的子类别数据点`,
    )

    return segmentData
  }

  // 根据子类别数据生成数据点样式
  const getDataPointStyle = (item, category, baseSize = 0.75) => {
    console.log('🎨 生成数据点样式:', {
      电影: item?.['电影名'] || '未知',
      类别: category,
      基础尺寸: baseSize,
      原始数据存在: !!item?.原始数据,
    })

    // 安全检查：确保有基本数据
    if (!item) {
      console.log('⚠️ 数据项为空，使用默认样式')
      return getDefaultDataPointStyle(baseSize)
    }

    // 尝试获取子类别信息
    const subcategoryInfo = getMovieSubcategoryFromData(item, category)

    if (!subcategoryInfo) {
      console.log('⚠️ 无子类别信息，尝试基于电影名称匹配')
      const movieName = item?.['电影名'] || item?.['电影'] || '未知电影'
      const fallbackInfo = getMovieSubcategory(movieName, category)

      if (fallbackInfo) {
        console.log('✅ 找到备用子类别信息:', fallbackInfo.name)
        return generateStyleFromSubcategory(fallbackInfo, baseSize, 50) // 使用默认数值50
      }

      console.log('⚠️ 完全无法确定子类别，使用增强默认样式')
      return getEnhancedDefaultStyle(item, category, baseSize)
    }

    // 根据子类别信息生成样式
    return generateStyleFromSubcategory(
      subcategoryInfo,
      baseSize,
      subcategoryInfo.value,
    )
  }

  // 默认数据点样式
  const getDefaultDataPointStyle = (baseSize) => {
    return {
      width: `${baseSize}rem`,
      height: `${baseSize}rem`,
      background: 'transparent',
      border: '0.125rem solid #E1D7D4',
      borderRadius: '50%',
      opacity: 0.6,
      boxShadow: '0 0 0.25rem rgba(225, 215, 212, 0.3)',
    }
  }

  // 增强的默认样式（基于类别）
  const getEnhancedDefaultStyle = (item, category, baseSize) => {
    // 根据类别使用不同的默认颜色
    const categoryColors = {
      门派: '#CD853F',
      精神: '#4682B4',
      武功: '#DC143C',
    }

    const defaultColor = categoryColors[category] || '#E1D7D4'
    const movieName = item?.['电影名'] || item?.['电影'] || '未知电影'

    // 基于电影名称哈希生成一些变化
    const nameHash = movieName
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const sizeVariation = 0.8 + (nameHash % 5) * 0.1 // 0.8-1.2倍变化
    const actualSize = Math.round(baseSize * sizeVariation)

    console.log('🎨 使用增强默认样式:', {
      电影: movieName,
      类别: category,
      默认颜色: defaultColor,
      尺寸变化: sizeVariation,
      实际尺寸: actualSize,
    })

    return {
      width: `${actualSize}px`,
      height: `${actualSize}px`,
      background: 'transparent',
      border: `0.125rem solid ${defaultColor}`,
      borderRadius: '50%',
      opacity: 0.7,
      boxShadow: `0 0 ${Math.round(actualSize * 0.3)}px ${defaultColor}30`,
    }
  }

  // 根据子类别信息生成样式
  const generateStyleFromSubcategory = (subcategoryInfo, baseSize, value) => {
    const movieName = subcategoryInfo.movieName || '未知电影'
    const actualValue = value || 0

    // 动态计算最大值（基于当前数据）
    const maxValue = Math.max(500, actualValue * 2) // 至少500，或者当前值的2倍

    // 根据数值大小调整尺寸 (0.6-1.8倍)
    const sizeMultiplier = Math.max(
      0.6,
      Math.min(1.8, (actualValue / maxValue) * 2 + 0.6),
    )
    const actualSize = Math.round(baseSize * sizeMultiplier)

    // 根据数值大小调整透明度 (0.4-1.0)
    const opacity = Math.max(0.4, Math.min(1.0, actualValue / maxValue + 0.4))

    // 根据子类别颜色设置边框
    const borderColor = subcategoryInfo.color || '#E1D7D4'

    // 数值较高时使用实心圆点
    const threshold = maxValue * 0.6
    const isSolid = actualValue > threshold

    // 计算发光效果强度
    const glowIntensity = Math.round(actualSize * 0.4)

    console.log('🎨 子类别样式计算:', {
      电影: movieName,
      子类别: subcategoryInfo.name,
      数值: actualValue,
      最大值: maxValue,
      尺寸倍数: sizeMultiplier,
      实际尺寸: actualSize,
      透明度: opacity,
      边框颜色: borderColor,
      是否实心: isSolid,
      发光强度: glowIntensity,
    })

    return {
      width: `${actualSize}px`,
      height: `${actualSize}px`,
      background: isSolid ? borderColor : 'transparent',
      border: `0.125rem solid ${borderColor}`,
      borderRadius: '50%',
      opacity: opacity,
      boxShadow: `0 0 ${glowIntensity}px ${borderColor}40`,
      transition: 'all 0.3s ease',
    }
  }

  // 根据数据点映射背景图片 - 简化版本
  const handleDataPointHover = (item, index) => {
    console.log('🚀 handleDataPointHover被调用:', { item, index })
    console.log('🔄 当前背景状态:', currentBackground)

    // 安全检查：确保item存在
    if (!item) {
      console.warn('⚠️ 数据项为空，无法处理悬浮事件')
      return
    }

    const movieName = item?.['电影名'] || item?.['电影'] || `数据${index + 1}`
    console.log('📝 解析电影名称:', movieName)

    // 优先使用Excel数据确定子类别
    const subcategoryInfo = getMovieSubcategoryFromData(item, activeCategory)
    if (subcategoryInfo) {
      console.log('🏷️ 电影子类别信息（基于数据值）:', {
        电影: movieName,
        类别: activeCategory,
        子类别: subcategoryInfo.name,
        描述: subcategoryInfo.description,
        颜色: subcategoryInfo.color,
        数值: subcategoryInfo.value,
      })
    } else {
      // 备用方法：根据电影名称匹配
      const fallbackInfo = getMovieSubcategory(movieName, activeCategory)
      if (fallbackInfo) {
        console.log('🏷️ 电影子类别信息（备用匹配）:', {
          电影: movieName,
          类别: activeCategory,
          子类别: fallbackInfo.name,
          描述: fallbackInfo.description,
          颜色: fallbackInfo.color,
        })
      }
    }

    // 优先使用电影名称直接映射
    const backgroundImage = movieBackgroundMap[movieName]
    if (backgroundImage) {
      console.log(`🎬 电影"${movieName}" → 找到背景图片映射`)
      console.log('🔄 背景切换前:', currentBackground)
      console.log('🔄 将要切换到:', backgroundImage)

      // 强制刷新背景
      setIsHovering(true)
      setCurrentBackground(backgroundImage)
      setBackgroundKey((prev) => prev + 1)

      console.log('✅ 背景切换命令已发送，强制刷新触发')
      return
    }

    // 如果没有找到电影名称映射，使用备用策略
    console.log(`⚠️ 电影"${movieName}"未找到背景映射，使用备用策略`)

    // 备用策略1: 根据电影ID映射，但限制在有效范围内
    const movieId = item?.['电影ID'] || item?.['ID'] || item?.['id']
    if (movieId && movieId >= 1) {
      // 将电影ID映射到1-47范围内
      const mappedId = movieId > 47 ? ((movieId - 1) % 47) + 1 : movieId
      try {
        const fallbackImage = require(`../../assets/images/backgrounds/${mappedId}.png`)
        console.log(
          `🎬 电影"${movieName}" (ID:${movieId}→${mappedId}) → 使用备用背景图片`,
        )

        // 动态添加到映射表中，避免重复计算
        setMovieBackgroundMap((prev) => ({
          ...prev,
          [movieName]: fallbackImage,
        }))

        // 强制刷新背景
        setIsHovering(true)
        setCurrentBackground(fallbackImage)
        setBackgroundKey((prev) => prev + 1)

        console.log('✅ 背景切换命令已发送，并已添加到映射表，强制刷新触发')
        return
      } catch (error) {
        console.log(`❌ 备用图片${mappedId}.png加载失败`)
      }
    }

    // 备用策略2: 使用默认背景
    console.log(`🎬 电影"${movieName}" → 使用默认背景图片`)
    try {
      const defaultImage = require('../../assets/images/backgrounds/1.png')
      setCurrentBackground(defaultImage)
    } catch (error) {
      console.error('❌ 默认背景图片加载失败:', error)
      setCurrentBackground('/assets/images/backgrounds/1.png')
    }
  }

  // 读取Excel文件
  const loadExcelData = async () => {
    console.log('📂 开始读取Excel文件...')

    try {
      const response = await fetch('/需求/河流图总表.xlsx')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })

      console.log('📋 Excel工作表列表:', workbook.SheetNames)

      // 处理所有工作表的数据
      let allProcessedData = []

      for (const sheetName of workbook.SheetNames) {
        const worksheet = workbook.Sheets[sheetName]
        const sheetData = XLSX.utils.sheet_to_json(worksheet)

        console.log(`📄 工作表 "${sheetName}" 包含 ${sheetData.length} 条数据`)

        if (sheetData.length > 1) {
          // 至少需要子类别名行+数据行
          // 从工作表名称推断类别
          let category = '未分类'
          if (sheetName.includes('门派')) {
            category = '门派'
          } else if (sheetName.includes('精神')) {
            category = '精神'
          } else if (sheetName.includes('武功')) {
            category = '武功'
          }

          console.log(`📊 工作表 "${sheetName}" -> 类别: ${category}`)

          // Excel结构：第一行是子类别名称，第二行开始是数据
          const subcategoryRow = sheetData[0] // 子类别名行：正统门派、玄门别派等
          const dataRows = sheetData.slice(1) // 从第二行开始是真实数据

          console.log(`📋 子类别名行:`, subcategoryRow)
          console.log(`📊 数据行数: ${dataRows.length}`)

          // 动态建立字段名到子类别名的映射
          const fieldToSubcategoryMap = {}
          Object.keys(subcategoryRow).forEach((fieldName) => {
            const subcategoryName = subcategoryRow[fieldName]
            // 确保subcategoryName是字符串且不包含'结果'
            if (
              subcategoryName &&
              typeof subcategoryName === 'string' &&
              !subcategoryName.includes('结果')
            ) {
              fieldToSubcategoryMap[fieldName] = subcategoryName
              console.log(`📋 字段映射: ${fieldName} -> ${subcategoryName}`)
            }
          })

          const sheetProcessedData = dataRows
            .filter((item) => item['序号'] && item['电影名']) // 确保有有效数据
            .map((item, itemIndex) => {
              // 构建子类别数据映射
              const subcategoryData = {}

              // 使用动态映射建立子类别数据
              Object.entries(fieldToSubcategoryMap).forEach(
                ([fieldName, subcategoryName]) => {
                  subcategoryData[subcategoryName] = item[fieldName] || 0
                },
              )

              // 添加结果字段
              if (category === '门派') {
                subcategoryData['结果'] = item['__EMPTY_3'] || ''
              } else if (category === '精神') {
                subcategoryData['结果'] = item['__EMPTY_2'] || ''
              } else if (category === '武功') {
                subcategoryData['结果'] = item['__EMPTY_3'] || ''
              }

              console.log(`🎬 ${item['电影名']} 子类别数据:`, subcategoryData)

              return {
                电影ID: item['序号'] || Math.floor(Math.random() * 1000),
                电影名: item['电影名'] || '未知电影',
                上映年份: parseInt(item['上映年份']) || 2000,
                类别: category,
                数值: Math.random() * 100, // 临时数值，可能后续用子类别最大值
                原始序号:
                  item['序号'] || allProcessedData.length + itemIndex + 1,
                全局索引: allProcessedData.length + itemIndex,
                原始数据: item,
                子类别数据: subcategoryData,
              }
            })

          allProcessedData = allProcessedData.concat(sheetProcessedData)
          console.log(
            `✅ 工作表 "${sheetName}" 处理完成，添加了 ${sheetProcessedData.length} 条数据`,
          )

          // 输出前几条处理后的数据作为调试
          if (sheetProcessedData.length > 0) {
            console.log(`🔍 ${category}类别示例数据:`)
            console.log(sheetProcessedData[0])
          }
        }
      }

      console.log('🔄 数据预处理完成，按类别分组:')
      const categoryStats = {}
      allProcessedData.forEach((item) => {
        if (!categoryStats[item.类别]) {
          categoryStats[item.类别] = 0
        }
        categoryStats[item.类别]++
      })

      console.log('📊 各类别数据量:')
      Object.entries(categoryStats).forEach(([category, count]) => {
        console.log(`  ${category}: ${count}条`)
      })

      console.log('✅ 数据预处理完成，总计:', allProcessedData.length, '条数据')

      // 更新状态
      setExcelData(allProcessedData)
      setDataLoading(false)

      // 自动处理当前类别的数据
      if (allProcessedData.length > 0) {
        console.log('🚀 自动处理当前类别数据...')
        const filteredData = allProcessedData.filter(
          (item) => item.类别 === activeCategory,
        )
        console.log(
          `📊 ${activeCategory}类别筛选结果: ${filteredData.length}条数据`,
        )

        const sortedData = filteredData.sort((a, b) => a.上映年份 - b.上映年份)
        const segmentedData = segmentData(
          sortedData,
          segment1Percentage,
          segment2Percentage,
          segment3Percentage,
        )
        setSegmentedData(segmentedData)

        console.log(`✅ ${activeCategory}类别数据自动处理完成!`)
      }

      return allProcessedData
    } catch (error) {
      console.error('❌ Excel文件读取失败:', error)
      setDataError(error.message)
      setDataLoading(false)
      return []
    }
  }

  // 数据分段函数
  const segmentData = (data, seg1Percent, seg2Percent, seg3Percent) => {
    console.log('🔄 开始数据分段...')
    console.log('输入数据长度:', data.length)
    console.log('分段百分比:', {
      seg1: seg1Percent,
      seg2: seg2Percent,
      seg3: seg3Percent,
    })

    const totalCount = data.length
    const seg1Count = Math.round(totalCount * seg1Percent)
    const seg2Count = Math.round(totalCount * seg2Percent)
    const seg3Count = totalCount - seg1Count - seg2Count // 确保总数一致

    console.log('计算的数据分段:', {
      seg1Count,
      seg2Count,
      seg3Count,
      total: seg1Count + seg2Count + seg3Count,
    })

    const segment1 = data.slice(0, seg1Count)
    const segment2 = data.slice(seg1Count, seg1Count + seg2Count)
    const segment3 = data.slice(seg1Count + seg2Count)

    const result = {
      segment1: {
        data: segment1,
        count: segment1.length,
        percentage: seg1Percent,
      },
      segment2: {
        data: segment2,
        count: segment2.length,
        percentage: seg2Percent,
      },
      segment3: {
        data: segment3,
        count: segment3.length,
        percentage: seg3Percent,
      },
    }

    console.log('✅ 数据分段完成:', {
      第一段: result.segment1.count,
      第二段: result.segment2.count,
      第三段: result.segment3.count,
      总计:
        result.segment1.count + result.segment2.count + result.segment3.count,
    })

    return result
  }

  // 处理维度切换
  const handleCategoryChange = async (category) => {
    console.log(`🔄 切换到${category}类别...`)
    setActiveCategory(category)

    // 如果有数据，立即重新分段
    if (excelData.length > 0) {
      const filteredData = excelData.filter((item) => item.类别 === category)
      const sortedData = filteredData.sort((a, b) => a.上映年份 - b.上映年份)
      const newSegmentedData = segmentData(
        sortedData,
        segment1Percentage,
        segment2Percentage,
        segment3Percentage,
      )
      setSegmentedData(newSegmentedData)

      console.log(`✅ ${category}类别切换完成!`)
      console.log('数据分段:', {
        第一段: newSegmentedData.segment1.count,
        第二段: newSegmentedData.segment2.count,
        第三段: newSegmentedData.segment3.count,
      })

      // 根据新类别的第一条数据设置背景
      if (newSegmentedData?.segment1?.data?.length > 0) {
        const firstDataItem = newSegmentedData.segment1.data[0]
        const firstMovieName =
          firstDataItem?.['电影名'] || firstDataItem?.['电影'] || '倩女幽魂'

        console.log(`🎬 ${category}类别切换，根据第一条数据设置背景`)
        console.log('📝 第一条数据:', firstDataItem)
        console.log('🎭 第一部电影名称:', firstMovieName)

        // 查找对应的背景图片
        const firstMovieBackground = movieBackgroundMap[firstMovieName]
        if (firstMovieBackground) {
          console.log('🖼️ 找到第一部电影的背景图片:', firstMovieBackground)
          console.log('🔄 切换背景到第一部电影')
          setCurrentBackground(firstMovieBackground)
          setBackgroundKey((prev) => prev + 1)
          console.log(`✅ ${category}类别背景已设置为第一部电影的背景`)
        } else {
          console.log('⚠️ 未找到第一部电影的背景映射，保持当前背景')
        }
      }
    }
  }

  // 清理定时器的useEffect
  useEffect(() => {
    return () => {
      if (hoverTimeout) {
        clearTimeout(hoverTimeout)
      }
    }
  }, [hoverTimeout])

  // 全局鼠标移动监听，检测坐标变化和信息框区域
  useEffect(() => {
    const handleGlobalMouseMove = (e) => {
      if (showDataPanel) {
        // 检查鼠标坐标是否与记录的坐标不相等
        const currentX = e.clientX
        const currentY = e.clientY
        const tolerance = 5 // 允许5像素的容差，避免微小抖动

        if (
          Math.abs(currentX - recordedMousePos.x) > tolerance ||
          Math.abs(currentY - recordedMousePos.y) > tolerance
        ) {
          console.log('🎯 检测到鼠标坐标变化，关闭信息框')
          console.log('📍 记录坐标:', recordedMousePos, '当前坐标:', {
            x: currentX,
            y: currentY,
          })
          setShowDataPanel(false)
          setHoveredMovieData(null)
          if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            setHoverTimeout(null)
          }
          return
        }

        // 检查鼠标是否在信息框区域内（作为备用检测）
        if (dataPanelRef.current) {
          const rect = dataPanelRef.current.getBoundingClientRect()
          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            console.log('🎯 检测到鼠标移入信息框区域，关闭信息框')
            setShowDataPanel(false)
            setHoveredMovieData(null)
            if (hoverTimeout) {
              clearTimeout(hoverTimeout)
              setHoverTimeout(null)
            }
          }
        }
      }

      // 检查鼠标是否离开了整个窗口
      if (
        e.clientY <= 0 ||
        e.clientX <= 0 ||
        e.clientX >= window.innerWidth ||
        e.clientY >= window.innerHeight
      ) {
        console.log('🎯 检测到鼠标离开窗口，强制隐藏信息框')
        if (showDataPanel) {
          setShowDataPanel(false)
          setHoveredMovieData(null)
          if (hoverTimeout) {
            clearTimeout(hoverTimeout)
            setHoverTimeout(null)
          }
        }
      }
    }

    const handleGlobalMouseLeave = (e) => {
      console.log('🎯 检测到鼠标离开文档，强制隐藏信息框')
      if (showDataPanel) {
        setShowDataPanel(false)
        setHoveredMovieData(null)
        if (hoverTimeout) {
          clearTimeout(hoverTimeout)
          setHoverTimeout(null)
        }
      }
    }

    document.addEventListener('mousemove', handleGlobalMouseMove)
    document.addEventListener('mouseleave', handleGlobalMouseLeave)
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove)
      document.removeEventListener('mouseleave', handleGlobalMouseLeave)
    }
  }, [showDataPanel, hoverTimeout, recordedMousePos])

  // 初始化数据处理
  useEffect(() => {
    console.log('🚀 DashboardHome组件初始化开始...')

    // 输出完整的类别与子类别结构信息
    console.log('📋 ===== 类别与子类别索引结构 =====')
    const allCategoriesInfo = getAllCategoriesInfo()
    allCategoriesInfo.forEach((categoryInfo) => {
      console.log(`📂 类别: ${categoryInfo.name} (索引: ${categoryInfo.index})`)
      console.log(`   子类别数量: ${categoryInfo.subcategoryCount}`)
      categoryInfo.subcategories.forEach((sub) => {
        console.log(`   📋 ${sub.name} (索引: ${sub.index})`)
        console.log(`      描述: ${sub.description}`)
        console.log(`      颜色: ${sub.color}`)
        console.log(`      Excel键: ${sub.excelKey}`)
        console.log(`      电影数量: ${sub.movieCount}`)
      })
      console.log('   ---')
    })
    console.log('📋 ===== 结构信息输出完成 =====')

    // 读取Excel文件并处理数据
    const initData = async () => {
      try {
        // 并行加载数据和台词
        await Promise.all([loadExcelData(), loadDialogueData()])
        console.log('✅ 初始化完成')
      } catch (error) {
        console.error('❌ 初始化失败:', error)
        setDataError(error.message)
        setDataLoading(false)
      }
    }

    initData()
  }, [])

  // 监听百分比变化，重新计算数据分段
  useEffect(() => {
    if (excelData.length > 0) {
      console.log('📊 百分比发生变化，重新计算数据分段...')
      console.log('当前百分比:', {
        segment1: segment1Percentage,
        segment2: segment2Percentage,
        segment3: segment3Percentage,
      })

      // 重新过滤和分段当前类别的数据
      const filteredData = excelData.filter(
        (item) => item.类别 === activeCategory,
      )
      const sortedData = filteredData.sort((a, b) => a.上映年份 - b.上映年份)
      const newSegmentedData = segmentData(
        sortedData,
        segment1Percentage,
        segment2Percentage,
        segment3Percentage,
      )
      setSegmentedData(newSegmentedData)

      console.log('✅ 数据分段完成:', {
        第一段: newSegmentedData.segment1.count,
        第二段: newSegmentedData.segment2.count,
        第三段: newSegmentedData.segment3.count,
      })
    }
  }, [
    excelData,
    segment1Percentage,
    segment2Percentage,
    segment3Percentage,
    activeCategory,
  ])

  // 监听数据加载完成，根据第一条数据设置初始背景
  useEffect(() => {
    if (segmentedData?.segment1?.data?.length > 0) {
      const firstDataItem = segmentedData.segment1.data[0]
      const firstMovieName =
        firstDataItem?.['电影名'] || firstDataItem?.['电影'] || '倩女幽魂'

      console.log('🎬 数据加载完成，根据第一条数据设置背景')
      console.log('📝 第一条数据:', firstDataItem)
      console.log('🎭 第一部电影名称:', firstMovieName)

      // 查找对应的背景图片
      const firstMovieBackground = movieBackgroundMap[firstMovieName]
      if (firstMovieBackground) {
        console.log('🖼️ 找到第一部电影的背景图片:', firstMovieBackground)
        console.log('🔄 从默认背景切换到第一部电影背景')
        setCurrentBackground(firstMovieBackground)
        setBackgroundKey((prev) => prev + 1)
        console.log('✅ 初始背景已设置为第一部电影的背景')
      } else {
        console.log('⚠️ 未找到第一部电影的背景映射，保持默认背景')
        console.log(
          '🎬 可用的电影映射:',
          Object.keys(movieBackgroundMap).slice(0, 5).join(', '),
        )
      }
    }
  }, [segmentedData, movieBackgroundMap])

  // 监听背景状态变化
  useEffect(() => {
    console.log('🎨 背景状态发生变化:', currentBackground)

    // 添加一个简单的视觉验证：改变页面标题来确认状态更新
    if (currentBackground) {
      const imageName = currentBackground.split('/').pop().split('.')[0]
      document.title = `武侠电影可视化 - 背景: ${imageName}`
      console.log('📋 页面标题已更新为:', document.title)
    }
  }, [currentBackground])

  // 暴露调试函数到全局
  useEffect(() => {
    // 将测试函数暴露到全局，方便调试
    window.changePercentages = (seg1, seg2, seg3) => {
      console.log(`🔧 修改百分比: ${seg1 * 100}%/${seg2 * 100}%/${seg3 * 100}%`)
      setSegment1Percentage(seg1)
      setSegment2Percentage(seg2)
      setSegment3Percentage(seg3)
    }

    // 新增：根据索引切换类别
    window.switchCategoryByIndex = (index) => {
      if (isValidCategoryIndex(index)) {
        const categoryName = getCategoryByIndex(index)
        console.log(`🔄 根据索引 ${index} 切换到类别: ${categoryName}`)
        handleCategoryChange(categoryName)
      } else {
        console.log(
          `❌ 无效的类别索引: ${index}，有效范围: 0-${
            CATEGORY_ORDER.length - 1
          }`,
        )
      }
    }

    // 新增：测试台词数据
    window.testDialogueData = (
      movieName = '倩女幽魂',
      category = '门派',
      subcategory = '玄门别派',
    ) => {
      console.log(
        `🎭 测试台词数据: ${movieName} - ${category} - ${subcategory}`,
      )

      if (Object.keys(dialogueData).length === 0) {
        console.log('❌ 台词数据未加载，请等待加载完成')
        return
      }

      console.log('📚 已加载的电影台词数据:')
      Object.keys(dialogueData)
        .slice(0, 5)
        .forEach((name) => {
          console.log(`  - ${name}`)
        })

      const quote = getMovieQuote(movieName, category, subcategory)
      console.log(`✅ 获取到的台词: ${quote}`)

      if (dialogueData[movieName]) {
        console.log(`📝 ${movieName} 的所有台词:`)
        Object.entries(dialogueData[movieName]).forEach(([cat, subcats]) => {
          console.log(`  ${cat}:`)
          Object.entries(subcats).forEach(([subcat, dialogue]) => {
            if (
              dialogue &&
              dialogue !== '0' &&
              dialogue.toString().trim() !== ''
            ) {
              console.log(`    ${subcat}: "${dialogue}"`)
            }
          })
        })
      }

      return {
        movieName,
        category,
        subcategory,
        quote,
        allData: dialogueData[movieName],
      }
    }

    // 新增：显示索引结构信息
    window.checkSubcategoryCount = (category) => {
      const categoryConfig = categorySubcategoryMap[category || activeCategory]
      if (!categoryConfig) {
        console.log('❌ 未找到类别配置:', category || activeCategory)
        return
      }

      const subcategories = Object.keys(categoryConfig.subcategories)
      console.log(
        `📊 ${category || activeCategory}类别子类别数量: ${
          subcategories.length
        }`,
      )
      console.log('📋 子类别列表:', subcategories)

      // 显示当前分段数据长度
      if (segmentedData) {
        console.log('📈 当前分段数据长度:')
        console.log(`  第一段: ${segmentedData.segment1.data.length}`)
        console.log(`  第二段: ${segmentedData.segment2.data.length}`)
        console.log(`  第三段: ${segmentedData.segment3.data.length}`)

        console.log('✂️ 限制后显示数量:')
        console.log(
          `  第一段: ${Math.min(
            segmentedData.segment1.data.length,
            subcategories.length,
          )}`,
        )
        console.log(
          `  第二段: ${Math.min(
            segmentedData.segment2.data.length,
            subcategories.length,
          )}`,
        )
        console.log(
          `  第三段: ${Math.min(
            segmentedData.segment3.data.length,
            subcategories.length,
          )}`,
        )
      }
    }

    window.showIndexStructure = () => {
      console.log('📋 ===== 完整索引结构 =====')
      console.log('📂 类别索引常量:', CATEGORY_INDICES)
      console.log('📂 类别顺序:', CATEGORY_ORDER)
      console.log('📋 子类别索引常量:', SUBCATEGORY_INDICES)
      console.log('📋 ===== 详细结构信息 =====')
      getAllCategoriesInfo().forEach((cat) => {
        console.log(`📂 ${cat.name} (索引: ${cat.index})`)
        cat.subcategories.forEach((sub) => {
          console.log(
            `   📋 ${sub.name} (索引: ${sub.index}, Excel: ${sub.excelKey})`,
          )
        })
      })
      console.log('📋 ===== 结构信息完成 =====')
    }

    // 新增：根据索引获取子类别信息
    window.getSubcategoryInfoByIndex = (category, index) => {
      const subcategoryName = getSubcategoryByIndex(category, index)
      if (subcategoryName) {
        const categoryConfig = categorySubcategoryMap[category]
        const subcategoryInfo = categoryConfig.subcategories[subcategoryName]
        console.log(`📋 ${category} - ${subcategoryName} (索引: ${index})`)
        console.log(`   描述: ${subcategoryInfo.description}`)
        console.log(`   颜色: ${subcategoryInfo.color}`)
        console.log(`   Excel键: ${subcategoryInfo.excelKey}`)
        console.log(`   电影: ${subcategoryInfo.movies.join(', ')}`)
        return subcategoryInfo
      } else {
        console.log(`❌ 未找到子类别，类别: ${category}, 索引: ${index}`)
        return null
      }
    }

    window.showMovieMapping = () => {
      console.log('🎬 当前电影名称映射表:')
      Object.entries(movieBackgroundMap).forEach(([name, imagePath]) => {
        const status = imagePath ? '✅ 已加载' : '❌ 未加载'
        console.log(`  "${name}" → ${status}`)
      })
      console.log(
        `📊 总计: ${Object.keys(movieBackgroundMap).length} 个电影映射`,
      )
      console.log(
        `✅ 成功映射: ${
          Object.values(movieBackgroundMap).filter(Boolean).length
        } 个`,
      )
    }

    window.testBackgroundSwitch = (movieName = '倩女幽魂') => {
      console.log(`🧪 测试背景切换到电影: ${movieName}`)
      if (movieBackgroundMap[movieName]) {
        console.log('🔄 当前背景:', currentBackground)
        console.log('🔄 切换到:', movieBackgroundMap[movieName])
        setCurrentBackground(movieBackgroundMap[movieName])
        console.log('✅ 背景切换命令已发送')
      } else {
        console.log('❌ 电影映射不存在:', movieName)
        console.log(
          '🎬 可用的电影名称:',
          Object.keys(movieBackgroundMap).slice(0, 10).join(', '),
          '...',
        )
      }
    }

    // 显示子类别映射信息
    window.showSubcategories = (category = activeCategory) => {
      console.log(`🗂️ ${category}类别的子类别信息:`)
      const subcategories = getCategorySubcategories(category)
      subcategories.forEach((sub) => {
        console.log(`📋 ${sub.name}:`)
        console.log(`  描述: ${sub.description}`)
        console.log(`  颜色: ${sub.color}`)
        console.log(`  电影数量: ${sub.movieCount}`)
        console.log(`  电影列表: ${sub.movies.join(', ')}`)
        console.log('---')
      })
    }

    // 查找电影的子类别
    window.findMovieSubcategory = (movieName, category = activeCategory) => {
      console.log(`🔍 查找电影 "${movieName}" 在 "${category}" 类别下的子类别:`)
      const subcategoryInfo = getMovieSubcategory(movieName, category)
      if (subcategoryInfo) {
        console.log(`✅ 找到子类别: ${subcategoryInfo.name}`)
        console.log(`📝 描述: ${subcategoryInfo.description}`)
        console.log(`🎨 颜色: ${subcategoryInfo.color}`)
        console.log(`🎬 同类电影: ${subcategoryInfo.movies.join(', ')}`)
      } else {
        console.log(`❌ 未找到 "${movieName}" 的子类别`)
      }
    }

    // 分析电影的数据值子类别
    window.analyzeMovieData = (movieIndex = 0, category = activeCategory) => {
      console.log(
        `📊 分析电影数据值子类别 (索引: ${movieIndex}, 类别: ${category}):`,
      )

      if (
        !segmentedData ||
        !segmentedData.segment1 ||
        !segmentedData.segment1.data
      ) {
        console.log('❌ 没有可用的分段数据')
        return
      }

      const allData = [
        ...(segmentedData.segment1.data || []),
        ...(segmentedData.segment2.data || []),
        ...(segmentedData.segment3.data || []),
      ]

      if (movieIndex >= allData.length) {
        console.log(`❌ 索引超出范围，最大索引: ${allData.length - 1}`)
        return
      }

      const item = allData[movieIndex]
      const movieName =
        item?.['电影名'] || item?.['电影'] || `电影${movieIndex}`

      console.log(`🎬 分析电影: ${movieName}`)
      console.log(`📋 数据项完整结构:`, item)
      console.log(`📋 原始数据:`, item.原始数据)

      const subcategoryInfo = getMovieSubcategoryFromData(item, category)
      if (subcategoryInfo) {
        console.log(
          `✅ 主导子类别: ${subcategoryInfo.name} (索引: ${subcategoryInfo.index})`,
        )
        console.log(`📝 描述: ${subcategoryInfo.description}`)
        console.log(`🎨 颜色: ${subcategoryInfo.color}`)
        console.log(`📊 数值: ${subcategoryInfo.value}`)
        console.log(`🔑 Excel键: ${subcategoryInfo.excelKey}`)
        console.log(`📂 类别索引: ${subcategoryInfo.categoryIndex}`)
        console.log(`📊 所有数值:`, subcategoryInfo.allValues)

        // 显示数据点样式
        const style = getDataPointStyle(item, category, 16)
        console.log(`🎨 生成的数据点样式:`, style)
      } else {
        console.log('❌ 无法确定子类别')

        // 显示默认样式
        const defaultStyle = getDataPointStyle(item, category, 16)
        console.log(`🎨 默认数据点样式:`, defaultStyle)
      }

      return { item, subcategoryInfo }
    }

    // 新增：分析所有电影数据
    window.analyzeAllMovies = (category = activeCategory) => {
      console.log(`📊 分析所有电影数据 (类别: ${category}):`)

      if (
        !segmentedData ||
        !segmentedData.segment1 ||
        !segmentedData.segment1.data
      ) {
        console.log('❌ 没有可用的分段数据')
        return
      }

      const allData = [
        ...(segmentedData.segment1.data || []),
        ...(segmentedData.segment2.data || []),
        ...(segmentedData.segment3.data || []),
      ]

      console.log(`📊 总计 ${allData.length} 部电影`)

      const results = allData.map((item, index) => {
        const movieName = item?.['电影名'] || item?.['电影'] || `电影${index}`
        const subcategoryInfo = getMovieSubcategoryFromData(item, category)

        return {
          索引: index,
          电影: movieName,
          年份: item?.['上映年份'],
          子类别: subcategoryInfo?.name || '未确定',
          数值: subcategoryInfo?.value || 0,
          颜色: subcategoryInfo?.color || '#E1D7D4',
        }
      })

      console.log('📊 分析结果:')
      console.table(results)

      // 统计子类别分布
      const subcategoryStats = {}
      results.forEach((result) => {
        const subcat = result.子类别
        if (!subcategoryStats[subcat]) {
          subcategoryStats[subcat] = 0
        }
        subcategoryStats[subcat]++
      })

      console.log('📊 子类别分布:')
      console.table(subcategoryStats)

      return results
    }

    // 新增：测试数据点渲染
    window.testDataPointRendering = (
      movieIndex = 0,
      category = activeCategory,
    ) => {
      console.log(`🧪 测试数据点渲染 (索引: ${movieIndex}, 类别: ${category}):`)

      const analysisResult = window.analyzeMovieData(movieIndex, category)
      if (analysisResult) {
        const { item } = analysisResult

        // 测试不同尺寸的样式
        const sizes = [12, 14, 16]
        sizes.forEach((size) => {
          const style = getDataPointStyle(item, category, size)
          console.log(`🎨 尺寸 ${size}px 样式:`, style)
        })
      }
    }

    // 新增：检查Excel数据结构
    window.checkExcelStructure = () => {
      console.log('📋 检查Excel数据结构:')

      if (!excelData || excelData.length === 0) {
        console.log('❌ 没有Excel数据')
        return
      }

      console.log(`📊 总数据量: ${excelData.length}`)

      // 检查第一条数据的结构
      const firstItem = excelData[0]
      console.log('📋 第一条数据结构:')
      console.log('  数据项字段:', Object.keys(firstItem))
      if (firstItem.原始数据) {
        console.log('  原始数据字段:', Object.keys(firstItem.原始数据))
        console.log('  原始数据示例:', firstItem.原始数据)
      }

      // 按类别统计
      const categoryStats = {}
      excelData.forEach((item) => {
        const category = item.类别 || '未分类'
        if (!categoryStats[category]) {
          categoryStats[category] = 0
        }
        categoryStats[category]++
      })

      console.log('📊 类别统计:')
      console.table(categoryStats)

      return { excelData, firstItem, categoryStats }
    }

    // 测试所有电影的数据点样式
    window.testAllDataPointStyles = (category = activeCategory) => {
      console.log(`🎨 测试所有电影的数据点样式 (类别: ${category}):`)

      if (
        !segmentedData ||
        !segmentedData.segment1 ||
        !segmentedData.segment1.data
      ) {
        console.log('❌ 没有可用的分段数据')
        return
      }

      const allData = [
        ...(segmentedData.segment1.data || []),
        ...(segmentedData.segment2.data || []),
        ...(segmentedData.segment3.data || []),
      ]

      console.log(`📊 总计 ${allData.length} 部电影:`)

      allData.forEach((item, index) => {
        const movieName = item?.['电影名'] || item?.['电影'] || `电影${index}`
        const subcategoryInfo = getMovieSubcategoryFromData(item, category)
        const pointStyle = getDataPointStyle(item, category, 16)

        console.log(`${index + 1}. ${movieName}:`)
        if (subcategoryInfo) {
          console.log(
            `   子类别: ${subcategoryInfo.name} (${subcategoryInfo.value})`,
          )
          console.log(
            `   样式: ${pointStyle.width} ${pointStyle.border} ${
              pointStyle.background === 'transparent' ? '空心' : '实心'
            }`,
          )
        } else {
          console.log(`   子类别: 未识别`)
          console.log(`   样式: 默认`)
        }
      })
    }

    console.log('🎮 测试函数已暴露:')
    console.log('  - window.changePercentages(seg1, seg2, seg3) // 修改百分比')
    console.log('  - window.showMovieMapping() // 显示电影映射表')
    console.log('  - window.testBackgroundSwitch(movieName) // 测试背景切换')
    console.log('  - window.showSubcategories(category) // 显示类别子类别信息')
    console.log(
      '  - window.findMovieSubcategory(movieName, category) // 查找电影子类别',
    )
    console.log(
      '  - window.analyzeMovieData(movieIndex, category) // 分析电影数据值',
    )
    console.log(
      '  - window.testAllDataPointStyles(category) // 测试所有数据点样式',
    )
    console.log(
      '  - window.testDialogueData(movieName, category, subcategory) // 测试台词数据',
    )
    console.log('📝 例如: changePercentages(0.1, 0.2, 0.7) 设置为 10%/20%/70%')
    console.log(
      '📝 例如: testBackgroundSwitch("黄飞鸿") 切换到黄飞鸿的背景图片',
    )
    console.log('📝 例如: showSubcategories("门派") 显示门派的所有子类别')
    console.log(
      '📝 例如: findMovieSubcategory("黄飞鸿", "门派") 查找黄飞鸿属于哪个门派',
    )
    console.log('📝 例如: analyzeMovieData(0, "门派") 分析第一部电影的门派数据')
    console.log(
      '📝 例如: testAllDataPointStyles("门派") 测试所有电影的数据点样式',
    )
    console.log(
      '📝 例如: testDialogueData("倩女幽魂", "门派", "玄门别派") 测试台词获取',
    )
  }, [])

  // 测试强制刷新功能
  const testForceRefresh = () => {
    console.log('🧪 测试强制刷新功能')
    setIsHovering(true)
    setBackgroundKey((prev) => prev + 1)
    console.log('🔄 强制刷新已触发，backgroundKey:', backgroundKey + 1)

    // 3秒后重置状态
    setTimeout(() => {
      setIsHovering(false)
      console.log('🔄 重置悬浮状态')
    }, 3000)
  }

  // 暴露测试函数到全局
  React.useEffect(() => {
    window.testForceRefresh = testForceRefresh
    console.log('🧪 强制刷新测试函数已暴露: window.testForceRefresh()')
  }, [])

  return (
    <>
      <GlobalStyle />
      <DashboardContainer
        key={`background-${backgroundKey}`}
        $backgroundUrl={currentBackground}
        $isHovering={isHovering}
      >
        <MainContent>
          {/* 头部区域 */}
          <HeaderArea>
            {/* 左侧标题区域 */}
            <div
              style={{
                position: 'absolute',
                left: '3vw',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <img
                src="/assets/images/首页标题.png"
                alt="江湖词锋 - 图解47部经典武侠电影的全球流境"
                style={{
                  height: 'clamp(4rem, 8vh, 7rem)',
                  width: 'auto',
                  objectFit: 'contain',
                }}
              />
            </div>

            {/* 左侧装饰线条 */}
            <div
              style={{
                position: 'absolute',
                left: '16vw',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '22vw',
                height: '0.125rem',
                background: '#999999',
                opacity: 1,
              }}
            ></div>

            {/* 居中控制区域 */}
            <div
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5vh',
              }}
            >
              <span
                style={{
                  fontFamily: 'AaGuDianKeBenSong, serif',
                  fontSize: 'clamp(0.8rem, 1.1vw, 1rem)',
                  color: '#696969',
                  letterSpacing: '0.1em',
                }}
              >
                点击切换维度，解析江湖密码
              </span>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2vw',
                }}
              >
                {/* 门派按钮 */}
                <div
                  onClick={() => handleCategoryChange('门派')}
                  onMouseEnter={(e) => {
                    if (activeCategory !== '门派') {
                      e.currentTarget.style.backgroundImage =
                        'url(/assets/images/buttons/门派悬浮或点击选中.png)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== '门派') {
                      e.currentTarget.style.backgroundImage =
                        'url(/assets/images/buttons/门派未选中.png)'
                    }
                  }}
                  style={{
                    width: 'clamp(2.5rem, 4vw, 3.5rem)',
                    height: 'clamp(1.2rem, 2vw, 1.8rem)',
                    backgroundImage:
                      activeCategory === '门派'
                        ? 'url(/assets/images/buttons/门派悬浮或点击选中.png)'
                        : 'url(/assets/images/buttons/门派未选中.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                ></div>

                {/* 精神按钮 */}
                <div
                  onClick={() => handleCategoryChange('精神')}
                  onMouseEnter={(e) => {
                    if (activeCategory !== '精神') {
                      e.currentTarget.style.backgroundImage =
                        'url(/assets/images/buttons/精神悬浮或点击选中.png)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== '精神') {
                      e.currentTarget.style.backgroundImage =
                        'url(/assets/images/buttons/精神未选中.png)'
                    }
                  }}
                  style={{
                    width: 'clamp(2.5rem, 4vw, 3.5rem)',
                    height: 'clamp(1.2rem, 2vw, 1.8rem)',
                    backgroundImage:
                      activeCategory === '精神'
                        ? 'url(/assets/images/buttons/精神悬浮或点击选中.png)'
                        : 'url(/assets/images/buttons/精神未选中.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                ></div>

                {/* 武功按钮 */}
                <div
                  onClick={() => handleCategoryChange('武功')}
                  onMouseEnter={(e) => {
                    if (activeCategory !== '武功') {
                      e.currentTarget.style.backgroundImage =
                        'url(/assets/images/buttons/武功悬浮或点击选中.png)'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (activeCategory !== '武功') {
                      e.currentTarget.style.backgroundImage =
                        'url(/assets/images/buttons/武功未选中.png)'
                    }
                  }}
                  style={{
                    width: 'clamp(2.5rem, 4vw, 3.5rem)',
                    height: 'clamp(1.2rem, 2vw, 1.8rem)',
                    backgroundImage:
                      activeCategory === '武功'
                        ? 'url(/assets/images/buttons/武功悬浮或点击选中.png)'
                        : 'url(/assets/images/buttons/武功未选中.png)',
                    backgroundSize: 'contain',
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: 'none',
                    backgroundColor: 'transparent',
                  }}
                ></div>
              </div>
            </div>

            {/* 右侧装饰线条 */}
            <div
              style={{
                position: 'absolute',
                right: '3vw',
                top: '50%',
                transform: 'translateY(-50%)',
                width: '36vw',
                height: '0.125rem',
                background: '#999999',
                opacity: 1,
              }}
            ></div>
          </HeaderArea>

          {/* 内容容器 - 包裹中间和底部区域 */}
          <ContentContainer $activeCategory={activeCategory}>
            {/* 中间区域 */}
            <MiddleArea>
              <LeftMiddlePanel>
                <LeftTopPanel style={{ flexDirection: 'row' }}>
                  {/* 左侧：词频偏向标题 - 背景图模式 */}
                  <div
                    style={{
                      flex: '0 0 30%',
                      minWidth: 0,
                      backgroundImage: `url(/assets/images/${
                        activeCategory === '门派'
                          ? '首页标题及图注-门派.png'
                          : activeCategory === '精神'
                          ? '首页标题及图注-精神.png'
                          : '首页标题及图注-武功.png'
                      })`,
                      backgroundSize: 'contain',
                      backgroundPosition: 'center top',
                      backgroundRepeat: 'no-repeat',
                      transition: 'all 0.3s ease',
                    }}
                  ></div>

                  {/* 右侧：图例区域 - 显示第一段数据(20%) */}
                  <div
                    style={{
                      flex: '1 1 70%',
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '1vh 0.5vw',
                      gap: '0.5vh',
                      minWidth: 0,
                      position: 'relative',
                    }}
                  >
                    {segmentedData?.segment1?.data?.length > 0 && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '10%',
                          left: '1%',
                          width: '100%',
                          height: '80%',
                          display: 'flex',
                          flexDirection: 'row',
                          gap: '0.375rem',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        {getLimitedDataBySubcategories(
                          segmentedData.segment1.data,
                          activeCategory,
                        ).map((item, movieIndex) => (
                          <div
                            key={movieIndex}
                            style={{
                              position: 'relative',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              height: '100%',
                              flex: '1',
                            }}
                          >
                            {/* 竖直虚线 - 贯穿所有数据点 */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '5%',
                                bottom: '20%',
                                left: '0',
                                width: '0.0625rem',
                                background:
                                  'linear-gradient(to bottom, transparent 0%, #896053 10%, #896053 90%, transparent 100%)',
                                borderLeft: '0.0625rem dashed #896053',
                                zIndex: 1,
                              }}
                            ></div>

                            {/* 多个数据点 - 每个子类别一个 */}
                            <div
                              style={{
                                position: 'absolute',
                                top: '0',
                                bottom: '0',
                                left: '0',
                                transform: 'translateX(-50%)',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                zIndex: 2,
                                width: '1rem',
                              }}
                            >
                              {generateSubcategoryDataPoints(
                                item,
                                activeCategory,
                              ).map((subcategoryPoint, subIndex) => (
                                <div
                                  key={subIndex}
                                  style={{
                                    width: '0.5rem',
                                    height: '0.5rem',
                                    borderRadius: '50%',
                                    backgroundColor: 'transparent',
                                    border: '0.125rem solid #E2D8D5',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    opacity: 0.8,
                                    boxShadow:
                                      '0 0 0.25rem rgba(226, 216, 213, 0.4)',
                                  }}
                                  onMouseEnter={(e) => {
                                    console.log(
                                      '🔥 第一段子类别数据点悬浮:',
                                      subcategoryPoint,
                                    )
                                    e.target.style.transform = 'scale(1.5)'
                                    e.target.style.boxShadow =
                                      '0 0 0.5rem rgba(226, 216, 213, 0.6)'
                                    handleDataPointEnter(
                                      subcategoryPoint.原始电影数据,
                                      subcategoryPoint,
                                      e,
                                    )
                                  }}
                                  onMouseLeave={(e) => {
                                    e.target.style.transform = 'scale(1)'
                                    e.target.style.boxShadow =
                                      '0 0 0.25rem rgba(226, 216, 213, 0.4)'
                                    handleDataPointLeave()
                                  }}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleDataPointClick(
                                      subcategoryPoint.原始电影数据,
                                      subcategoryPoint,
                                    )
                                  }}
                                  title={`${subcategoryPoint.子类别}: ${subcategoryPoint.数值}`}
                                ></div>
                              ))}
                            </div>

                            {/* 电影信息文字 - 时间在上，名称在下，固定宽度 */}
                            <div
                              style={{
                                position: 'absolute',
                                bottom: '0.125rem',
                                left: '0',
                                transform: 'translateX(-50%)',
                                fontSize: '0.4375rem',
                                color: '#534C4C',
                                textAlign: 'center',
                                fontWeight: 'bold',
                                zIndex: 3,
                                pointerEvents: 'none',
                                width: '2.5rem',
                              }}
                            >
                              <div
                                style={{
                                  fontSize: '0.375rem',
                                  opacity: 0.8,
                                  marginBottom: '0.0625rem',
                                }}
                              >
                                {item?.['上映年份'] || item?.['年份'] || '未知'}
                              </div>
                              <div
                                style={{
                                  lineHeight: '1.1',
                                  wordWrap: 'break-word',
                                  overflowWrap: 'break-word',
                                  hyphens: 'auto',
                                }}
                              >
                                {item?.['电影名'] ||
                                  item?.['电影'] ||
                                  `数据${movieIndex + 1}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </LeftTopPanel>

                <LeftBottomPanel style={{ position: 'relative' }}>
                  {/* 显示第二段数据(30%) */}
                  {segmentedData?.segment2?.data?.length > 0 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '16%',
                        left: '5%',
                        width: '90%',
                        height: '70%',
                        display: 'flex',
                        flexDirection: 'row',
                        gap: '0.625rem',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      {getLimitedDataBySubcategories(
                        segmentedData.segment2.data,
                        activeCategory,
                      ).map((item, movieIndex) => (
                        <div
                          key={movieIndex}
                          style={{
                            position: 'relative',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            height: '100%',
                            flex: '1',
                          }}
                        >
                          {/* 竖直虚线 - 贯穿所有数据点 */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '5%',
                              bottom: '20%',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              width: '0.0625rem',
                              background:
                                'linear-gradient(to bottom, transparent 0%, #896053 10%, #896053 90%, transparent 100%)',
                              borderLeft: '0.0625rem dashed #896053',
                              zIndex: 1,
                            }}
                          ></div>

                          {/* 单个数据点 - 对应电影的主导子类别 */}
                          <div
                            style={{
                              position: 'absolute',
                              top: '0',
                              bottom: '0',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '0.625rem',
                              zIndex: 2,
                              width: '1.375rem',
                            }}
                          >
                            {generateSubcategoryDataPoints(
                              item,
                              activeCategory,
                            ).map((subcategoryPoint, subIndex) => (
                              <div
                                key={subIndex}
                                style={{
                                  width: '0.625rem',
                                  height: '0.625rem',
                                  borderRadius: '50%',
                                  backgroundColor: 'transparent',
                                  border: '0.125rem solid #E2D8D5',
                                  cursor: 'pointer',
                                  transition: 'all 0.3s ease',
                                  opacity: 0.8,
                                  boxShadow:
                                    '0 0 0.25rem rgba(226, 216, 213, 0.4)',
                                }}
                                onMouseEnter={(e) => {
                                  console.log(
                                    '🔥 第二段子类别数据点悬浮:',
                                    subcategoryPoint,
                                  )
                                  e.target.style.transform = 'scale(1.6)'
                                  e.target.style.boxShadow =
                                    '0 0 0.625rem rgba(226, 216, 213, 0.6)'
                                  handleDataPointEnter(
                                    subcategoryPoint.原始电影数据,
                                    subcategoryPoint,
                                    e,
                                  )
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.transform = 'scale(1)'
                                  e.target.style.boxShadow =
                                    '0 0 0.25rem rgba(226, 216, 213, 0.4)'
                                  handleDataPointLeave()
                                }}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDataPointClick(
                                    subcategoryPoint.原始电影数据,
                                    subcategoryPoint,
                                  )
                                }}
                                title={`${subcategoryPoint.子类别}: ${subcategoryPoint.数值}`}
                              ></div>
                            ))}
                          </div>

                          {/* 电影信息文字 - 时间在上，名称在下，固定宽度 */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: '0.125rem',
                              left: '50%',
                              transform: 'translateX(-50%)',
                              fontSize: '0.5rem',
                              color: '#534C4C',
                              textAlign: 'center',
                              fontWeight: 'bold',
                              zIndex: 3,
                              pointerEvents: 'none',
                              width: '2.8125rem',
                            }}
                          >
                            <div
                              style={{
                                fontSize: '0.4375rem',
                                opacity: 0.8,
                                marginBottom: '0.0625rem',
                              }}
                            >
                              {item?.['上映年份'] || item?.['年份'] || '未知'}
                            </div>
                            <div
                              style={{
                                lineHeight: '1.1',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                hyphens: 'auto',
                              }}
                            >
                              {item?.['电影名'] ||
                                item?.['电影'] ||
                                `数据${movieIndex + 1}`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </LeftBottomPanel>
              </LeftMiddlePanel>

              <RightMiddlePanel>
                {/* 图片展示区域 */}
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* 按钮区域 - 定位在图片左上角 */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '4vh',
                      left: '9vw',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '0',
                      zIndex: 10,
                    }}
                  >
                    {/* 国内外观众选择 */}
                    <div
                      onClick={() => setViewMode('国内外观众')}
                      style={{
                        height: 'clamp(0.6rem, 1vh, 0.8rem)',
                        width: 'auto',
                        minWidth: '3.75rem',
                        backgroundImage: `url(/assets/images/${
                          viewMode === '国内外观众'
                            ? '国内外观众-高亮.png'
                            : '国内外观众-未选中.png'
                        })`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'block',
                      }}
                      title="国内外观众"
                    ></div>

                    {/* 各大洲观众选择 */}
                    <div
                      onClick={() => setViewMode('各大洲观众')}
                      style={{
                        height: 'clamp(0.6rem, 1vh, 0.8rem)',
                        width: 'auto',
                        minWidth: '3.75rem',
                        backgroundImage: `url(/assets/images/${
                          viewMode === '各大洲观众'
                            ? '各大洲观众-高亮.png'
                            : '各大洲观众-未选中.png'
                        })`,
                        backgroundSize: 'contain',
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'block',
                      }}
                      title="各大洲观众"
                    ></div>
                  </div>

                  {/* 背景图片区域 */}
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      backgroundImage: `url(/assets/images/${viewMode}分别喜欢什么样的${
                        activeCategory === '门派'
                          ? '江湖门派'
                          : activeCategory === '精神'
                          ? '侠义精神'
                          : '武林功夫'
                      }.png)`,
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'scale(1.02)'
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'scale(1)'
                    }}
                  ></div>
                </div>
              </RightMiddlePanel>
            </MiddleArea>

            {/* 底部图表面板 - 显示第三段数据(50%) */}
            <BottomChartPanel style={{ position: 'relative' }}>
              {segmentedData?.segment3?.data?.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: '26%',
                    left: '2%',
                    width: '96%',
                    height: '80%',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '0.75rem',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem',
                  }}
                >
                  {getLimitedDataBySubcategories(
                    segmentedData.segment3.data,
                    activeCategory,
                  ).map((item, movieIndex) => (
                    <div
                      key={movieIndex}
                      style={{
                        position: 'relative',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        height: '100%',
                        flex: '1',
                      }}
                    >
                      {/* 竖直虚线 - 贯穿所有数据点 */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '10%',
                          bottom: '20%',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '0.0625rem',
                          background:
                            'linear-gradient(to bottom, transparent 0%, #896053 10%, #896053 90%, transparent 100%)',
                          borderLeft: '0.0625rem dashed #896053',
                          zIndex: 1,
                        }}
                      ></div>

                      {/* 多个数据点 - 每个子类别一个 */}
                      <div
                        style={{
                          position: 'absolute',
                          top: '0',
                          bottom: '0',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.75rem',
                          zIndex: 2,
                          width: '1.5rem',
                        }}
                      >
                        {generateSubcategoryDataPoints(
                          item,
                          activeCategory,
                        ).map((subcategoryPoint, subIndex) => (
                          <div
                            key={subIndex}
                            style={{
                              width: '0.75rem',
                              height: '0.75rem',
                              borderRadius: '50%',
                              backgroundColor: 'transparent',
                              border: '0.125rem solid #E2D8D5',
                              cursor: 'pointer',
                              transition: 'all 0.3s ease',
                              opacity: 0.8,
                              boxShadow: '0 0 0.25rem rgba(226, 216, 213, 0.4)',
                            }}
                            onMouseEnter={(e) => {
                              console.log(
                                '🔥 第三段子类别数据点悬浮:',
                                subcategoryPoint,
                              )
                              e.target.style.transform = 'scale(1.8)'
                              e.target.style.boxShadow =
                                '0 0 0.75rem rgba(226, 216, 213, 0.6)'
                              handleDataPointEnter(
                                subcategoryPoint.原始电影数据,
                                subcategoryPoint,
                                e,
                              )
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.transform = 'scale(1)'
                              e.target.style.boxShadow =
                                '0 0 0.25rem rgba(226, 216, 213, 0.4)'
                              handleDataPointLeave()
                            }}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDataPointClick(
                                subcategoryPoint.原始电影数据,
                                subcategoryPoint,
                              )
                            }}
                            title={`${subcategoryPoint.子类别}: ${subcategoryPoint.数值}`}
                          ></div>
                        ))}
                      </div>

                      {/* 电影信息文字 - 时间在上，名称在下，固定宽度 */}
                      <div
                        style={{
                          position: 'absolute',
                          bottom: '0.125rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          fontSize: '0.5625rem',
                          color: '#534C4C',
                          textAlign: 'center',
                          fontWeight: 'bold',
                          zIndex: 3,
                          pointerEvents: 'none',
                          width: '3.125rem',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '0.5rem',
                            opacity: 0.8,
                            marginBottom: '0.125rem',
                          }}
                        >
                          {item?.['上映年份'] || item?.['年份'] || '未知'}
                        </div>
                        <div
                          style={{
                            lineHeight: '1.1',
                            wordWrap: 'break-word',
                            overflowWrap: 'break-word',
                            hyphens: 'auto',
                          }}
                        >
                          {item?.['电影名'] ||
                            item?.['电影'] ||
                            `数据项${movieIndex + 1}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </BottomChartPanel>
          </ContentContainer>
        </MainContent>
      </DashboardContainer>

      {/* 数据展示面板 */}
      {showDataPanel && hoveredMovieData && (
        <DataPanel
          ref={dataPanelRef}
          style={{
            left: `${panelPosition.x}px`,
            top: `${panelPosition.y}px`,
          }}
        >
          <div className="movie-title">{hoveredMovieData.电影名}</div>
          <div className="movie-year">{hoveredMovieData.上映年份}</div>
          <div className="movie-quote">
            {getMovieQuote(
              hoveredMovieData.电影名,
              hoveredMovieData.当前类别,
              hoveredMovieData.悬浮子类别,
            )}
          </div>

          <div className="data-section">
            {/* 显示横条图格式的词频数据 - 支持多工作表结构，根据数据长度动态调整显示数量 */}
            {(() => {
              // 构建词频数据的键：当前类别-悬浮子类别
              const wordFreqKey = `${hoveredMovieData.当前类别}-${hoveredMovieData.悬浮子类别}`
              const wordFreqData =
                hoveredMovieData.词频数据?.子类别台词?.[wordFreqKey]

              return wordFreqData && wordFreqData.length > 0
            })() ? (
              <div style={{ marginBottom: '0.5rem' }}>
                {(() => {
                  // 构建词频数据的键
                  const wordFreqKey = `${hoveredMovieData.当前类别}-${hoveredMovieData.悬浮子类别}`
                  const wordFreqData =
                    hoveredMovieData.词频数据?.子类别台词?.[wordFreqKey] || []

                  // 根据数据长度动态确定显示数量
                  let displayCount = 4 // 默认显示4个
                  if (wordFreqData.length >= 10) {
                    displayCount = 6 // 数据充足时显示6个
                  } else if (wordFreqData.length >= 6) {
                    displayCount = 5 // 中等数据量显示5个
                  } else if (wordFreqData.length >= 3) {
                    displayCount = 4 // 少量数据显示4个
                  } else {
                    displayCount = wordFreqData.length // 数据很少时显示全部
                  }

                  console.log(
                    `📊 词频数据显示: ${wordFreqData.length}条数据，显示${displayCount}条`,
                  )

                  return wordFreqData
                    .slice(0, displayCount) // 根据数据长度动态显示
                    .map((wordData, index) => {
                      // 解析词汇和频次，格式如: "武林(15次)"
                      const match = wordData.match(/^(.+)\((\d+)次\)$/)
                      const word = match ? match[1] : wordData
                      const frequency = match ? parseInt(match[2]) : 0
                      const maxFreq = Math.max(
                        ...wordFreqData.slice(0, displayCount).map((item) => {
                          const m = item.match(/^(.+)\((\d+)次\)$/)
                          return m ? parseInt(m[2]) : 0
                        }),
                      )

                      return (
                        <div
                          key={index}
                          className="data-item"
                          style={{ marginBottom: '0.25rem' }}
                        >
                          <div
                            className="data-label"
                            style={{
                              minWidth: '3.125rem',
                              fontSize: (() => {
                                // 根据频次调整字体大小
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8) return '0.75rem' // 高频词稍大
                                if (intensity >= 0.6) return '0.7rem'
                                return '0.6875rem' // 默认大小
                              })(),
                              color: (() => {
                                // 根据频次调整颜色深度
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8) return '#8b4513' // 深棕色 - 高频
                                if (intensity >= 0.6) return '#a0522d' // 中深棕色
                                if (intensity >= 0.4) return '#cd853f' // 中等棕色
                                return '#696969' // 灰色 - 低频
                              })(),
                              fontWeight: (() => {
                                // 根据频次调整字体粗细
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8) return 'bold'
                                if (intensity >= 0.6) return '600'
                                return 'normal'
                              })(),
                              textShadow: (() => {
                                // 高频词添加文字阴影
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8)
                                  return '0 0 1px rgba(139, 69, 19, 0.3)'
                                return 'none'
                              })(),
                              letterSpacing: (() => {
                                // 高频词增加字间距，更突出
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8) return '0.05em'
                                return 'normal'
                              })(),
                            }}
                          >
                            {word}
                          </div>
                          <div
                            className="data-bar"
                            style={{
                              flex: 1,
                              margin: '0 0.5rem',
                              height: '0.25rem',
                              backgroundColor: '#f0f0f0',
                              borderRadius: '0.125rem',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              className="data-fill"
                              style={{
                                width: `${Math.min(
                                  100,
                                  Math.max(8, (frequency / maxFreq) * 100), // 最小8%宽度，确保小数值也可见
                                )}%`,
                                height: '100%',
                                backgroundColor: (() => {
                                  // 根据频次大小动态调整颜色深度
                                  const intensity = Math.min(
                                    100,
                                    (frequency / maxFreq) * 100,
                                  )
                                  if (intensity >= 80) return '#8b4513' // 深棕色 - 高频词
                                  if (intensity >= 60) return '#a0522d' // 中深棕色
                                  if (intensity >= 40) return '#cd853f' // 中等棕色
                                  if (intensity >= 20) return '#daa520' // 浅棕色
                                  return '#e2d8d5' // 最浅色 - 低频词
                                })(),
                                borderRadius: '0.125rem',
                                transition: 'all 0.4s ease',
                                boxShadow: `0 0 ${Math.max(
                                  2,
                                  (frequency / maxFreq) * 6,
                                )}px rgba(139, 69, 19, ${Math.max(
                                  0.2,
                                  (frequency / maxFreq) * 0.6,
                                )})`, // 根据频次调整阴影
                              }}
                            ></div>
                          </div>
                          <span
                            className="data-value"
                            style={{
                              minWidth: '1.5625rem',
                              fontSize: (() => {
                                // 根据频次调整字体大小
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8) return '0.75rem' // 高频词稍大
                                if (intensity >= 0.6) return '0.7rem'
                                return '0.6875rem' // 默认大小
                              })(),
                              color: (() => {
                                // 根据频次调整颜色深度
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8) return '#8b4513' // 深棕色 - 高频
                                if (intensity >= 0.6) return '#a0522d' // 中深棕色
                                if (intensity >= 0.4) return '#cd853f' // 中等棕色
                                return '#696969' // 灰色 - 低频
                              })(),
                              fontWeight: (() => {
                                // 根据频次调整字体粗细
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.7) return 'bold'
                                if (intensity >= 0.5) return '600'
                                return 'normal'
                              })(),
                              textShadow: (() => {
                                // 高频词添加文字阴影
                                const intensity = frequency / maxFreq
                                if (intensity >= 0.8)
                                  return '0 0 2px rgba(139, 69, 19, 0.3)'
                                return 'none'
                              })(),
                            }}
                          >
                            {frequency}
                          </span>
                        </div>
                      )
                    })
                })()}
              </div>
            ) : // 如果没有词频数据，显示子类别数值横条图，根据数据长度动态调整显示数量
            hoveredMovieData.子类别数据 &&
              Object.keys(hoveredMovieData.子类别数据).filter(
                (key) => key !== '结果',
              ).length > 0 ? (
              <div style={{ marginBottom: '0.5rem' }}>
                {(() => {
                  // 获取有效的子类别数据
                  const validSubcategoryData = Object.entries(
                    hoveredMovieData.子类别数据,
                  )
                    .filter(
                      ([key, value]) =>
                        key !== '结果' &&
                        typeof value === 'number' &&
                        value > 0,
                    )
                    .sort(([, a], [, b]) => b - a) // 按数值从大到小排序

                  // 根据数据长度动态确定显示数量
                  let displayCount = 3 // 默认显示3个
                  if (validSubcategoryData.length >= 5) {
                    displayCount = 4 // 数据充足时显示4个
                  } else if (validSubcategoryData.length >= 3) {
                    displayCount = 3 // 中等数据量显示3个
                  } else {
                    displayCount = validSubcategoryData.length // 数据很少时显示全部
                  }

                  console.log(
                    `📊 子类别数据显示: ${validSubcategoryData.length}条数据，显示${displayCount}条`,
                  )

                  return validSubcategoryData
                    .slice(0, displayCount)
                    .map(([subcategoryName, value]) => (
                      <div
                        key={subcategoryName}
                        className="data-item"
                        style={{ marginBottom: '0.25rem' }}
                      >
                        <div
                          className="data-label"
                          style={{
                            minWidth: '3.125rem',
                            fontSize: '0.6875rem',
                            color:
                              subcategoryName === hoveredMovieData.悬浮子类别
                                ? '#8b4513'
                                : '#696969',
                            fontWeight:
                              subcategoryName === hoveredMovieData.悬浮子类别
                                ? 'bold'
                                : 'normal',
                          }}
                        >
                          {subcategoryName}
                        </div>
                        <div
                          className="data-bar"
                          style={{
                            flex: 1,
                            margin: '0 0.5rem',
                            height: '0.25rem',
                            backgroundColor: '#f5f5f5',
                            borderRadius: '0.125rem',
                            overflow: 'hidden',
                          }}
                        >
                          <div
                            className="data-fill"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  10,
                                  (value /
                                    Math.max(
                                      ...validSubcategoryData
                                        .slice(0, displayCount)
                                        .map(([, v]) => v),
                                    )) *
                                    100,
                                ), // 最小10%宽度，确保小数值也可见
                              )}%`,
                              height: '100%',
                              backgroundColor: (() => {
                                const maxValue = Math.max(
                                  ...validSubcategoryData
                                    .slice(0, displayCount)
                                    .map(([, v]) => v),
                                )
                                const intensity = Math.min(
                                  100,
                                  (value / maxValue) * 100,
                                )
                                const isHighlighted =
                                  subcategoryName ===
                                  hoveredMovieData.悬浮子类别

                                if (isHighlighted) {
                                  // 高亮子类别使用更鲜明的颜色
                                  if (intensity >= 80) return '#8b4513' // 深棕色
                                  if (intensity >= 60) return '#a0522d' // 中深棕色
                                  if (intensity >= 40) return '#cd853f' // 中等棕色
                                  return '#daa520' // 浅棕色
                                } else {
                                  // 非高亮子类别使用灰色系
                                  if (intensity >= 80) return '#696969' // 深灰
                                  if (intensity >= 60) return '#808080' // 中深灰
                                  if (intensity >= 40) return '#a9a9a9' // 中等灰
                                  return '#d3d3d3' // 浅灰
                                }
                              })(),
                              borderRadius: '0.125rem',
                              transition: 'all 0.4s ease',
                              boxShadow: (() => {
                                const maxValue = Math.max(
                                  ...validSubcategoryData
                                    .slice(0, displayCount)
                                    .map(([, v]) => v),
                                )
                                const intensity = value / maxValue
                                const isHighlighted =
                                  subcategoryName ===
                                  hoveredMovieData.悬浮子类别

                                if (isHighlighted) {
                                  return `0 0 ${Math.max(
                                    2,
                                    intensity * 8,
                                  )}px rgba(139, 69, 19, ${Math.max(
                                    0.3,
                                    intensity * 0.7,
                                  )})`
                                } else {
                                  return `0 0 ${Math.max(
                                    1,
                                    intensity * 4,
                                  )}px rgba(105, 105, 105, ${Math.max(
                                    0.2,
                                    intensity * 0.4,
                                  )})`
                                }
                              })(),
                            }}
                          ></div>
                        </div>
                        <span
                          className="data-value"
                          style={{
                            minWidth: '1.5625rem',
                            fontSize: (() => {
                              const maxValue = Math.max(
                                ...validSubcategoryData
                                  .slice(0, displayCount)
                                  .map(([, v]) => v),
                              )
                              const intensity = value / maxValue
                              const isHighlighted =
                                subcategoryName === hoveredMovieData.悬浮子类别

                              if (isHighlighted && intensity >= 0.8)
                                return '0.75rem'
                              if (intensity >= 0.6) return '0.7rem'
                              return '0.6875rem'
                            })(),
                            color: (() => {
                              const maxValue = Math.max(
                                ...validSubcategoryData
                                  .slice(0, displayCount)
                                  .map(([, v]) => v),
                              )
                              const intensity = value / maxValue
                              const isHighlighted =
                                subcategoryName === hoveredMovieData.悬浮子类别

                              if (isHighlighted) {
                                if (intensity >= 0.8) return '#8b4513' // 深棕色
                                if (intensity >= 0.6) return '#a0522d' // 中深棕色
                                if (intensity >= 0.4) return '#cd853f' // 中等棕色
                                return '#daa520' // 浅棕色
                              } else {
                                if (intensity >= 0.8) return '#696969' // 深灰
                                if (intensity >= 0.6) return '#808080' // 中深灰
                                return '#a9a9a9' // 浅灰
                              }
                            })(),
                            fontWeight: (() => {
                              const maxValue = Math.max(
                                ...validSubcategoryData
                                  .slice(0, displayCount)
                                  .map(([, v]) => v),
                              )
                              const intensity = value / maxValue
                              const isHighlighted =
                                subcategoryName === hoveredMovieData.悬浮子类别

                              if (isHighlighted) return 'bold'
                              if (intensity >= 0.7) return '600'
                              return 'normal'
                            })(),
                            textShadow: (() => {
                              const maxValue = Math.max(
                                ...validSubcategoryData
                                  .slice(0, displayCount)
                                  .map(([, v]) => v),
                              )
                              const intensity = value / maxValue
                              const isHighlighted =
                                subcategoryName === hoveredMovieData.悬浮子类别

                              if (isHighlighted && intensity >= 0.8) {
                                return '0 0 2px rgba(139, 69, 19, 0.4)'
                              }
                              return 'none'
                            })(),
                          }}
                        >
                          {value}
                        </span>
                      </div>
                    ))
                })()}
              </div>
            ) : (
              // 最后备用显示
              <div className="data-item">
                <span className="data-label">
                  {hoveredMovieData.悬浮子类别}
                </span>
                <div className="data-bar">
                  <div
                    className="data-fill"
                    style={{
                      width: `${Math.min(
                        100,
                        (hoveredMovieData.悬浮数值 / 100) * 100,
                      )}%`,
                    }}
                  ></div>
                </div>
                <span className="data-value">{hoveredMovieData.悬浮数值}</span>
              </div>
            )}
          </div>
        </DataPanel>
      )}
    </>
  )
}

export default DashboardHome
