const smartcast = require('vizio-smart-cast');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

const tvConfig = require('./tv-data.json');
const tv = new smartcast(tvConfig.ip, tvConfig.authToken);

// https://github.com/exiva/Vizio_SmartCast_API/issues/8
tv.control.navigate.up = function() {
    return tv.control.keyCommand(3, 8);
}

tv.control.navigate.right = function() {
    return tv.control.keyCommand(3, 7);
}

tv.control.navigate.exit = function() {
    return tv.control.keyCommand(4, 3);
}

async function getTVState() {
  const powerReq = tv.power.currentMode().then(response => {
    return !!response.ITEMS[0].VALUE;
  })

  const audioSettings = tv.settings.audio.get();

  const [power, settings] = await Promise.all([powerReq, audioSettings]);

  const muted = settings.ITEMS.find(item => item.CNAME === 'mute').VALUE !== 'Off';
  const volume = settings.ITEMS.find(item => item.CNAME === 'volume').VALUE; 

  return {
    power,
    muted, 
    volume,
  }
}

// TODO: can probably replace this this wss.clients
const subscribers = [];

let state;

wss.on('connection', async function connection(ws) {
  subscribers.push(ws);

  const state = await getTVState();

  ws.send(JSON.stringify(state));

  ws.on('close', () => {
    const index = subscribers.findIndex(sub => sub === ws);
    subscribers.splice(index, 1);
  })
});

// TODO: should only run when there are socket clients connected
setInterval(async () => {
  const nextState = await getTVState();

  if (!state) {
    state = nextState;
  }

  const hasChanged = Object.entries(nextState).reduce((hasChanged, [key, value]) => {
    return hasChanged || state[key] !== value
  }, false)

  if (hasChanged) {
    state = nextState;
    subscribers.forEach(ws => {
      ws.send(JSON.stringify(nextState));
    });
  }

}, 500);

const express = require('express');
const app = express();
const router = express.Router();

// TODO: setup server for front end code outside of dev
router.get('/', (_req, res) => {
  res.send('Server Up');
});

router.get('/power', async (_req, res) => {
  const state = await tv.power.currentMode();

  res.send(state);
})

router.post('/power/:command', async (req, res) => {
  const { command } = req.params;

  if (!['on', 'off', 'toggle'].includes(command)) {
    return res.status(400).send({
      message: 'Invalid command. Use "on" or "off"'
    });
  }

  const tvResponse = await tv.control.power[command]();

  res.send(tvResponse);
})

router.post('/volume/:volume', async (req, res) => {
  const tvResponse = await tv.control.volume.set(Number(req.params.volume));

  res.send(tvResponse);
})

router.post('/mute', async (_req, res) => {
  const tvResponse = await tv.control.volume.mute();

  res.send(tvResponse);
})

router.post('/playpause', async (_req, res) => {
  const tvResponse = await tv.control.media.play();

  res.send(tvResponse);
})

router.post('/navigate/:command', async (req, res) => {
  const { command } = req.params;

  if (command === 'menu') {
    const tvResponse = await tv.control.menu();

    return res.send({ tvResponse });
  }

  if (!Object.keys(tv.control.navigate).includes(command)) {
    return res.status(400).send({
      message: 'Invalid command.'
    });
  }
  
router.get('/info', async (_req, res) => {
  res.send({
    audio: await tv.settings.audio.get(),
    network: await tv.settings.network.get(),
    system: await tv.settings.system.get(),
    tv: await tv.settings.system.information.tv.get(),
    info: await tv.settings.system.information.get(),
  });
})

  const tvResponse = await tv.control.navigate[command]();

  res.send({ tvResponse });
})

app.use('/api', router);

app.listen(3000);
