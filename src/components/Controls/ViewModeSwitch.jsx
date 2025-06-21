import React from 'react';
import styled from 'styled-components';

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin: 1rem 0;
`;

const SwitchLabel = styled.span`
  font-family: 'SimSun', '宋体', serif;
  font-size: 0.9rem;
  color: #2F4F4F;
  font-weight: 500;
`;

const SwitchGroup = styled.div`
  display: flex;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 20px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  border: 1px solid rgba(210, 105, 30, 0.2);
`;

const SwitchButton = styled.button`
  background: ${props => props.$active ? 
    'linear-gradient(135deg, #D2691E, #CD853F)' : 
    'transparent'
  };
  color: ${props => props.$active ? 'white' : '#696969'};
  border: none;
  border-radius: 16px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.8rem;
  font-weight: 500;
  font-family: 'SimSun', '宋体', serif;
  box-shadow: ${props => props.$active ? 
    '0 2px 8px rgba(210, 105, 30, 0.3)' : 
    'none'
  };

  &:hover {
    background: ${props => props.$active ? 
      'linear-gradient(135deg, #CD853F, #D2691E)' : 
      'rgba(210, 105, 30, 0.1)'
    };
    transform: ${props => props.$active ? 'none' : 'translateY(-1px)'};
  }

  &:active {
    transform: translateY(0);
  }
`;

const ViewModeSwitch = ({ 
  currentMode, 
  onModeChange, 
  modes = [
    { key: 'domestic', label: '国内外对比' },
    { key: 'international', label: '不同国家' }
  ]
}) => {
  return (
    <SwitchContainer>
      <SwitchLabel>评分维度:</SwitchLabel>
      <SwitchGroup>
        {modes.map((mode) => (
          <SwitchButton
            key={mode.key}
            $active={currentMode === mode.key}
            onClick={() => onModeChange(mode.key)}
          >
            {mode.label}
          </SwitchButton>
        ))}
      </SwitchGroup>
    </SwitchContainer>
  );
};

export default ViewModeSwitch; 