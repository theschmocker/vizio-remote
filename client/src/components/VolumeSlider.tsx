import React from 'react';
import styled from 'styled-components';

import Icon from './Icon';

export interface VolumeSliderProps {
  value: number;
  onChange: (value: number) => void;
};

const VolumeSlider: React.FC<VolumeSliderProps> = ({ value, onChange }) => {
  return (
    <VolumeSliderContainer>
      <Icon size="1.5rem" name="volume-off-outline" />
      <input 
        type="range" 
        min="0" 
        max="100" 
        value={value} 
        onChange={e => onChange(Number(e.target.value))} 
      />
      <Icon size="1.5rem" name="volume-high-outline" />
    </VolumeSliderContainer>
  );
}

export default VolumeSlider;

const VolumeSliderContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  
  input[type=range] {
    appearance: none;
    background: none;
    height: 2rem;
    flex: 1;

    &::-webkit-slider-thumb,
    &::-moz-range-thumb {
      appearance: none;
      border: 1px solid #666;
      border-radius: 1.5rem;
      height: 1.5rem;
      width: 1.5rem;
    }

      &::-webkit-slider-runnable-track,
      &::-moz-range-track {
        height: 0.25rem;
        width: 100%;
        cursor: pointer;
        background: #ccc;
      }
  }
`;