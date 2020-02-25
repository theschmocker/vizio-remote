import React from 'react';
import styled from 'styled-components';
import { NavigationCommand } from '../store';

import Icon from './Icon';

export interface NavigationProps {
  onNavigate: (command: NavigationCommand) => void
};

const Navigation: React.FC<NavigationProps> = ({
  onNavigate
}) => {
  const navigate = (command: NavigationCommand) => () => onNavigate(command);
  return (
    <NavigationContainer>
      <button onClick={navigate('ok')} className="ok">
        Ok
      </button>
      <button onClick={navigate('left')} className="left">
        <Icon name="caret-back-outline" />
      </button>
      <button onClick={navigate('right')} className="right">
        <Icon name="caret-forward-outline" />
      </button>
      <button onClick={navigate('up')} className="up">
        <Icon name="caret-up-outline" />
      </button>
      <button onClick={navigate('down')} className="down">
        <Icon name="caret-down-outline" />
      </button>
      <button onClick={navigate('back')} className="back">
        <Icon name="return-up-back-outline" />
      </button>
      <button onClick={navigate('menu')} className="menu">
        Menu
      </button>
      <button onClick={navigate('exit')} className="exit">
        Exit
      </button>
    </NavigationContainer>
  )
};

export default Navigation;

const NavigationContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, min-content);
  grid-template-areas: "exit  up   menu"
                       "left  ok   right"
                       "back  down .";
  width: 100%;

  button {
    appearance: none;
    border: none;
    padding: 1rem;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1rem;
    &:hover {
      background: #eee;
    }
    &:before {
      content: '';
      display: inline-block;
      width: 1px;
      height: 0;
      padding-bottom: 100%;
    }
  }
  .up {
    grid-area: up;
  }
  .down {
    grid-area: down;
  }
  .left {
    grid-area: left;
  }
  .right {
    grid-area: right;
  }
  .ok {
    grid-area: ok;
  }
  .back {
    grid-area: back;
  }
  .exit {
    grid-area: exit;
  }
  .menu {
    grid-area: menu;
  }
`;