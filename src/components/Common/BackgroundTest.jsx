import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const TestContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  background-image: url(${props => props.$backgroundUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: background-image 1s ease-in-out;
`;

const ControlPanel = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  border-radius: 8px;
  z-index: 1000;
`;

const Button = styled.button`
  background: #d4af37;
  color: white;
  border: none;
  padding: 10px 15px;
  margin: 5px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #cd853f;
  }
`;

const BackgroundTest = () => {
  const [currentIndex, setCurrentIndex] = useState(1);
  const [autoPlay, setAutoPlay] = useState(false);

  const backgroundList = [
    '/assets/images/backgrounds/1.png',
    '/assets/images/backgrounds/2.png',
    '/assets/images/backgrounds/3.png',
    '/assets/images/backgrounds/4.png',
    '/assets/images/backgrounds/5.png',
    '/assets/images/backgrounds/6.png',
    '/assets/images/backgrounds/7.png',
    '/assets/images/backgrounds/8.png',
    '/assets/images/backgrounds/9.png',
    '/assets/images/backgrounds/10.png'
  ];

  const currentBackground = backgroundList[currentIndex - 1];

  useEffect(() => {
    if (!autoPlay) return;

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev >= backgroundList.length ? 1 : prev + 1));
    }, 3000);

    return () => clearInterval(interval);
  }, [autoPlay, backgroundList.length]);

  const nextBackground = () => {
    setCurrentIndex(prev => (prev >= backgroundList.length ? 1 : prev + 1));
  };

  const prevBackground = () => {
    setCurrentIndex(prev => (prev <= 1 ? backgroundList.length : prev - 1));
  };

  return (
    <>
      <TestContainer $backgroundUrl={currentBackground} />
      <ControlPanel>
        <div>背景测试控制面板</div>
        <div>当前: {currentIndex}/{backgroundList.length}</div>
        <div>图片: {currentBackground}</div>
        <div>
          <Button onClick={prevBackground}>上一张</Button>
          <Button onClick={nextBackground}>下一张</Button>
        </div>
        <div>
          <Button onClick={() => setAutoPlay(!autoPlay)}>
            {autoPlay ? '停止自动播放' : '开始自动播放'}
          </Button>
        </div>
      </ControlPanel>
    </>
  );
};

export default BackgroundTest; 