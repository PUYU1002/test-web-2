import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled, { createGlobalStyle } from 'styled-components';
import DashboardHome from './pages/Dashboard/DashboardHome';
import MovieDetail from './pages/MovieDetail/MovieDetail';
import './App.css';

// 全局样式 - 武侠主题风格
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'SimSun', '宋体', serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background: #F6F0E7;
    color: #2F4F4F;
    line-height: 1.6;
    overflow-x: hidden;
    position: relative;
  }

  body::before {
    content: '';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 20% 30%, rgba(176, 196, 222, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(205, 133, 63, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 40% 80%, rgba(169, 169, 169, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: -1;
  }

  code {
    font-family: 'Courier New', monospace;
  }

  // 武侠主题滚动条样式
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: rgba(210, 105, 30, 0.1);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #D2691E, #CD853F);
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(210, 105, 30, 0.3);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #CD853F, #D2691E);
  }

  // 选中文本样式
  ::selection {
    background: rgba(210, 105, 30, 0.3);
    color: #2F4F4F;
  }

  // 武侠主题链接样式
  a {
    color: #D2691E;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  a:hover {
    color: #8B4513;
    text-shadow: 0 0 8px rgba(210, 105, 30, 0.6);
  }

  // 武侠主题按钮样式
  button {
    font-family: 'KaiTi', '楷体', serif;
    outline: none;
    background: linear-gradient(135deg, rgba(210, 105, 30, 0.2), rgba(205, 133, 63, 0.2));
    color: #8B4513;
    border: 1px solid rgba(210, 105, 30, 0.4);
    border-radius: 8px;
    padding: 10px 20px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-weight: 500;
    letter-spacing: 0.5px;
  }

  button:focus {
    outline: 2px solid rgba(210, 105, 30, 0.5);
    outline-offset: 2px;
  }

  button:hover {
    background: linear-gradient(135deg, rgba(210, 105, 30, 0.3), rgba(205, 133, 63, 0.3));
    border-color: rgba(210, 105, 30, 0.6);
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(210, 105, 30, 0.3);
  }

  button:active {
    transform: translateY(0);
  }

  // 武侠主题输入框样式
  input, textarea, select {
    font-family: 'SimSun', '宋体', serif;
    outline: none;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(210, 105, 30, 0.3);
    border-radius: 6px;
    color: #2F4F4F;
    padding: 10px 15px;
    transition: all 0.3s ease;
  }

  input:focus, textarea:focus, select:focus {
    outline: 2px solid rgba(210, 105, 30, 0.5);
    outline-offset: 2px;
    border-color: rgba(210, 105, 30, 0.6);
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 0 10px rgba(210, 105, 30, 0.2);
  }

  // 图片基础样式
  img {
    max-width: 100%;
    height: auto;
  }

  // 武侠主题标题样式
  h1, h2, h3, h4, h5, h6 {
    font-family: 'KaiTi', '楷体', serif;
    font-weight: bold;
    color: #8B4513;
  }

  .main-title {
    font-family: 'KaiTi', '楷体', serif;
    font-size: 2.5rem;
    font-weight: bold;
    color: #8B4513;
    text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
    letter-spacing: 0.2rem;
  }

  .subtitle {
    font-family: 'SimSun', '宋体', serif;
    font-size: 0.9rem;
    color: #696969;
    line-height: 1.4;
  }

  .legend-text {
    font-family: 'SimSun', '宋体', serif;
    font-size: 0.8rem;
    color: #2F4F4F;
  }

  .data-label {
    font-family: 'SimSun', '宋体', serif;
    font-size: 0.7rem;
    color: #2F4F4F;
  }

  // 响应式字体
  @media (max-width: 1920px) {
    body {
      font-size: 14px;
    }
  }

  @media (max-width: 1440px) {
    body {
      font-size: 13px;
    }
  }

  @media (max-width: 1024px) {
    body {
      font-size: 12px;
    }
  }

  // 武侠主题动画关键帧
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-30px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.02);
      opacity: 0.8;
    }
  }

  @keyframes glow {
    0%, 100% {
      box-shadow: 0 0 5px rgba(210, 105, 30, 0.3);
    }
    50% {
      box-shadow: 0 0 20px rgba(210, 105, 30, 0.6);
    }
  }

  @keyframes dataFlow {
    0% {
      transform: translateX(-100%);
      opacity: 0;
    }
    50% {
      opacity: 1;
    }
    100% {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  // 武侠主题粒子动画
  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-10px);
    }
  }

  @keyframes rotate {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  // 武侠主题卡片样式
  .wuxia-card {
    background: rgba(255, 255, 255, 0.8);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(210, 105, 30, 0.2);
    transition: all 0.3s ease;
  }

  .wuxia-card:hover {
    box-shadow: 0 8px 24px rgba(210, 105, 30, 0.2);
    transform: translateY(-2px);
  }

  // 武侠主题文本效果
  .ancient-text {
    font-family: 'KaiTi', '楷体', serif;
    color: #8B4513;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
  }

  .modern-text {
    font-family: 'SimSun', '宋体', serif;
    color: #2F4F4F;
  }
`;

// 主应用容器
const AppContainer = styled.div`
  min-height: 100vh;
  background: #F6F0E7;
  position: relative;
  overflow-x: hidden;
`;

// 错误边界组件
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <AppContainer>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
            padding: '2rem',
            textAlign: 'center',
            fontFamily: 'KaiTi, 楷体, serif'
          }}>
            <h1 style={{ color: '#CD5C5C', marginBottom: '1rem' }}>江湖出现异常</h1>
            <p style={{ color: '#696969', marginBottom: '2rem' }}>
              系统遇到了一些问题，请刷新页面重试
            </p>
            <button 
              onClick={() => window.location.reload()}
              style={{
                background: 'linear-gradient(135deg, #D2691E, #CD853F)',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1rem'
              }}
            >
              重新进入江湖
            </button>
          </div>
        </AppContainer>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <AppErrorBoundary>
      <AppContainer>
        <GlobalStyle />
        <Router>
          <Routes>
            <Route path="/" element={<DashboardHome />} />
            <Route path="/detail/:movieId?" element={<MovieDetail />} />
            <Route path="/movie/:movieId" element={<MovieDetail />} />
          </Routes>
        </Router>
      </AppContainer>
    </AppErrorBoundary>
  );
}

export default App;
