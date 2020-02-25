const http = require('http');
const smartcast = require('vizio-smart-cast');

const express = require('express');
const app = express();
const router = express.Router();

const { setupSocketServer } = require('./socket-server');

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

const server = http.createServer(app);

setupSocketServer(server, tv);

server.listen(3000, () => {
  console.log('Listening on port 3000');
});