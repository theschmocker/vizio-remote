import React from 'react';
import styled from 'styled-components';

import Icon from './Icon';

export interface PowerButtonProps {
  isOn: boolean;
  onClick: () => void;
};

const PowerButton: React.FC<PowerButtonProps> = ({ isOn, onClick }) => {
  return (
    <StyledPowerButton aria-label="Power" onClick={onClick}>
      <Icon 
        name="power-outline" 
        color={isOn ? '#bada55' : 'white'} 
        size="5rem" 
      />
    </StyledPowerButton>
  )
};

export default PowerButton;

const StyledPowerButton = styled.button`
  border: none;
  border-radius: 100%;
  width: 10rem;
  height: 10rem;
  background: #333;
  display: flex;
  justify-content: center;
  align-items: center;
`;
