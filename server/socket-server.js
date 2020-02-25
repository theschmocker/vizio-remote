const WebSocket = require('ws');
const { BehaviorSubject } = require('rxjs');
const { pairwise, filter, map, tap } = require('rxjs/operators');

const areDifferent = ([a, b]) => {
    if (!a || !b) return true;

    return Object.entries(a).reduce((hasChanged, [key, value]) => {
        return hasChanged || b[key] !== value
    }, false)
}

async function getTVState(tv) {
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

const tvState = new BehaviorSubject(null);

const tvStateFilter = new BehaviorSubject(null).pipe(
    pairwise(),
    filter(areDifferent),
    map(([_previous, next]) => next),
);
tvStateFilter.subscribe(state => tvState.next(state));

function pollTV(tv) {
    return setInterval(async () => {
        const nextState = await getTVState(tv);
        tvStateFilter.next(nextState);
    }, 300);
}

function setupSocketServer(server, tv) {
    const wss = new WebSocket.Server({ server });

    let interval;

    wss.on('connection', async function connection(ws) {
        if (interval == null) {
            interval = pollTV(tv);
        }

        const subscription = tvState.subscribe(async state => {
            if (!state) {
                return tvStateFilter.next(await getTVState(tv));
            }

            ws.send(JSON.stringify(state))
        });

        ws.on('close', () => {
            subscription.unsubscribe();
            if ([...wss.clients].length === 0) {
                clearInterval(interval);
                interval = null;
            }
        })
    });

    tvState.subscribe(state => {
        wss.clients.forEach(ws => ws.send(JSON.stringify(state)))
    });

    return wss;
}

module.exports = {
    setupSocketServer,
}