import React from 'react';
import styled from 'styled-components';

interface IconProps {
  name: string;
  color?: string;
  size?: string;
};

const IconWrapper = styled.span<IconProps>`
  ion-icon {
    font-size: ${props => props.size ?? 'inherit'};
    color: ${props => props.color ?? 'currentColor'};
  }
`;

const Icon: React.FC<IconProps> = ({ children, ...props }) => {
  const Icon = 'ion-icon' as any;

  return ( 
    <IconWrapper {...props}>
      <Icon name={props.name} />
    </IconWrapper>
  );
};

export default Icon;