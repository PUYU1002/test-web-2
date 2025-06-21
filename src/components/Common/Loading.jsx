import React from 'react';
import styled, { keyframes } from 'styled-components';

// 旋转动画
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// 脉冲动画
const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

// 波浪动画
const wave = keyframes`
  0%, 60%, 100% { transform: initial; }
  30% { transform: translateY(-15px); }
`;

const LoadingContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['minHeight'].includes(prop),
})`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  min-height: ${props => props.minHeight || '200px'};
  padding: 20px;
`;

const SpinnerContainer = styled.div.withConfig({
  shouldForwardProp: (prop) => !['size'].includes(prop),
})`
  position: relative;
  width: ${props => props.size || '40px'};
  height: ${props => props.size || '40px'};
  margin-bottom: 16px;
`;

// 圆形旋转加载器
const CircleSpinner = styled.div`
  width: 100%;
  height: 100%;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

// 点状加载器
const DotsContainer = styled.div`
  display: flex;
  gap: 4px;
`;

const Dot = styled.div`
  width: 8px;
  height: 8px;
  background-color: #667eea;
  border-radius: 50%;
  animation: ${wave} 1.4s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
`;

// 脉冲加载器
const PulseSpinner = styled.div`
  width: 40px;
  height: 40px;
  background-color: #667eea;
  border-radius: 50%;
  animation: ${pulse} 1.5s ease-in-out infinite;
`;

// 条形加载器
const BarsContainer = styled.div`
  display: flex;
  gap: 3px;
  align-items: end;
  height: 30px;
`;

const Bar = styled.div`
  width: 4px;
  background-color: #667eea;
  border-radius: 2px;
  animation: ${wave} 1.2s ease-in-out infinite;
  animation-delay: ${props => props.delay || '0s'};
  height: ${props => props.height || '20px'};
`;

const LoadingText = styled.p`
  color: #666;
  font-size: 14px;
  margin: 0;
  text-align: center;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const Loading = ({ 
  type = 'circle', 
  size = '40px', 
  text = '加载中...', 
  minHeight = '200px',
  color = '#667eea' 
}) => {
  const renderSpinner = () => {
    switch (type) {
      case 'dots':
        return (
          <DotsContainer>
            <Dot delay="0s" />
            <Dot delay="0.2s" />
            <Dot delay="0.4s" />
          </DotsContainer>
        );
      
      case 'pulse':
        return <PulseSpinner style={{ backgroundColor: color }} />;
      
      case 'bars':
        return (
          <BarsContainer>
            <Bar delay="0s" height="15px" style={{ backgroundColor: color }} />
            <Bar delay="0.1s" height="25px" style={{ backgroundColor: color }} />
            <Bar delay="0.2s" height="20px" style={{ backgroundColor: color }} />
            <Bar delay="0.3s" height="30px" style={{ backgroundColor: color }} />
            <Bar delay="0.4s" height="18px" style={{ backgroundColor: color }} />
          </BarsContainer>
        );
      
      case 'circle':
      default:
        return (
          <SpinnerContainer size={size}>
            <CircleSpinner style={{ borderTopColor: color }} />
          </SpinnerContainer>
        );
    }
  };

  return (
    <LoadingContainer minHeight={minHeight}>
      {renderSpinner()}
      {text && <LoadingText>{text}</LoadingText>}
    </LoadingContainer>
  );
};

// 内联加载组件（用于按钮等小空间）
export const InlineLoading = ({ size = '16px', color = '#667eea' }) => (
  <SpinnerContainer size={size} style={{ margin: 0 }}>
    <CircleSpinner style={{ borderTopColor: color, borderWidth: '2px' }} />
  </SpinnerContainer>
);

// 全屏加载组件
export const FullScreenLoading = ({ text = '加载中...' }) => (
  <LoadingContainer 
    minHeight="100vh" 
    style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      backgroundColor: 'rgba(255, 255, 255, 0.9)', 
      zIndex: 9999 
    }}
  >
    <SpinnerContainer size="60px">
      <CircleSpinner />
    </SpinnerContainer>
    <LoadingText style={{ fontSize: '16px', marginTop: '20px' }}>
      {text}
    </LoadingText>
  </LoadingContainer>
);

// 骨架屏加载组件
const SkeletonItem = styled.div`
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: ${keyframes`
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  `} 1.5s ease-in-out infinite;
  border-radius: 4px;
  height: ${props => props.height || '20px'};
  width: ${props => props.width || '100%'};
  margin-bottom: ${props => props.marginBottom || '10px'};
`;

export const SkeletonLoading = ({ lines = 3, height = '20px' }) => (
  <div>
    {Array.from({ length: lines }, (_, index) => (
      <SkeletonItem 
        key={index} 
        height={height}
        width={index === lines - 1 ? '70%' : '100%'}
      />
    ))}
  </div>
);

export default Loading; 