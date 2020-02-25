import React, { useContext } from 'react';
import { TVContext, TVProvider } from './store';
import './App.css';

import Navigation from './components/Navigation';
import PowerButton from './components/PowerButton';
import VolumeSlider from './components/VolumeSlider';

const Remote: React.FC = () => {
  const { state, actions } = useContext(TVContext);

  return (
    <div>
      <PowerButton isOn={state.power} onClick={actions.togglePower} />
      {state.power &&
        <>
          <Navigation onNavigate={actions.navigate} />
          <VolumeSlider
            value={state.volume}
            onChange={actions.setVolume}
          />
          <button onClick={actions.toggleMuted}>{state.muted ? 'Unmute' : 'Mute'}</button>
        </>
      }
    </div>
  )
}

function App() {
  return (
    <TVProvider>
      <div className="App">
        <Remote />
      </div>
    </TVProvider>
  );
}

export default App;
