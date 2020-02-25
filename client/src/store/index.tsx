import React, { createContext, useState, useLayoutEffect } from 'react';
import { Subject } from 'rxjs';
import debounce from 'lodash/debounce';

export interface TVState {
  power: boolean;
  muted: boolean;
  volume: number;
}

const setVolume = debounce(function setVolume(volume: number) {
  fetch(`/api/volume/${volume}`, {
    method: 'POST'
  });
}, 100);

const initialState: TVState = {
  power: false,
  muted: false,
  volume: 0,
}

let state: { current: TVState } = {
  current: initialState,
};

const subject = new Subject<TVState>();

export type NavigationCommand = 'up' | 'down' | 'left' | 'right' | 'ok' | 'back' | 'exit' | 'menu';

export const store = {
  init: () => {
    subject.next(state.current);
  },
  subscribe: (setState: (state: TVState) => void) => subject.subscribe(setState),
  actions: {
    receiveState: (nextState: TVState) => { 
      state.current = nextState;
      subject.next(nextState) 
    },
    togglePower: () => {
      state.current = {
        ...state.current,
        power: !state.current.power,
      }
      subject.next(state.current);
      fetch('/api/power/toggle', { method: 'POST' });
    },
    toggleMuted: () => {
      state.current = {
        ...state.current,
        muted: !state.current.muted,
      }
      fetch('/api/mute', { method: 'POST' });
      subject.next(state.current);
    },
    setVolume: (volume: number) => {
      state.current = {
        ...state.current,
        volume, 
      }
      setVolume(volume);
      subject.next(state.current);
    },
    navigate(command: NavigationCommand) {
      fetch(`/api/navigate/${command}`, { method: 'POST' });
      if (command === 'ok') {
        fetch('/api/playpause', { method: 'POST' });
      }
    }
  },
};

export const TVContext = createContext({
  state: initialState,
  actions: store.actions
});

const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

export const TVProvider: React.FC = ({ children }) => {
  const [state, setState] = useState<TVState>(initialState);

  useLayoutEffect(() => {
    store.subscribe(setState);
    store.init();
    socket.addEventListener('message', message => {
      store.actions.receiveState(JSON.parse(message.data) as TVState)
    })
  }, []);

  return (
    <TVContext.Provider value={{
      state,
      actions: store.actions
    }}>
      {children}
    </TVContext.Provider> 
  )
}
