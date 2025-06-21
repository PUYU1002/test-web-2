import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { createGlobalStyle } from 'styled-components'

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
  font-family: 'AaGuDianKeBenSong, serif';
  font-size: clamp(1rem, 1.5vw, 1.2rem);
  color: #8b4513;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5vw;
  
  &:hover {
    color: #D2691E;
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
  font-family: 'AaGuDianKeBenSong, serif';
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
  height: 60vh;
  min-height: 60vh;
  max-height: 60vh;
  overflow: hidden;
`

const TopLeftPanel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5vh 1.5vw;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 2;
  min-height: 0;
`

const BottomLeftSection = styled.div`
  display: flex;
  gap: 1vw;
  flex: 1;
  min-height: 0;
`

const BottomLeftPanel1 = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5vh 1.5vw;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const BottomLeftPanel2 = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5vh 1.5vw;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`

const LeftTopPanel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5vh 1.5vw;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const LeftBottomPanel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5vh 1.5vw;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
`

const RightPanel = styled.div`
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 1.5vh 1.5vw;
  backdrop-filter: blur(10px);
  box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex: 2;
  min-height: 0;
`

const PanelTitle = styled.h3`
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(1rem, 1.5vw, 1.3rem);
  color: #8b4513;
  margin: 0 0 1vh 0;
  text-align: center;
  border-bottom: 2px solid rgba(139, 69, 19, 0.2);
  padding-bottom: 0.5vh;
`

const CharacterNetwork = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  min-height: 0;
`

const CharacterNode = styled.div`
  position: absolute;
  width: clamp(3rem, 5vw, 4rem);
  height: clamp(3rem, 5vw, 4rem);
  border-radius: 50%;
  background: ${props => props.$color || '#B0C4DE'};
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(0.7rem, 1vw, 0.9rem);
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 0.2vh 0.8vh rgba(0, 0, 0, 0.2);
  
  &:hover {
    transform: scale(1.1);
    box-shadow: 0 0.4vh 1.2vh rgba(0, 0, 0, 0.3);
  }
`

const DialogueAnalysis = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1vh;
  min-height: 0;
  overflow-y: auto;
`

const DialogueItem = styled.div`
  background: rgba(210, 105, 30, 0.1);
  border-radius: 8px;
  padding: 1vh 1vw;
  border-left: 4px solid #D2691E;
`

const Speaker = styled.div`
  font-family: 'KaiTi', '楷体', serif;
  font-size: clamp(0.8rem, 1.1vw, 1rem);
  color: #8b4513;
  font-weight: bold;
  margin-bottom: 0.5vh;
`

const DialogueText = styled.div`
  font-family: 'AaGuDianKeBenSong, serif';
  font-size: clamp(0.7rem, 1vw, 0.9rem);
  color: #2F4F4F;
  line-height: 1.4;
`

const TimelinePanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`

const Timeline = styled.div`
  flex: 1;
  position: relative;
  background: linear-gradient(90deg, rgba(210, 105, 30, 0.1) 0%, rgba(176, 196, 222, 0.1) 100%);
  border-radius: 8px;
  padding: 1vh;
  overflow-x: auto;
  overflow-y: hidden;
`

const MovieDetail = () => {
  const navigate = useNavigate()
  const { movieId } = useParams()
  const [selectedCharacter, setSelectedCharacter] = useState(null)
  const [currentBackground, setCurrentBackground] = useState('/assets/images/detail/detail_1.png')

  // 详情页背景图片列表
  const detailBackgrounds = [
    'detail_1.png', 'detail_2.png', 'detail_3.png', 'detail_4.png', 'detail_5.png',
    'detail_6.png', 'detail_7.png', 'detail_8.png', 'detail_9.png', 'detail_10.png',
    'detail_11.png', 'detail_12.png', 'detail_13.png', 'detail_14.png', 'detail_15.png',
    'detail_16.png', 'detail_17.png', 'detail_18.png', 'detail_19.png', 'detail_20.png',
    'detail_21.png', 'detail_22.png', 'detail_23.png', 'detail_24.png', 'detail_25.png',
    'detail_26.png', 'detail_27.png', 'detail_28.png', 'detail_29.png', 'detail_30.png',
    'detail_31.png', 'detail_32.png', 'detail_33.png', 'detail_34.png', 'detail_35.png',
    'detail_36.png', 'detail_37.png', 'detail_38.png', 'detail_39.png', 'detail_40.png',
    'detail_41.png', 'detail_42.png', 'detail_43.png', 'detail_44.png', 'detail_45.png',
    'detail_46.png'
  ]

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
    characters: [
      { name: '小倩', position: { top: '20%', left: '30%' }, color: '#D2691E' },
      { name: '燕赤霞', position: { top: '40%', left: '60%' }, color: '#CD853F' },
      { name: '大人', position: { top: '60%', left: '20%' }, color: '#B0C4DE' },
      { name: '宁采臣', position: { top: '30%', left: '80%' }, color: '#708090' },
      { name: '姥姥', position: { top: '70%', left: '50%' }, color: '#8B4513' },
    ],
    dialogues: [
      { speaker: '小倩', text: '公子，你不该来这里的...', time: '00:15:30' },
      { speaker: '燕赤霞', text: '妖孽！还不现出原形！', time: '00:32:15' },
      { speaker: '宁采臣', text: '小倩，我不怕，我们一起走吧', time: '00:45:20' },
      { speaker: '姥姥', text: '想走？没那么容易！', time: '00:58:10' },
    ]
  }

  const handleBack = () => {
    // 返回主页面
    navigate('/')
  }

  return (
    <>
      <GlobalStyle />
              <DetailContainer $backgroundUrl={currentBackground}>

          {/* 主要内容区域 */}
          <MainContent>
            {/* 左侧区域 */}
            <LeftSection>
              {/* 上部：角色关系网络 */}
              <TopLeftPanel>
                
              </TopLeftPanel>

              {/* 下部：分为两个小面板 */}
              <BottomLeftSection>
                <BottomLeftPanel1>
                  
                </BottomLeftPanel1>
                <BottomLeftPanel2>
                  
                </BottomLeftPanel2>
              </BottomLeftSection>
            </LeftSection>

            {/* 右侧面板 */}
            <RightPanel>
              
            </RightPanel>
          </MainContent>
        </DetailContainer>
    </>
  )
}

export default MovieDetail 