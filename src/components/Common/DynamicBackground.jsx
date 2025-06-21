import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { getMovieBackground, getRandomBackground, preloadBackgrounds } from '../../services/backgroundService';

const BackgroundContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
`;

const BackgroundImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url(${props => props.$src});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: ${props => props.$visible ? 1 : 0};
  transition: opacity ${props => props.$duration || 1000}ms ease-in-out;
  
  /* 武侠主题滤镜效果 */
  filter: ${props => props.$filter || 'brightness(0.7) contrast(1.1) sepia(0.1)'};
  
  /* 渐变遮罩层 */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => props.$overlay || 'linear-gradient(135deg, rgba(139, 69, 19, 0.1) 0%, rgba(210, 105, 30, 0.05) 50%, rgba(245, 245, 220, 0.1) 100%)'};
    pointer-events: none;
  }
`;

const BackgroundOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$pattern || 'radial-gradient(circle at 20% 30%, rgba(176, 196, 222, 0.05) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(205, 133, 63, 0.05) 0%, transparent 50%)'};
  pointer-events: none;
  z-index: 1;
`;

const DynamicBackground = ({ 
  movieId = null,
  mode = 'default', // default, random, slideshow
  duration = 1000,
  autoChange = false,
  changeInterval = 10000,
  filter = null,
  overlay = null,
  onBackgroundChange = null
}) => {
  const [currentBackground, setCurrentBackground] = useState(null);
  const [nextBackground, setNextBackground] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [backgroundsLoaded, setBackgroundsLoaded] = useState(false);

  // 预加载背景图片
  useEffect(() => {
    const loadBackgrounds = async () => {
      try {
        console.log('开始预加载背景图片...');
        await preloadBackgrounds();
        console.log('背景图片预加载完成');
        setBackgroundsLoaded(true);
      } catch (error) {
        console.error('背景图片预加载失败:', error);
        setBackgroundsLoaded(true); // 即使失败也继续
      }
    };

    // 直接设置为已加载，跳过预加载
    setBackgroundsLoaded(true);
    loadBackgrounds();
  }, []);

  // 切换背景图片的函数
  const changeBackground = useCallback((newBackgroundUrl) => {
    if (!newBackgroundUrl || newBackgroundUrl === currentBackground) {
      return;
    }

    setIsTransitioning(true);
    setNextBackground(newBackgroundUrl);

    // 延迟切换，确保过渡效果
    setTimeout(() => {
      setCurrentBackground(newBackgroundUrl);
      setNextBackground(null);
      setIsTransitioning(false);
      
      // 回调通知背景已切换
      if (onBackgroundChange) {
        onBackgroundChange(newBackgroundUrl);
      }
    }, duration / 2);
  }, [currentBackground, duration, onBackgroundChange]);

  // 根据电影ID切换背景
  useEffect(() => {
    if (!backgroundsLoaded) return;

    if (movieId) {
      const backgroundUrl = getMovieBackground(movieId);
      if (backgroundUrl) {
        changeBackground(backgroundUrl);
      }
    } else if (mode === 'random') {
      const randomBackground = getRandomBackground();
      if (randomBackground) {
        changeBackground(randomBackground);
      }
    }
  }, [movieId, mode, backgroundsLoaded, changeBackground]);

  // 自动切换背景（幻灯片模式）
  useEffect(() => {
    if (!autoChange || !backgroundsLoaded) return;

    console.log('启动自动切换背景，间隔:', changeInterval);
    const interval = setInterval(() => {
      console.log('自动切换背景...');
      const randomBackground = getRandomBackground();
      console.log('获取到随机背景:', randomBackground);
      if (randomBackground) {
        changeBackground(randomBackground);
      } else {
        // 如果获取随机背景失败，使用固定的背景列表
        const backgroundList = [
          '/assets/images/backgrounds/1.png',
          '/assets/images/backgrounds/2.png',
          '/assets/images/backgrounds/3.png',
          '/assets/images/backgrounds/4.png',
          '/assets/images/backgrounds/5.png'
        ];
        const randomIndex = Math.floor(Math.random() * backgroundList.length);
        changeBackground(backgroundList[randomIndex]);
      }
    }, changeInterval);

    return () => clearInterval(interval);
  }, [autoChange, changeInterval, backgroundsLoaded, changeBackground]);

  // 初始化默认背景
  useEffect(() => {
    if (backgroundsLoaded && !currentBackground) {
      console.log('初始化默认背景...');
      const defaultBackground = getRandomBackground();
      console.log('获取到的默认背景:', defaultBackground);
      if (defaultBackground) {
        setCurrentBackground(defaultBackground);
      } else {
        // 如果获取随机背景失败，使用固定背景
        const fallbackBackground = '/assets/images/backgrounds/1.png';
        console.log('使用备用背景:', fallbackBackground);
        setCurrentBackground(fallbackBackground);
      }
    }
  }, [backgroundsLoaded, currentBackground]);

  if (!backgroundsLoaded) {
    return (
      <BackgroundContainer>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          filter: 'brightness(0.3)'
        }} />
      </BackgroundContainer>
    );
  }

  return (
    <BackgroundContainer>
      {/* 当前背景 */}
      {currentBackground && currentBackground !== "" && (
        <BackgroundImage
          $src={currentBackground}
          $visible={!isTransitioning}
          $duration={duration}
          $filter={filter}
          $overlay={overlay}
        />
      )}
      
      {/* 下一个背景（用于过渡效果） */}
      {nextBackground && nextBackground !== "" && (
        <BackgroundImage
          $src={nextBackground}
          $visible={isTransitioning}
          $duration={duration}
          $filter={filter}
          $overlay={overlay}
        />
      )}
      
      {/* 装饰性遮罩层 */}
      <BackgroundOverlay $pattern={overlay} />
    </BackgroundContainer>
  );
};

export default DynamicBackground; 